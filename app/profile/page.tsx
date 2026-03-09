import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
    User, Mail, Phone, Shield, Calendar, ClipboardList,
    CheckCircle, Clock, AlertTriangle, Settings
} from 'lucide-react';

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            assignedOrders: {
                select: { id: true, status: true, completedDate: true, orderedDate: true },
            },
        },
    });

    if (!user) redirect('/login');

    const totalOrders = user.assignedOrders.length;
    const openOrders = user.assignedOrders.filter(o => ['Open', 'Unassigned'].includes(o.status)).length;
    const completedOrders = user.assignedOrders.filter(o => o.status.includes('Completed')).length;
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    const stats = [
        { label: 'Total Orders', value: totalOrders, icon: ClipboardList, color: 'var(--brand-primary-light)', bg: 'rgba(99, 102, 241, 0.12)' },
        { label: 'Open', value: openOrders, icon: Clock, color: 'var(--status-warning)', bg: 'rgba(245, 158, 11, 0.12)' },
        { label: 'Completed', value: completedOrders, icon: CheckCircle, color: 'var(--status-success)', bg: 'rgba(16, 185, 129, 0.12)' },
        { label: 'Completion Rate', value: `${completionRate}%`, icon: AlertTriangle, color: completionRate >= 80 ? 'var(--status-success)' : completionRate >= 50 ? 'var(--status-warning)' : 'var(--status-danger)', bg: completionRate >= 80 ? 'rgba(16, 185, 129, 0.12)' : completionRate >= 50 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)' },
    ];

    return (
        <div className="page-container">
            <Breadcrumbs items={[{ label: 'Profile' }]} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Profile Card */}
                <div className="card" style={{ padding: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 28, fontWeight: 800, color: 'white',
                            flexShrink: 0,
                        }}>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                                {user.firstName} {user.lastName}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span className={`badge badge-${getRoleBadge(user.role)}`} style={{ textTransform: 'capitalize' }}>
                                    {user.role}
                                </span>
                                {user.active && <span className="badge badge-success">Active</span>}
                                {!user.active && <span className="badge badge-danger">Inactive</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
                                {user.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                                        <Mail size={14} style={{ color: 'var(--text-tertiary)' }} />
                                        {user.email}
                                    </div>
                                )}
                                {user.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                                        <Phone size={14} style={{ color: 'var(--text-tertiary)' }} />
                                        {user.phone}
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)' }}>
                                    <Calendar size={14} />
                                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                        <Link href="/utilities" className="btn btn-secondary">
                            <Settings size={16} /> Settings
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    {stats.map(stat => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="stat-card">
                                <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                                    <Icon size={22} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Account Details */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={16} style={{ color: 'var(--brand-primary-light)' }} /> Account Details
                    </h3>
                    <div className="grid-detail-fields">
                        <DetailItem label="First Name" value={user.firstName} />
                        <DetailItem label="Last Name" value={user.lastName} />
                        <DetailItem label="Email" value={user.email} />
                        <DetailItem label="Phone" value={user.phone} />
                        <DetailItem label="Role" value={user.role} />
                        <DetailItem label="Username" value={user.username} />
                        <DetailItem label="Account Created" value={new Date(user.createdAt).toLocaleDateString()} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                {label}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{value || '---'}</span>
        </div>
    );
}

function getRoleBadge(role: string) {
    switch (role) {
        case 'admin': return 'brand';
        case 'inspector': return 'info';
        case 'qc': return 'purple';
        default: return 'gray';
    }
}
