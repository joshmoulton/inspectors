'use client';

import { useState, useMemo, Suspense, lazy } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Clock, Users, Phone, ChevronRight, Eye, ExternalLink, Map } from 'lucide-react';

const RouteMap = lazy(() => import('@/components/RouteMap'));

interface OrderLocation {
    id: string;
    orderNumber: string;
    address1: string | null;
    city: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
    dueDate: string | null;
    inspectorId: string | null;
    inspector: { firstName: string; lastName: string } | null;
    client: { name: string; code: string | null } | null;
}

interface Inspector {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    orders: {
        id: string;
        orderNumber: string;
        address1: string | null;
        city: string | null;
        state: string | null;
        latitude: number | null;
        longitude: number | null;
        dueDate: string | null;
        client: { name: string; code: string | null } | null;
    }[];
}

// Inspector color palette for map differentiation
const INSPECTOR_COLORS = [
    '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6',
];

export default function RoutesClient({ inspectors, orderLocations }: {
    inspectors: Inspector[];
    orderLocations: OrderLocation[];
}) {
    const [selectedInspector, setSelectedInspector] = useState<string | null>(null);
    const [showMap, setShowMap] = useState(true);
    const totalOpenOrders = inspectors.reduce((sum, i) => sum + i.orders.length, 0);

    const filteredLocations = selectedInspector
        ? orderLocations.filter(o => o.inspectorId === selectedInspector)
        : orderLocations;

    const selectedInsp = inspectors.find(i => i.id === selectedInspector);

    // Build inspector color map
    const inspectorColorMap = useMemo(() => {
        const map: Record<string, string> = {};
        inspectors.forEach((insp, i) => {
            map[insp.id] = INSPECTOR_COLORS[i % INSPECTOR_COLORS.length];
        });
        return map;
    }, [inspectors]);

    // Build map markers from filtered locations
    const mapMarkers = useMemo(() => {
        return filteredLocations
            .filter(o => o.latitude && o.longitude)
            .map(o => ({
                id: o.id,
                lat: o.latitude!,
                lng: o.longitude!,
                label: `#${o.orderNumber}`,
                sublabel: `${o.address1 || ''}, ${o.city || ''} ${o.state || ''}${o.inspector ? ` — ${o.inspector.firstName} ${o.inspector.lastName}` : ''}`,
                color: o.inspectorId ? inspectorColorMap[o.inspectorId] : '#94a3b8',
            }));
    }, [filteredLocations, inspectorColorMap]);

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Routes & Scheduling</h1>
                    <p className="page-subtitle">Manage inspector routes, view order locations, and track field operations.</p>
                </div>
                <div className="header-actions">
                    <button
                        className={`btn ${showMap ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setShowMap(!showMap)}
                    >
                        <Map size={16} /> {showMap ? 'Hide Map' : 'Show Map'}
                    </button>
                    {selectedInspector && (
                        <button className="btn btn-secondary" onClick={() => setSelectedInspector(null)}>
                            Clear Filter
                        </button>
                    )}
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
                        <div className="stat-value">{inspectors.length > 0 ? (totalOpenOrders / inspectors.length).toFixed(1) : 0}</div>
                        <div className="stat-label">Avg. Stops/Inspector</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--status-purple)' }}>
                        <Navigation size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{filteredLocations.filter(o => o.latitude).length}</div>
                        <div className="stat-label">Mapped Locations</div>
                    </div>
                </div>
            </div>

            {/* Interactive Map */}
            {showMap && (
                <div style={{ marginBottom: 24 }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Map size={16} style={{ color: 'var(--brand-primary-light)' }} /> Live Map
                            </span>
                            {selectedInspector && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: inspectorColorMap[selectedInspector] || '#6366f1' }} />
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                        {selectedInsp?.firstName} {selectedInsp?.lastName}
                                    </span>
                                </div>
                            )}
                            {!selectedInspector && inspectors.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {inspectors.slice(0, 5).map((insp, i) => (
                                        <div key={insp.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: INSPECTOR_COLORS[i % INSPECTOR_COLORS.length] }} />
                                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{insp.firstName[0]}{insp.lastName[0]}</span>
                                        </div>
                                    ))}
                                    {inspectors.length > 5 && (
                                        <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>+{inspectors.length - 5}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <Suspense fallback={
                            <div style={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                                Loading map...
                            </div>
                        }>
                            <RouteMap
                                markers={mapMarkers}
                                selectedId={selectedInspector || undefined}
                                height={450}
                            />
                        </Suspense>
                    </div>
                </div>
            )}

            <div className="grid-sidebar-left">
                {/* Inspector List */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Inspectors</span>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 400 }}>{inspectors.length} total</span>
                    </div>
                    <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                        {inspectors.map((inspector, idx) => (
                            <div
                                key={inspector.id}
                                onClick={() => setSelectedInspector(selectedInspector === inspector.id ? null : inspector.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)',
                                    cursor: 'pointer', transition: 'background 0.15s',
                                    background: selectedInspector === inspector.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                    borderLeft: `3px solid ${selectedInspector === inspector.id ? INSPECTOR_COLORS[idx % INSPECTOR_COLORS.length] : 'transparent'}`,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: `${INSPECTOR_COLORS[idx % INSPECTOR_COLORS.length]}22`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 700, color: INSPECTOR_COLORS[idx % INSPECTOR_COLORS.length],
                                    }}>
                                        {inspector.firstName[0]}{inspector.lastName[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{inspector.firstName} {inspector.lastName}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inspector.orders.length} open orders</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className={`badge ${inspector.orders.length > 0 ? 'badge-success' : 'badge-gray'}`}>
                                        {inspector.orders.length > 0 ? 'Active' : 'Available'}
                                    </span>
                                    <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Selected Inspector Detail */}
                    {selectedInsp && (
                        <div className="card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    background: `${inspectorColorMap[selectedInsp.id]}22`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16, fontWeight: 700, color: inspectorColorMap[selectedInsp.id],
                                }}>
                                    {selectedInsp.firstName[0]}{selectedInsp.lastName[0]}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>{selectedInsp.firstName} {selectedInsp.lastName}</h3>
                                    {selectedInsp.phone && (
                                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                            <Phone size={12} /> {selectedInsp.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 12 }}>
                                Assigned Orders ({selectedInsp.orders.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {selectedInsp.orders.map((order) => (
                                    <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '10px 14px', borderRadius: 8,
                                            background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)',
                                            transition: 'background 0.15s',
                                        }}>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-primary-light)' }}>#{order.orderNumber}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                                                    {order.address1}, {order.city}, {order.state}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {order.dueDate && (
                                                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>
                                                        Due {new Date(order.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                <Eye size={14} style={{ color: 'var(--text-tertiary)' }} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {selectedInsp.orders.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-tertiary)', fontSize: 13 }}>
                                        No open orders assigned
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order Locations List */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MapPin size={16} /> Order Locations
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                {filteredLocations.length} locations
                                {selectedInspector && ' (filtered)'}
                            </span>
                        </div>
                        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                            {filteredLocations.length > 0 ? filteredLocations.slice(0, 50).map((order) => (
                                <div key={order.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: order.latitude ? (order.inspectorId ? inspectorColorMap[order.inspectorId] || 'var(--status-success)' : 'var(--status-success)') : 'var(--text-tertiary)',
                                        }} />
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>
                                                <Link href={`/orders/${order.id}`} style={{ color: 'var(--brand-primary-light)', textDecoration: 'none' }}>
                                                    #{order.orderNumber}
                                                </Link>
                                                {' '}
                                                <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
                                                    {order.address1}, {order.city}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                                                {order.inspector ? `${order.inspector.firstName} ${order.inspector.lastName}` : 'Unassigned'}
                                                {order.client?.code && ` | ${order.client.code}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {order.latitude && order.longitude && (
                                            <a
                                                href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary btn-sm"
                                                style={{ height: 28, padding: '0 8px' }}
                                                title="Open in Google Maps"
                                            >
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: 13 }}>
                                    {selectedInspector ? 'No locations for this inspector' : 'No order locations available'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
