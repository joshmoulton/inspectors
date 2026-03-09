'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, FileText, ExternalLink } from 'lucide-react';

interface OrderRow {
    id: string;
    orderNumber: string;
    status: string;
    address: string;
    clientName: string;
    clientCode: string;
    type: string;
    dueDate?: string | null;
    completedDate?: string | null;
    daysOverdue?: number;
}

interface InspectorTabsProps {
    openOrders: OrderRow[];
    pastDueOrders: OrderRow[];
    completedOrders: OrderRow[];
}

export default function InspectorTabs({ openOrders, pastDueOrders, completedOrders }: InspectorTabsProps) {
    const [activeTab, setActiveTab] = useState<'open' | 'pastdue' | 'completed'>('open');

    const tabs = [
        { key: 'open' as const, label: 'Open / Active', count: openOrders.length, icon: <FileText size={14} /> },
        { key: 'pastdue' as const, label: 'Past Due', count: pastDueOrders.length, icon: <AlertTriangle size={14} />, danger: pastDueOrders.length > 0 },
        { key: 'completed' as const, label: 'Completed', count: completedOrders.length, icon: <CheckCircle size={14} /> },
    ];

    return (
        <>
            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-surface)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '8px 16px', borderRadius: 8, border: 'none',
                            background: activeTab === tab.key ? (tab.danger && tab.key === 'pastdue' ? 'var(--status-danger)' : 'var(--brand-primary)') : 'transparent',
                            color: activeTab === tab.key ? 'white' : 'var(--text-tertiary)',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer',
                            transition: 'all 150ms ease',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                        <span style={{
                            background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : (tab.danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.08)'),
                            color: activeTab === tab.key ? 'white' : (tab.danger ? 'var(--status-danger)' : 'var(--text-tertiary)'),
                            padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                        }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Open Orders Table */}
            {activeTab === 'open' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {openOrders.length === 0 ? (
                        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                            No open orders assigned to this inspector.
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Type</th>
                                    <th>Address</th>
                                    <th>Client</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {openOrders.map(order => {
                                    const dueDate = order.dueDate ? new Date(order.dueDate) : null;
                                    const now = new Date();
                                    const isOverdue = dueDate && dueDate < now;
                                    const daysUntil = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

                                    return (
                                        <tr key={order.id}>
                                            <td>
                                                <Link href={`/orders/${order.id}`} style={{ color: 'var(--brand-primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                                                    #{order.orderNumber}
                                                </Link>
                                            </td>
                                            <td style={{ fontSize: 12 }}>{order.type}</td>
                                            <td style={{ fontSize: 13, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {order.address || '---'}
                                            </td>
                                            <td>
                                                <div style={{ fontSize: 13 }}>{order.clientName}</div>
                                                {order.clientCode && <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{order.clientCode}</div>}
                                            </td>
                                            <td>
                                                {dueDate ? (
                                                    <div>
                                                        <div style={{ fontSize: 13 }}>{dueDate.toLocaleDateString()}</div>
                                                        {isOverdue ? (
                                                            <span className="badge badge-danger" style={{ fontSize: 10, marginTop: 2 }}>
                                                                {Math.abs(daysUntil!)}d overdue
                                                            </span>
                                                        ) : daysUntil !== null && daysUntil <= 3 ? (
                                                            <span className="badge badge-warning" style={{ fontSize: 10, marginTop: 2 }}>
                                                                {daysUntil}d left
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-tertiary)' }}>---</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${order.status === 'Open' ? 'info' : 'warning'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Past Due Table */}
            {activeTab === 'pastdue' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {pastDueOrders.length === 0 ? (
                        <div style={{ padding: 48, textAlign: 'center', color: 'var(--status-success)' }}>
                            <CheckCircle size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                            <div>No past due orders. This inspector is up to date.</div>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Type</th>
                                    <th>Address</th>
                                    <th>Client</th>
                                    <th>Due Date</th>
                                    <th>Days Overdue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pastDueOrders.map(order => (
                                    <tr key={order.id} style={{ background: 'rgba(239, 68, 68, 0.03)' }}>
                                        <td>
                                            <Link href={`/orders/${order.id}`} style={{ color: 'var(--brand-primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                                                #{order.orderNumber}
                                            </Link>
                                        </td>
                                        <td style={{ fontSize: 12 }}>{order.type}</td>
                                        <td style={{ fontSize: 13, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {order.address || '---'}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>{order.clientName}</div>
                                            {order.clientCode && <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{order.clientCode}</div>}
                                        </td>
                                        <td style={{ fontSize: 13 }}>
                                            {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '---'}
                                        </td>
                                        <td>
                                            <span className="badge badge-danger" style={{
                                                fontSize: 12, fontWeight: 700,
                                                padding: '4px 10px',
                                            }}>
                                                <AlertTriangle size={12} style={{ marginRight: 4 }} />
                                                {order.daysOverdue}d overdue
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Completed Orders Table */}
            {activeTab === 'completed' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {completedOrders.length === 0 ? (
                        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                            No completed orders yet.
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Type</th>
                                    <th>Address</th>
                                    <th>Client</th>
                                    <th>Completed</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {completedOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>
                                            <Link href={`/orders/${order.id}`} style={{ color: 'var(--brand-primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                                                #{order.orderNumber}
                                            </Link>
                                        </td>
                                        <td style={{ fontSize: 12 }}>{order.type}</td>
                                        <td style={{ fontSize: 13, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {order.address || '---'}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>{order.clientName}</div>
                                            {order.clientCode && <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{order.clientCode}</div>}
                                        </td>
                                        <td style={{ fontSize: 13 }}>
                                            {order.completedDate ? new Date(order.completedDate).toLocaleDateString() : '---'}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${order.status.includes('Approved') ? 'success' : order.status.includes('Rejected') ? 'danger' : 'purple'}`}>
                                                {order.status.replace('Completed ', '')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </>
    );
}
