import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Edit, Eye, FileText, AlertTriangle } from 'lucide-react';

export default async function UsersPage() {
    let users: any[] = [];
    try {
        users = await prisma.user.findMany({
            orderBy: { firstName: 'asc' },
            include: {
                _count: { select: { assignedOrders: true } },
                assignedOrders: {
                    where: { status: 'Open', dueDate: { lt: new Date() } },
                    select: { id: true },
                },
            },
        });
    } catch {
        return (
            <div className="page-container">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Users</h1>
                        <p className="page-subtitle">Manage system access, roles, and inspector profiles.</p>
                    </div>
                </header>
                <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-tertiary)' }}>Unable to load user data. Please check your database connection.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Users</h1>
                    <p className="page-subtitle">Manage system access, roles, and inspector profiles.</p>
                </div>
                <div className="header-actions">
                    <Link href="/users/new" className="btn btn-primary"><Plus size={16} /> Add User</Link>
                </div>
            </header>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th style={{ textAlign: 'right' }}>Orders</th>
                            <th style={{ textAlign: 'right' }}>Past Due</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const pastDueCount = user.assignedOrders?.length || 0;
                            const orderCount = user._count?.assignedOrders || 0;
                            return (
                                <tr key={user.id}>
                                    <td style={{ fontWeight: 600 }}>
                                        <Link href={`/users/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{
                                                width: 30, height: 30, borderRadius: '50%',
                                                background: 'rgba(99, 102, 241, 0.12)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 11, fontWeight: 700, color: 'var(--brand-primary-light)', flexShrink: 0
                                            }}>
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                            <div>
                                                <div>{user.firstName} {user.lastName}</div>
                                                {user.email && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 400 }}>{user.email}</div>}
                                            </div>
                                        </Link>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{user.username}</td>
                                    <td>
                                        <span className={`badge badge-${getRoleColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                                        {orderCount > 0 ? orderCount : <span style={{ color: 'var(--text-tertiary)' }}>0</span>}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {pastDueCount > 0 ? (
                                            <span className="badge badge-danger" style={{ fontSize: 11 }}>
                                                <AlertTriangle size={10} /> {pastDueCount}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>0</span>
                                        )}
                                    </td>
                                    <td style={{ fontSize: 13, fontFamily: 'monospace' }}>{user.phone || '---'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <Link href={`/users/${user.id}`} className="btn btn-secondary btn-sm" title="View details">
                                                <Eye size={12} /> View
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
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
