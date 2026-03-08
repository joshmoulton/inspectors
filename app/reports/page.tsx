import prisma from '@/lib/prisma';
import { BarChart3, TrendingUp, TrendingDown, FileText, Download, Calendar } from 'lucide-react';

export default async function ReportsPage() {
    let orderStats: any[] = [];
    let clientStats: any[] = [];
    try {
        [orderStats, clientStats] = await Promise.all([
            prisma.workOrder.groupBy({
                by: ['status'],
                _count: true,
            }),
            prisma.client.findMany({
                include: {
                    _count: {
                        select: { orders: true }
                    }
                },
                orderBy: { orders: { _count: 'desc' } },
                take: 5
            })
        ]);
    } catch {
        // Fallback to empty data on DB error
    }

    const totalOrders = orderStats.reduce((acc: number, s: { _count: number }) => acc + s._count, 0);

    function getStatusColor(status: string) {
        const colors: Record<string, string> = {
            'Open': 'var(--brand-primary-light)',
            'Unassigned': 'var(--status-warning)',
            'Completed Pending Approval': 'var(--status-purple)',
            'Completed Approved': 'var(--status-success)',
            'Submitted to Client': '#06b6d4',
            'Paid': '#14b8a6',
        };
        return colors[status] || 'var(--text-tertiary)';
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Visual overview of operational performance and client volume.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary"><Download size={16} /> Download PDF</button>
                    <button className="btn btn-primary"><Calendar size={16} /> Schedule Report</button>
                </div>
            </header>

            {/* Stats Row */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <ReportStat label="Avg Turnaround" value="2.4 Days" trend="+0.2" positive={false} />
                <ReportStat label="Approval Rate" value="98.2%" trend="+1.5%" positive={true} />
                <ReportStat label="Inspector Coverage" value="84%" trend="-2%" positive={false} />
                <ReportStat label="Revenue (MTD)" value="$12,450" trend="+12%" positive={true} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Order Status Distribution */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BarChart3 size={18} /> Order Status Distribution
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {orderStats.map((stat: { status: string; _count: number }) => (
                            <div key={stat.status}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                    <span style={{ fontWeight: 500 }}>{stat.status}</span>
                                    <span style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{stat._count}</span>
                                </div>
                                <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        background: getStatusColor(stat.status),
                                        borderRadius: 3,
                                        width: `${totalOrders > 0 ? (stat._count / totalOrders) * 100 : 0}%`,
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Clients by Volume */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} /> Top Clients by Volume
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {clientStats.map((client: any) => (
                            <div key={client.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px', borderRadius: 10,
                                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)'
                            }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{client.name}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontFamily: 'monospace', marginTop: 2 }}>{client.code}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-primary-light)' }}>{client._count.orders}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Orders</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReportStat({ label, value, trend, positive }: { label: string; value: string; trend: string; positive: boolean }) {
    return (
        <div className="stat-card">
            <div className="stat-content" style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
                <div className="stat-value">{value}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4, fontSize: 11, fontWeight: 600, color: positive ? 'var(--status-success)' : 'var(--status-danger)' }}>
                    {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {trend}
                </div>
            </div>
        </div>
    );
}
