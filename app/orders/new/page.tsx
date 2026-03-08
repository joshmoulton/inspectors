import prisma from '@/lib/prisma';
import Link from 'next/link';
import { createOrder } from '@/lib/actions';
import { INSPECTION_TYPES } from '@/lib/types';
import Breadcrumbs from '@/components/Breadcrumbs';

export default async function NewOrderPage() {
    const [clients, inspectors] = await Promise.all([
        prisma.client.findMany({ orderBy: { name: 'asc' } }),
        prisma.user.findMany({ where: { role: 'inspector' }, orderBy: { firstName: 'asc' } }),
    ]);

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">New Order</h1>
                    <p className="page-subtitle">Create a new work order and assign it to an inspector.</p>
                </div>
                <div className="header-actions">
                    <Link href="/orders" className="btn btn-secondary mr-2">Cancel</Link>
                    <button type="submit" form="new-order-form" className="btn btn-primary">Create Order</button>
                </div>
            </header>

            <Breadcrumbs items={[{ label: 'Orders', href: '/orders' }, { label: 'New Order' }]} />

            <form id="new-order-form" action={createOrder} className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Section: Basic Info */}
                <section className="card glass p-6">
                    <h2 className="text-lg font-bold mb-4 border-b border-white/5 pb-2 text-primary">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Order Number *</label>
                            <input type="text" name="orderNumber" className="form-control" placeholder="e.g. 109642801" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Client *</label>
                            <select name="clientId" className="form-control" required>
                                <option value="">Select a client...</option>
                                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Inspection Type</label>
                            <select name="type" className="form-control">
                                {INSPECTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Work Code</label>
                            <input type="text" name="workCode" className="form-control" placeholder="e.g. J100/INSP" />
                        </div>
                    </div>
                </section>

                {/* Section: Property Address */}
                <section className="card glass p-6">
                    <h2 className="text-lg font-bold mb-4 border-b border-white/5 pb-2 text-primary">Property Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Address Line 1 *</label>
                            <input type="text" name="address1" className="form-control" placeholder="Street address" required />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Address Line 2</label>
                            <input type="text" name="address2" className="form-control" placeholder="Apt, Suite, etc." />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">City *</label>
                            <input type="text" name="city" className="form-control" placeholder="City" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase text-muted">State *</label>
                                <input type="text" name="state" className="form-control" placeholder="ST" maxLength={2} required />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase text-muted">Zip *</label>
                                <input type="text" name="zip" className="form-control" placeholder="12345" required />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Assignment & Dates */}
                <section className="card glass p-6">
                    <h2 className="text-lg font-bold mb-4 border-b border-white/5 pb-2 text-primary">Assignment & Dates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Assign Inspector</label>
                            <select name="inspectorId" className="form-control">
                                <option value="">Unassigned</option>
                                {inspectors.map((i: any) => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Due Date *</label>
                            <input type="date" name="dueDate" className="form-control" required defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Inspector Pay ($)</label>
                            <input type="number" name="inspectorPay" step="0.01" className="form-control" placeholder="0.00" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Client Pay ($)</label>
                            <input type="number" name="clientPay" step="0.01" className="form-control" placeholder="0.00" />
                        </div>
                    </div>
                </section>

                {/* Section: Instructions */}
                <section className="card glass p-6">
                    <h2 className="text-lg font-bold mb-4 border-b border-white/5 pb-2 text-primary">Instructions</h2>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-muted">Detailed Instructions</label>
                        <textarea name="instructions" className="form-control min-h-[150px]" placeholder="Specific requirements for this inspection..."></textarea>
                    </div>
                </section>

                <div className="flex justify-end gap-4 pb-12">
                    <Link href="/orders" className="btn btn-secondary">Cancel</Link>
                    <button type="submit" className="btn btn-primary px-12">Create Order</button>
                </div>
            </form>
        </div>
    );
}
