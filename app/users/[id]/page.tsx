import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ArrowLeft, MapPin, Phone, Mail, Calendar, Clock,
    AlertTriangle, CheckCircle, FileText, Map, ExternalLink
} from 'lucide-react';
import InspectorTabs from './InspectorTabs';

export default async function InspectorDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            assignedOrders: {
                include: {
                    client: { select: { name: true, code: true } },
                },
                orderBy: { dueDate: 'asc' },
            },
        },
    });

    if (!user) {
        return notFound();
    }

    const now = new Date();

    const openOrders = user.assignedOrders.filter(o =>
        o.status === 'Open' || o.status === 'Unassigned'
    );

    const pastDueOrders = openOrders.filter(o =>
        o.dueDate && new Date(o.dueDate) < now
    ).sort((a, b) => {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return aDate - bDate;
    });

    const completedOrders = user.assignedOrders.filter(o =>
        o.status.includes('Completed')
    ).sort((a, b) => {
        const aDate = a.completedDate ? new Date(a.completedDate).getTime() : 0;
        const bDate = b.completedDate ? new Date(b.completedDate).getTime() : 0;
        return bDate - aDate;
    }).slice(0, 100);

    // Avg turnaround for completed orders
    const ordersWithDates = user.assignedOrders.filter(o =>
        o.status.includes('Completed') && o.orderedDate && o.completedDate
    );
    let avgTurnaround = 0;
    if (ordersWithDates.length > 0) {
        const totalDays = ordersWithDates.reduce((sum, o) => {
            const diff = (new Date(o.completedDate!).getTime() - new Date(o.orderedDate!).getTime()) / (1000 * 60 * 60 * 24);
            return sum + Math.max(0, diff);
        }, 0);
        avgTurnaround = Math.round((totalDays / ordersWithDates.length) * 10) / 10;
    }

    const totalOrders = user.assignedOrders.length;
    const completedCount = user.assignedOrders.filter(o => o.status.includes('Completed')).length;
    const paidOrders = user.assignedOrders.filter(o => o.status === 'Paid');
    const totalEarnings = paidOrders.reduce((sum, o) => sum + (o.inspectorPay || 0), 0);

    // Serialize dates for client component
    const serializedOpen = openOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        address: [o.address1, o.city, o.state].filter(Boolean).join(', '),
        clientName: o.client?.name || 'No Client',
        clientCode: o.client?.code || '',
        dueDate: o.dueDate?.toISOString() || null,
        type: o.type,
    }));

    const serializedPastDue = pastDueOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        address: [o.address1, o.city, o.state].filter(Boolean).join(', '),
        clientName: o.client?.name || 'No Client',
        clientCode: o.client?.code || '',
        dueDate: o.dueDate?.toISOString() || null,
        type: o.type,
        daysOverdue: o.dueDate ? Math.floor((now.getTime() - new Date(o.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
    }));

    const serializedCompleted = completedOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        address: [o.address1, o.city, o.state].filter(Boolean).join(', '),
        clientName: o.client?.name || 'No Client',
        clientCode: o.client?.code || '',
        completedDate: o.completedDate?.toISOString() || null,
        type: o.type,
    }));

    return (
        <div className="page-container">
            {/* Back link */}
            <Link href="/users" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16,
                textDecoration: 'none',
            }}>
                <ArrowLeft size={14} /> Back to Users
            </Link>

            {/* Header */}
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 24, flexWrap: 'wrap', gap: 16,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 700, color: 'var(--brand-primary-light)',
                        flexShrink: 0,
                    }}>
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <h1 className="page-title" style={{ margin: 0 }}>
                                {user.firstName} {user.lastName}
                            </h1>
                            <span className={`badge badge-${getRoleColor(user.role)}`}>{user.role}</span>
                            <span className={`badge badge-${user.active ? 'success' : 'gray'}`}>
                                {user.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 13, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                            {user.email && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Mail size={13} /> {user.email}
                                </span>
                            )}
                            {user.phone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Phone size={13} /> {user.phone}
                                </span>
                            )}
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={13} /> Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <Link href="/routes" className="btn btn-secondary">
                        <Map size={14} /> View on Map
                    </Link>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--brand-primary-light)' }}>
                        <FileText size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{openOrders.length}</div>
                        <div className="stat-label">Open Orders</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)' }}>
                        <CheckCircle size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{completedCount}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: pastDueOrders.length > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255,255,255,0.06)', color: pastDueOrders.length > 0 ? 'var(--status-danger)' : 'var(--text-tertiary)' }}>
                        <AlertTriangle size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value" style={{ color: pastDueOrders.length > 0 ? 'var(--status-danger)' : undefined }}>
                            {pastDueOrders.length}
                        </div>
                        <div className="stat-label">Past Due</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--status-purple)' }}>
                        <Clock size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{avgTurnaround} Days</div>
                        <div className="stat-label">Avg Turnaround</div>
                    </div>
                </div>
            </div>

            {/* Summary bar */}
            <div className="card" style={{ padding: '12px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>
                        Total Orders: <strong style={{ color: 'var(--text-primary)' }}>{totalOrders}</strong>
                    </span>
                    <span style={{ color: 'var(--text-tertiary)' }}>
                        Completion Rate: <strong style={{
                            color: totalOrders > 0
                                ? (completedCount / totalOrders >= 0.8 ? 'var(--status-success)' : completedCount / totalOrders >= 0.5 ? 'var(--status-warning)' : 'var(--status-danger)')
                                : 'var(--text-primary)'
                        }}>
                            {totalOrders > 0 ? Math.round((completedCount / totalOrders) * 100) : 0}%
                        </strong>
                    </span>
                    <span style={{ color: 'var(--text-tertiary)' }}>
                        Total Earnings: <strong style={{ color: 'var(--status-success)' }}>${totalEarnings.toLocaleString()}</strong>
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <InspectorTabs
                openOrders={serializedOpen}
                pastDueOrders={serializedPastDue}
                completedOrders={serializedCompleted}
            />
        </div>
    );
}

function getRoleColor(role: string) {
    switch (role.toLowerCase()) {
        case 'admin': return 'danger';
        case 'manager': return 'info';
        case 'inspector': return 'success';
        case 'client': return 'primary';
        default: return 'gray';
    }
}
