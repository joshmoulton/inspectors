'use client';

import { useState } from 'react';
import {
    BarChart3, TrendingUp, TrendingDown, FileText, Download, Calendar,
    Users, DollarSign, Clock, CheckCircle, ChevronDown
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';

interface ReportsClientProps {
    orderStats: { status: string; _count: number }[];
    clientStats: any[];
    inspectorStats: { name: string; total: number; open: number; completed: number }[];
    monthlyData: { month: string; count: number }[];
    totalOrders: number;
    avgTurnaround: number;
    approvalRate: number;
    inspectorCoverage: number;
    totalRevenue: number;
}

const STATUS_COLORS: Record<string, string> = {
    'Open': '#6366f1',
    'Unassigned': '#f59e0b',
    'Completed Pending Approval': '#8b5cf6',
    'Completed Approved': '#10b981',
    'Completed Rejected': '#ef4444',
    'Submitted to Client': '#06b6d4',
    'Paid': '#14b8a6',
    'Cancelled': '#6b7280',
};

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6', '#f97316'];

export default function ReportsClient({
    orderStats, clientStats, inspectorStats, monthlyData,
    totalOrders, avgTurnaround, approvalRate, inspectorCoverage, totalRevenue,
}: ReportsClientProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'inspectors'>('overview');

    function handleExportCSV() {
        const rows = [['Status', 'Count']];
        for (const s of orderStats) rows.push([s.status, String(s._count)]);
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report exported as CSV');
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Visual overview of operational performance and client volume.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleExportCSV}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </header>

            {/* Stats Row */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--brand-primary-light)' }}>
                        <Clock size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{avgTurnaround} Days</div>
                        <div className="stat-label">Avg Turnaround</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)' }}>
                        <CheckCircle size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{approvalRate}%</div>
                        <div className="stat-label">Approval Rate</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--status-purple)' }}>
                        <Users size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{inspectorCoverage}%</div>
                        <div className="stat-label">Inspector Coverage</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)' }}>
                        <DollarSign size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">${(totalRevenue / 1000).toFixed(1)}K</div>
                        <div className="stat-label">Total Revenue</div>
                    </div>
                </div>
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-surface)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
                {(['overview', 'clients', 'inspectors'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '8px 20px', borderRadius: 8, border: 'none',
                            background: activeTab === tab ? 'var(--brand-primary)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text-tertiary)',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer',
                            transition: 'all 150ms ease',
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <>
                    <div className="grid-2-col" style={{ marginBottom: 24 }}>
                        {/* Monthly Trend */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BarChart3 size={18} /> Monthly Order Volume
                            </h3>
                            <div style={{ width: '100%', height: 280 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '8px', fontSize: 13,
                                            }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Status Pie Chart */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FileText size={18} /> Status Distribution
                            </h3>
                            <div style={{ width: '100%', height: 280, display: 'flex', alignItems: 'center' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={orderStats.map(s => ({ name: s.status, value: s._count }))}
                                            cx="50%" cy="50%"
                                            innerRadius={60} outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {orderStats.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '8px', fontSize: 13,
                                            }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 8 }}>
                                {orderStats.map((s, i) => (
                                    <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span style={{ color: 'var(--text-tertiary)' }}>{s.status}</span>
                                        <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{s._count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Status Bars */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Order Status Breakdown</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {orderStats.sort((a, b) => b._count - a._count).map((stat) => (
                                <div key={stat.status}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                        <span style={{ fontWeight: 500 }}>{stat.status}</span>
                                        <span style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>
                                            {stat._count.toLocaleString()} ({totalOrders > 0 ? ((stat._count / totalOrders) * 100).toFixed(1) : 0}%)
                                        </span>
                                    </div>
                                    <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            background: STATUS_COLORS[stat.status] || 'var(--text-tertiary)',
                                            borderRadius: 3,
                                            width: `${totalOrders > 0 ? (stat._count / totalOrders) * 100 : 0}%`,
                                            transition: 'width 0.5s ease',
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'clients' && (
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} /> Top Clients by Volume
                    </h3>
                    <div style={{ width: '100%', height: 400, marginBottom: 24 }}>
                        <ResponsiveContainer>
                            <BarChart data={clientStats.map(c => ({ name: c.code || c.name.slice(0, 12), orders: c._count.orders }))} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} angle={-45} textAnchor="end" />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px', fontSize: 13,
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {clientStats.map((client: any, i: number) => (
                            <div key={client.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px', borderRadius: 10,
                                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{
                                        width: 28, height: 28, borderRadius: '50%', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: 12,
                                        fontWeight: 700, background: 'rgba(99, 102, 241, 0.12)',
                                        color: 'var(--brand-primary-light)',
                                    }}>
                                        {i + 1}
                                    </span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{client.name}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontFamily: 'monospace', marginTop: 2 }}>{client.code}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-primary-light)' }}>{client._count.orders.toLocaleString()}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Orders</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'inspectors' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={18} /> Inspector Performance
                        </h3>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Inspector</th>
                                <th style={{ textAlign: 'right' }}>Total Orders</th>
                                <th style={{ textAlign: 'right' }}>Open</th>
                                <th style={{ textAlign: 'right' }}>Completed</th>
                                <th style={{ textAlign: 'right' }}>Completion Rate</th>
                                <th>Workload</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inspectorStats.map((insp) => {
                                const rate = insp.total > 0 ? Math.round((insp.completed / insp.total) * 100) : 0;
                                return (
                                    <tr key={insp.name}>
                                        <td style={{ fontWeight: 600 }}>{insp.name}</td>
                                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{insp.total}</td>
                                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--status-warning)' }}>{insp.open}</td>
                                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--status-success)' }}>{insp.completed}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span style={{
                                                fontWeight: 700, fontSize: 12,
                                                color: rate >= 80 ? 'var(--status-success)' : rate >= 50 ? 'var(--status-warning)' : 'var(--status-danger)',
                                            }}>
                                                {rate}%
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ width: 100, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%', borderRadius: 3, width: `${Math.min(100, rate)}%`,
                                                    background: rate >= 80 ? 'var(--status-success)' : rate >= 50 ? 'var(--status-warning)' : 'var(--status-danger)',
                                                }} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
