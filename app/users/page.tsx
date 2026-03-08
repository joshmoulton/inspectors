import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { firstName: 'asc' },
    });

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Users</h1>
                    <p className="page-subtitle">Manage system access, roles, and inspector profiles.</p>
                </div>
                <div className="header-actions">
                    <Link href="/users/new" className="btn btn-primary">+ Add User</Link>
                </div>
            </header>

            <div className="card glass overflow-hidden">
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
                                <td className="font-bold flex items-center gap-3 py-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                        {user.firstName[0]}{user.lastName[0]}
                                    </div>
                                    {user.firstName} {user.lastName}
                                </td>
                                <td className="font-mono text-sm">{user.username}</td>
                                <td className="text-sm">{user.email}</td>
                                <td>
                                    <span className={`badge badge-${getRoleColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="text-sm font-mono">{user.phone || '---'}</td>
                                <td className="text-xs text-muted">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <button className="text-xs text-primary hover:underline">Edit</button>
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
        default: return 'muted';
    }
}
