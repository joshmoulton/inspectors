import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ArrowLeft, Building2, ClipboardList, DollarSign, CheckCircle,
    Clock, Mail, Phone, Calendar, Users, ExternalLink
} from 'lucide-react';

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            contacts: { orderBy: { firstName: 'asc' } },
            logins: true,
            orders: {
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    address1: true,
                    city: true,
                    state: true,
                    type: true,
                    clientPay: true,
                    inspectorPay: true,
                    dueDate: true,
                    completedDate: true,
                    inspector: { select: { firstName: true, lastName: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 100,
            },
            _count: { select: { orders: true } },
        },
    });

    if (!client) return notFound();

    const totalOrders = client._count.orders;
    const openOrders = client.orders.filter(o => o.status === 'Open' || o.status === 'Unassigned').length;
    const completedOrders = client.orders.filter(o => o.status.includes('Completed') || o.status === 'Paid' || o.status === 'Submitted to Client').length;
    const totalRevenue = client.orders.reduce((sum, o) => sum + (o.clientPay || 0), 0);
    const totalCost = client.orders.reduce((sum, o) => sum + (o.inspectorPay || 0), 0);
    const profit = totalRevenue - totalCost;

    return (
        <div className="page-container">
            <Link href="/clients" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16,
                textDecoration: 'none',
            }}>
                <ArrowLeft size={14} /> Back to Clients
            </Link>

            {/* Header */}
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 24, flexWrap: 'wrap', gap: 16,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 12,
                        background: 'rgba(99, 102, 241, 0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <Building2 size={26} style={{ color: 'var(--brand-primary-light)' }} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <h1 className="page-title" style={{ margin: 0 }}>{client.name}</h1>
                            {client.code && (
                                <span style={{
                                    fontFamily: 'monospace', fontSize: 12, padding: '2px 8px',
                                    background: 'rgba(255,255,255,0.06)', borderRadius: 6,
                                    color: 'var(--text-tertiary)',
                                }}>
                                    {client.code}
                                </span>
                            )}
                            <span className={`badge badge-${client.active ? 'success' : 'gray'}`}>
                                {client.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4, display: 'flex', gap: 12 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={13} /> Since {new Date(client.createdAt).toLocaleDateString()}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Users size={13} /> {client.contacts.length} contact{client.contacts.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/orders?client=${id}`} className="btn btn-secondary">
                        <ClipboardList size={14} /> View All Orders
                    </Link>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--brand-primary-light)' }}>
                        <ClipboardList size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{totalOrders.toLocaleString()}</div>
                        <div className="stat-label">Total Orders</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--status-warning)' }}>
                        <Clock size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{openOrders}</div>
                        <div className="stat-label">Open / Unassigned</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)' }}>
                        <DollarSign size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                        <div className="stat-label">Total Revenue</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--status-purple)' }}>
                        <DollarSign size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value" style={{ color: profit >= 0 ? 'var(--status-success)' : 'var(--status-danger)' }}>
                            ${profit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div className="stat-label">Profit</div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid-2-col" style={{ marginBottom: 24 }}>
                {/* Contacts */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700 }}>Contacts</h2>
                        <Link href="/contacts" style={{ fontSize: 12, color: 'var(--brand-primary-light)', textDecoration: 'none' }}>
                            Manage
                        </Link>
                    </div>
                    {client.contacts.length === 0 ? (
                        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                            No contacts linked to this client.
                        </div>
                    ) : (
                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                            {client.contacts.map(contact => (
                                <div key={contact.id} style={{
                                    padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                                            {contact.firstName} {contact.lastName}
                                        </div>
                                        {contact.title && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{contact.title}</div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>
                                        {contact.email && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Mail size={11} /> {contact.email}
                                            </span>
                                        )}
                                        {contact.phone && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Phone size={11} /> {contact.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Logins */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700 }}>Portal Logins</h2>
                    </div>
                    {client.logins.length === 0 ? (
                        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                            No portal logins configured.
                        </div>
                    ) : (
                        <div>
                            {client.logins.map(login => (
                                <div key={login.id} style={{
                                    padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)',
                                    fontSize: 13,
                                }}>
                                    {login.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>Recent Orders</h2>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        Showing latest {Math.min(client.orders.length, 100)} of {totalOrders.toLocaleString()}
                    </span>
                </div>
                {client.orders.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        No orders yet for this client.
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Type</th>
                                <th>Address</th>
                                <th>Inspector</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Client Pay</th>
                                <th>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {client.orders.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <Link href={`/orders/${order.id}`} style={{ color: 'var(--brand-primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                                            #{order.orderNumber}
                                        </Link>
                                    </td>
                                    <td style={{ fontSize: 12 }}>{order.type}</td>
                                    <td style={{ fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {order.address1 || '---'}, {order.city}, {order.state}
                                    </td>
                                    <td style={{ fontSize: 13 }}>
                                        {order.inspector
                                            ? `${order.inspector.firstName} ${order.inspector.lastName}`
                                            : <span style={{ color: 'var(--text-tertiary)' }}>Unassigned</span>}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${getStatusColor(order.status)}`} style={{ fontSize: 11 }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 13, color: 'var(--status-success)' }}>
                                        {order.clientPay ? `$${order.clientPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '---'}
                                    </td>
                                    <td style={{ fontSize: 13 }}>
                                        {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '---'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    if (status.includes('Approved') || status === 'Paid') return 'success';
    if (status.includes('Completed')) return 'purple';
    if (status === 'Open') return 'info';
    if (status === 'Unassigned') return 'warning';
    if (status === 'Cancelled') return 'danger';
    if (status === 'Submitted to Client') return 'brand';
    return 'gray';
}
