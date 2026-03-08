import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Edit } from 'lucide-react';

export default async function UsersPage() {
    let users: any[] = [];
    try {
        users = await prisma.user.findMany({
            orderBy: { firstName: 'asc' },
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
                            <th>Email</th>
                            <th>Role</th>
                            <th>Phone</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: '50%',
                                        background: 'rgba(99, 102, 241, 0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 700, color: 'var(--brand-primary-light)', flexShrink: 0
                                    }}>
                                        {user.firstName[0]}{user.lastName[0]}
                                    </div>
                                    {user.firstName} {user.lastName}
                                </td>
                                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{user.username}</td>
                                <td style={{ fontSize: 13 }}>{user.email}</td>
                                <td>
                                    <span className={`badge badge-${getRoleColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ fontSize: 13, fontFamily: 'monospace' }}>{user.phone || '---'}</td>
                                <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <button className="btn btn-secondary btn-sm">
                                        <Edit size={12} /> Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
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
