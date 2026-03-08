import prisma from '@/lib/prisma';

export default async function ReportsPage() {
    const [orderStats, clientStats] = await Promise.all([
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

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Visual overview of operational performance and client volume.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">Download PDF</button>
                    <button className="btn btn-primary">Schedule Report</button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Status Distribution */}
                <div className="card glass p-6">
                    <h3 className="text-lg font-bold mb-6 border-b border-white/5 pb-2">Order Status Distribution</h3>
                    <div className="space-y-4">
                        {orderStats.map((stat: { status: string; _count: number }) => (
                            <div key={stat.status} className="flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{stat.status}</span>
                                    <span className="font-mono text-muted">{stat._count}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${(stat._count / orderStats.reduce((acc: number, s: { _count: number }) => acc + s._count, 0)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Clients by Volume */}
                <div className="card glass p-6">
                    <h3 className="text-lg font-bold mb-6 border-b border-white/5 pb-2">Top Clients by Volume</h3>
                    <div className="space-y-4">
                        {clientStats.map((client: any) => (
                            <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <div>
                                    <div className="font-bold text-sm">{client.name}</div>
                                    <div className="text-[10px] text-muted uppercase font-mono">{client.code}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-primary">{client._count.orders}</div>
                                    <div className="text-[10px] text-muted uppercase">Orders</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operational Efficiency (Mock) */}
                <div className="card glass p-6 md:col-span-2">
                    <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-2">Operational Snapshots</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4">
                        <ReportStat label="Avg Turnaround" value="2.4 Days" trend="+0.2" />
                        <ReportStat label="Approval Rate" value="98.2%" trend="+1.5%" />
                        <ReportStat label="Inspector Coverage" value="84%" trend="-2%" />
                        <ReportStat label="Revenue (MTD)" value="$12,450" trend="+12%" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReportStat({ label, value, trend }: { label: string; value: string; trend: string }) {
    const isPositive = trend.startsWith('+');
    return (
        <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-muted mb-1">{label}</div>
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className={`text-[10px] font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                {isPositive ? '↑' : '↓'} {trend}
            </div>
        </div>
    );
}
