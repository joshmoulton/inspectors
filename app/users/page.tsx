import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import UsersClient from '@/components/UsersClient';

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

    const serialized = users.map((u: any) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        email: u.email,
        role: u.role,
        phone: u.phone,
        active: u.active,
        orderCount: u._count?.assignedOrders || 0,
        pastDueCount: u.assignedOrders?.length || 0,
    }));

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

            <UsersClient users={serialized} />
        </div>
    );
}
