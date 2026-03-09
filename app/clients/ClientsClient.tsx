'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Settings, Search, X, ExternalLink, ClipboardList } from 'lucide-react';

interface ClientData {
    id: string;
    name: string;
    code: string | null;
    orderCount: number;
    loginCount: number;
}

export default function ClientsClient({ clients }: { clients: ClientData[] }) {
    const [search, setSearch] = useState('');
    const [settingsClient, setSettingsClient] = useState<ClientData | null>(null);

    const filtered = search
        ? clients.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.code && c.code.toLowerCase().includes(search.toLowerCase()))
        )
        : clients;

    return (
        <>
            {/* Search Bar */}
            <div style={{ marginBottom: 16, position: 'relative', maxWidth: 320 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search clients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: 36 }}
                    aria-label="Search clients"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                        aria-label="Clear search"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

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
                        {filtered.map((client) => (
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
                                <td style={{ textAlign: 'center' }}>
                                    {client.orderCount > 0 ? (
                                        <Link href={`/orders?client=${client.id}`} style={{ fontFamily: 'monospace', color: 'var(--brand-primary-light)', textDecoration: 'none' }}>
                                            {client.orderCount}
                                        </Link>
                                    ) : (
                                        <span style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>0</span>
                                    )}
                                </td>
                                <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{client.loginCount}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setSettingsClient(client)}>
                                            <Settings size={12} /> Settings
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                                    {search ? `No clients matching "${search}"` : 'No clients found'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Settings Modal */}
            {settingsClient && (
                <div className="modal-overlay" onClick={() => setSettingsClient(null)}>
                    <div
                        className="confirm-dialog"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: 480, width: '100%' }}
                        role="dialog"
                        aria-label={`Settings for ${settingsClient.name}`}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Building2 size={20} style={{ color: 'var(--brand-primary-light)' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{settingsClient.name}</h3>
                                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{settingsClient.code}</span>
                                </div>
                            </div>
                            <button onClick={() => setSettingsClient(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                            <div style={{ flex: 1, padding: 16, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.1)', textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-primary-light)' }}>{settingsClient.orderCount}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Orders</div>
                            </div>
                            <div style={{ flex: 1, padding: 16, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.1)', textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--status-success)' }}>{settingsClient.loginCount}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Portal Logins</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Link
                                href={`/orders?client=${settingsClient.id}`}
                                className="btn btn-secondary"
                                style={{ justifyContent: 'flex-start', gap: 10, padding: '10px 16px' }}
                                onClick={() => setSettingsClient(null)}
                            >
                                <ClipboardList size={16} /> View Orders
                                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-tertiary)' }}>{settingsClient.orderCount}</span>
                            </Link>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn btn-secondary" onClick={() => setSettingsClient(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
