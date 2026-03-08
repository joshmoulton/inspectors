import prisma from '@/lib/prisma';
import Link from 'next/link';
import { createClient } from '@/lib/mgmt-actions';
import SubmitButton from '@/components/SubmitButton';
import { Plus, Settings, Building2, ArrowRight } from 'lucide-react';

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

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Clients</h1>
                    <p className="page-subtitle">Manage client accounts, portals, and service levels.</p>
                </div>
            </header>

            <div className="grid-sidebar-right">
                {/* Left: Client List */}
                <div>
                    <div className="card" style={{ overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Client Name</th>
                                    <th>Code</th>
                                    <th style={{ textAlign: 'center' }}>Active Orders</th>
                                    <th style={{ textAlign: 'center' }}>Logins</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id}>
                                        <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 30, height: 30, borderRadius: 'var(--radius-sm)',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <Building2 size={14} style={{ color: 'var(--brand-primary-light)' }} />
                                            </div>
                                            {client.name}
                                        </td>
                                        <td>
                                            <span style={{
                                                fontFamily: 'monospace', fontSize: 11,
                                                padding: '2px 8px', background: 'rgba(255,255,255,0.06)',
                                                borderRadius: 'var(--radius-sm)'
                                            }}>{client.code}</span>
                                        </td>
                                        <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{client._count.orders}</td>
                                        <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{client._count.logins}</td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm">
                                                <Settings size={12} /> Settings
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Quick Add Client */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--brand-primary-light)' }}>Quick Add Client</h3>
                        <form action={createClient} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label className="form-label">Client Name</label>
                                <input type="text" name="name" className="form-control" placeholder="Altisource" required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label className="form-label">Short Code</label>
                                <input type="text" name="code" className="form-control" placeholder="ALT" required />
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
