import prisma from '@/lib/prisma';
import Link from 'next/link';
import { createClient } from '@/lib/mgmt-actions';
import SubmitButton from '@/components/SubmitButton';
import { Plus, ArrowRight } from 'lucide-react';
import ClientsClient from './ClientsClient';

export default async function ClientsPage() {
    let clients: any[] = [];
    try {
        clients = await prisma.client.findMany({
            include: {
                _count: {
                    select: { orders: true, logins: true }
                }
            },
            orderBy: { name: 'asc' },
        });
    } catch {
        return (
            <div className="page-container">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Clients</h1>
                        <p className="page-subtitle">Manage client accounts, portals, and service levels.</p>
                    </div>
                </header>
                <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: 8 }}>Unable to load client data.</p>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Please check your database connection and try again.</p>
                </div>
            </div>
        );
    }

    const serializedClients = clients.map((c: any) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        orderCount: c._count.orders,
        loginCount: c._count.logins,
    }));

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Clients</h1>
                    <p className="page-subtitle">Manage client accounts, portals, and service levels.</p>
                </div>
            </header>

            <div className="grid-sidebar-right">
                {/* Left: Client List with search and settings */}
                <div>
                    <ClientsClient clients={serializedClients} />
                </div>

                {/* Right: Quick Add Client */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--brand-primary-light)' }}>Quick Add Client</h3>
                        <form action={createClient} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label className="form-label">Client Name</label>
                                <input type="text" name="name" className="form-control" placeholder="e.g. Altisource" required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label className="form-label">Short Code</label>
                                <input type="text" name="code" className="form-control" placeholder="e.g. ALT" required />
                            </div>
                            <SubmitButton style={{ marginTop: 4 }}>
                                <Plus size={14} /> Add Client
                            </SubmitButton>
                        </form>
                    </div>

                    <div className="card" style={{ padding: 20, background: 'rgba(99, 102, 241, 0.04)', borderColor: 'rgba(99, 102, 241, 0.15)' }}>
                        <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Importing Clients</h4>
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: 10 }}>
                            If you have a bulk list of clients, use the bulk import tool to upload a CSV.
                        </p>
                        <Link href="/import" style={{ fontSize: 12, color: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                            Go to Import <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
