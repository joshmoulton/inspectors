import prisma from '@/lib/prisma';
import { Map, MapPin, Navigation, Clock, Users } from 'lucide-react';

export default async function RoutesPage() {
    const inspectors = await prisma.user.findMany({
        where: { role: 'inspector' },
        include: {
            orders: {
                where: { status: 'Open' },
                select: { id: true },
            }
        },
        orderBy: { firstName: 'asc' },
    });

    const totalOpenOrders = inspectors.reduce((sum, i) => sum + i.orders.length, 0);

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Routes & Scheduling</h1>
                    <p className="page-subtitle">Manage inspector routes, optimize scheduling, and track field operations.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary"><Navigation size={16} /> Auto-Route</button>
                    <button className="btn btn-primary"><Map size={16} /> Plan Routes</button>
                </div>
            </header>

            {/* Stats Row */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--brand-primary-light)' }}>
                        <MapPin size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{totalOpenOrders}</div>
                        <div className="stat-label">Active Stops</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)' }}>
                        <Users size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{inspectors.length}</div>
                        <div className="stat-label">Active Inspectors</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--status-warning)' }}>
                        <Clock size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">2.4</div>
                        <div className="stat-label">Avg. Stops/Day</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--status-purple)' }}>
                        <Navigation size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">18.5</div>
                        <div className="stat-label">Avg. Miles/Route</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                {/* Inspector List */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 14 }}>
                        Inspectors
                    </div>
                    <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                        {inspectors.map((inspector) => (
                            <div key={inspector.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)',
                                cursor: 'pointer', transition: 'background 0.15s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: 'rgba(99, 102, 241, 0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 700, color: 'var(--brand-primary-light)'
                                    }}>
                                        {inspector.firstName[0]}{inspector.lastName[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{inspector.firstName} {inspector.lastName}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inspector.orders.length} open orders</div>
                                    </div>
                                </div>
                                <span className={`badge ${inspector.orders.length > 0 ? 'badge-success' : 'badge-gray'}`}>
                                    {inspector.orders.length > 0 ? 'Active' : 'Available'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map Placeholder */}
                <div className="card" style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: 500, background: 'var(--bg-surface)', textAlign: 'center'
                }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: 20,
                        background: 'rgba(99, 102, 241, 0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 20, color: 'var(--text-tertiary)'
                    }}>
                        <Map size={36} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Map View</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 320, lineHeight: 1.5 }}>
                        Interactive map integration coming soon. Select an inspector from the list to view their assigned route and optimize stop order.
                    </p>
                    <button className="btn btn-secondary" style={{ marginTop: 20 }}>
                        <MapPin size={14} /> Preview Route Data
                    </button>
                </div>
            </div>
        </div>
    );
}
