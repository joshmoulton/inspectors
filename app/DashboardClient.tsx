'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    ClipboardList, Clock, CheckCircle, AlertTriangle, Plus, Upload, BarChart3,
    FileText, UserCheck, Edit, ArrowRight
} from 'lucide-react';

interface DashboardClientProps {
    stats: {
        totalOrders: number;
        openOrders: number;
        completedOrders: number;
        pendingQC: number;
    };
    recentOrders: any[];
    chartData: { name: string; orders: number }[];
    recentActivity: { id: string; action: string; details: string | null; createdAt: string; orderNumber?: string }[];
}

const statConfig = [
    { key: 'totalOrders', label: 'Total Orders', icon: ClipboardList, color: 'var(--brand-primary-light)', bg: 'rgba(99, 102, 241, 0.12)' },
    { key: 'openOrders', label: 'Open Orders', icon: Clock, color: 'var(--status-warning)', bg: 'rgba(245, 158, 11, 0.12)' },
    { key: 'completedOrders', label: 'Completed', icon: CheckCircle, color: 'var(--status-success)', bg: 'rgba(16, 185, 129, 0.12)' },
    { key: 'pendingQC', label: 'Pending QC', icon: AlertTriangle, color: 'var(--status-info)', bg: 'rgba(59, 130, 246, 0.12)' },
];

export default function DashboardClient({ stats, recentOrders, chartData, recentActivity }: DashboardClientProps) {
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome back. Here&apos;s what&apos;s happening today.</p>
                </motion.div>
                <motion.div className="header-actions" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Link href="/orders/new" className="btn btn-primary"><Plus size={16} /> New Order</Link>
                </motion.div>
            </header>

            {/* Stats Grid */}
            <motion.div className="stats-grid" variants={container} initial="hidden" animate="show">
                {statConfig.map((stat) => {
                    const Icon = stat.icon;
                    const value = stats[stat.key as keyof typeof stats];
                    return (
                        <motion.div key={stat.key} variants={item} className="stat-card">
                            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                                <Icon size={22} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value" style={{ color: stat.key === 'totalOrders' ? 'var(--text-primary)' : stat.color }}>
                                    {value}
                                </div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                className="quick-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Link href="/orders/new" className="quick-action-card">
                    <div className="quick-action-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--brand-primary-light)' }}>
                        <Plus size={20} />
                    </div>
                    <div>
                        <div className="quick-action-label">New Order</div>
                        <div className="quick-action-sublabel">Create inspection</div>
                    </div>
                </Link>
                <Link href="/import" className="quick-action-card">
                    <div className="quick-action-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)' }}>
                        <Upload size={20} />
                    </div>
                    <div>
                        <div className="quick-action-label">Import Orders</div>
                        <div className="quick-action-sublabel">Bulk CSV upload</div>
                    </div>
                </Link>
                <Link href="/reports" className="quick-action-card">
                    <div className="quick-action-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--status-purple)' }}>
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <div className="quick-action-label">View Reports</div>
                        <div className="quick-action-sublabel">Analytics & stats</div>
                    </div>
                </Link>
            </motion.div>

            {/* Chart + Activity Grid */}
            <div className="grid-2-col" style={{ marginBottom: 24 }}>
                {/* Area Chart */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 24 }}
                    style={{ minWidth: 0 }}
                >
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Order Volume</h2>
                                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Last 30 Days</p>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            backdropFilter: 'blur(10px)',
                                            fontSize: 13
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrders)" animationDuration={1500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.section>

                {/* Recent Activity */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 24 }}
                    style={{ minWidth: 0 }}
                >
                    <div className="card" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Activity</h2>
                        </div>
                        <div className="activity-feed" style={{ flex: 1, overflow: 'auto' }}>
                            {recentActivity.length > 0 ? recentActivity.map((entry) => (
                                <div key={entry.id} className="activity-item">
                                    <div className="activity-icon" style={{
                                        background: getActivityColor(entry.action).bg,
                                        color: getActivityColor(entry.action).color
                                    }}>
                                        {getActivityIcon(entry.action)}
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-text">
                                            <strong>{entry.action}</strong>
                                            {entry.orderNumber && (
                                                <span style={{ color: 'var(--brand-primary-light)', marginLeft: 4 }}>#{entry.orderNumber}</span>
                                            )}
                                        </div>
                                        {entry.details && <div className="activity-time">{entry.details}</div>}
                                        <div className="activity-time">{formatTimeAgo(entry.createdAt)}</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: 13 }}>
                                    No recent activity
                                </div>
                            )}
                        </div>
                    </div>
                </motion.section>
            </div>

            {/* Recent Orders */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 24 }}
            >
                <div className="section-header" style={{ marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Orders</h2>
                    <Link href="/orders" style={{ fontSize: 13, color: 'var(--brand-primary-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        View all <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className="table-scroll">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Client</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td style={{ fontWeight: 700, color: 'var(--brand-primary-light)' }}>
                                            <Link href={`/orders/${order.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{order.orderNumber}</Link>
                                        </td>
                                        <td>{order.client?.name || '---'}</td>
                                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.address1}, {order.city}</td>
                                        <td>
                                            <span className={`badge badge-${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '---'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}

function getStatusColor(status: string) {
    if (status.includes('Completed')) return 'success';
    if (status === 'Open') return 'warning';
    if (status === 'Cancelled') return 'danger';
    if (status === 'Unassigned') return 'info';
    return 'brand';
}

function getActivityIcon(action: string) {
    if (action.includes('Created')) return <Plus size={14} />;
    if (action.includes('Updated')) return <Edit size={14} />;
    if (action.includes('Completed') || action.includes('Approved')) return <CheckCircle size={14} />;
    if (action.includes('Assigned')) return <UserCheck size={14} />;
    if (action.includes('Uploaded') || action.includes('Photo')) return <FileText size={14} />;
    return <ClipboardList size={14} />;
}

function getActivityColor(action: string) {
    if (action.includes('Created')) return { bg: 'rgba(99, 102, 241, 0.12)', color: 'var(--brand-primary-light)' };
    if (action.includes('Completed') || action.includes('Approved')) return { bg: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)' };
    if (action.includes('Cancelled')) return { bg: 'rgba(239, 68, 68, 0.12)', color: 'var(--status-danger)' };
    return { bg: 'rgba(59, 130, 246, 0.12)', color: 'var(--status-info)' };
}

function formatTimeAgo(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
