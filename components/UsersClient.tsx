'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, X, Eye, AlertTriangle, Plus, Edit } from 'lucide-react';

interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string | null;
    role: string;
    phone: string | null;
    active: boolean;
    orderCount: number;
    pastDueCount: number;
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

export default function UsersClient({ users }: { users: UserData[] }) {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [activeFilter, setActiveFilter] = useState('all');

    const filtered = users.filter(u => {
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (activeFilter === 'active' && !u.active) return false;
        if (activeFilter === 'inactive' && u.active) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                u.firstName.toLowerCase().includes(q) ||
                u.lastName.toLowerCase().includes(q) ||
                u.username.toLowerCase().includes(q) ||
                (u.email && u.email.toLowerCase().includes(q))
            );
        }
        return true;
    });

    return (
        <>
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, username, email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 36 }}
                        aria-label="Search users"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <select className="form-control" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 'auto', minWidth: 140, fontSize: 13 }}>
                    <option value="all">All Roles</option>
                    <option value="inspector">Inspectors</option>
                    <option value="manager">Managers</option>
                    <option value="admin">Admins</option>
                    <option value="client">Client Users</option>
                </select>
                <select className="form-control" value={activeFilter} onChange={e => setActiveFilter(e.target.value)} style={{ width: 'auto', minWidth: 120, fontSize: 13 }}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {filtered.length} of {users.length} users
                </div>
            </div>

            {/* Table */}
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
                        {filtered.map(user => (
                            <tr key={user.id} style={{ opacity: user.active ? 1 : 0.5 }}>
                                <td style={{ fontWeight: 600 }}>
                                    <Link href={`/users/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{
                                            width: 30, height: 30, borderRadius: '50%',
                                            background: user.active ? 'rgba(99, 102, 241, 0.12)' : 'rgba(156, 163, 175, 0.12)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11, fontWeight: 700, color: user.active ? 'var(--brand-primary-light)' : 'var(--text-tertiary)', flexShrink: 0,
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
                                    {!user.active && <span className="badge badge-gray" style={{ marginLeft: 4, fontSize: 10 }}>inactive</span>}
                                </td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                                    {user.orderCount > 0 ? user.orderCount.toLocaleString() : <span style={{ color: 'var(--text-tertiary)' }}>0</span>}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {user.pastDueCount > 0 ? (
                                        <span className="badge badge-danger" style={{ fontSize: 11 }}>
                                            <AlertTriangle size={10} /> {user.pastDueCount}
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
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                                    {search || roleFilter !== 'all' || activeFilter !== 'all'
                                        ? 'No users match the current filters'
                                        : 'No users found'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
