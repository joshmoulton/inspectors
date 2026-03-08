import prisma from '@/lib/prisma';
import Link from 'next/link';
import { createClient } from '@/lib/mgmt-actions';

export default async function ClientsPage() {
    const clients = await prisma.client.findMany({
        include: {
            _count: {
                select: { orders: true, logins: true }
            }
        },
        orderBy: { name: 'asc' },
    });

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Clients</h1>
                    <p className="page-subtitle">Manage client accounts, portals, and service levels.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Client List */}
                <div className="lg:col-span-2">
                    <div className="card glass overflow-hidden">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Client Name</th>
                                    <th>Code</th>
                                    <th className="text-center">Active Orders</th>
                                    <th className="text-center">Logins</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id}>
                                        <td className="font-bold py-4">{client.name}</td>
                                        <td>
                                            <span className="font-mono text-xs px-2 py-1 bg-white/10 rounded">{client.code}</span>
                                        </td>
                                        <td className="text-center font-mono">{client._count.orders}</td>
                                        <td className="text-center font-mono">{client._count.logins}</td>
                                        <td>
                                            <button className="text-xs text-primary hover:underline">Settings</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Quick Add Client */}
                <div className="space-y-6">
                    <div className="card glass p-6">
                        <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-2 text-primary">Quick Add Client</h3>
                        <form action={createClient} className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase text-muted">Client Name</label>
                                <input type="text" name="name" className="form-control" placeholder="Altisource" required />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase text-muted">Short Code</label>
                                <input type="text" name="code" className="form-control" placeholder="ALT" required />
                            </div>
                            <button type="submit" className="btn btn-primary w-full mt-2">Add Client</button>
                        </form>
                    </div>

                    <div className="card glass p-6 bg-primary/5 border-primary/20">
                        <h4 className="font-bold text-sm mb-2">Importing Clients</h4>
                        <p className="text-xs text-muted leading-relaxed">
                            If you have a bulk list of clients, use the bulk import tool in the Management section to upload a CSV.
                        </p>
                        <Link href="/import" className="text-xs text-primary mt-2 block hover:underline">Go to Import →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
