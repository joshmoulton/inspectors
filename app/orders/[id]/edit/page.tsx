import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateOrder } from '@/lib/actions';
import { INSPECTION_TYPES, ORDER_STATUSES } from '@/lib/types';
import Breadcrumbs from '@/components/Breadcrumbs';

export default async function EditOrderPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const [order, clients, inspectors] = await Promise.all([
        prisma.workOrder.findUnique({ where: { id } }),
        prisma.client.findMany({ orderBy: { name: 'asc' } }),
        prisma.user.findMany({ where: { role: 'inspector' }, orderBy: { firstName: 'asc' } }),
    ]);

    if (!order) {
        return notFound();
    }

    const updateOrderWithId = updateOrder.bind(null, id);

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Edit Order #{order.orderNumber}</h1>
                    <p className="page-subtitle">Update order details, assignment, and instructions.</p>
                </div>
                <div className="header-actions">
                    <Link href={`/orders/${id}`} className="btn btn-secondary mr-2">Cancel</Link>
                    <button type="submit" form="edit-order-form" className="btn btn-primary">Save Changes</button>
                </div>
            </header>

            <Breadcrumbs items={[{ label: 'Orders', href: '/orders' }, { label: `#${order.orderNumber}`, href: `/orders/${id}` }, { label: 'Edit' }]} />

            <form id="edit-order-form" action={updateOrderWithId} className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Section: Basic Info */}
                <section className="card glass p-6">
                    <h2 className="text-lg font-bold mb-4 border-b border-white/5 pb-2 text-primary">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Order Number *</label>
                            <input type="text" name="orderNumber" defaultValue={order.orderNumber} className="form-control" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Client *</label>
                            <select name="clientId" defaultValue={order.clientId || ''} className="form-control" required>
                                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Inspection Type</label>
                            <select name="type" defaultValue={order.type} className="form-control">
                                {INSPECTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Work Code</label>
                            <input type="text" name="workCode" defaultValue={order.workCode || ''} className="form-control" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Status</label>
                            <select name="status" defaultValue={order.status} className="form-control">
                                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Section: Property Address */}
                <section className="card glass p-6">
                    <h2 className="text-lg font-bold mb-4 border-b border-white/5 pb-2 text-primary">Property Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Address Line 1 *</label>
                            <input type="text" name="address1" defaultValue={order.address1 || ''} className="form-control" required />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Address Line 2</label>
                            <input type="text" name="address2" defaultValue={order.address2 || ''} className="form-control" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">City *</label>
                            <input type="text" name="city" defaultValue={order.city || ''} className="form-control" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase text-muted">State *</label>
                                <input type="text" name="state" defaultValue={order.state || ''} className="form-control" maxLength={2} required />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase text-muted">Zip *</label>
                                <input type="text" name="zip" defaultValue={order.zip || ''} className="form-control" required />
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
                            <select name="inspectorId" defaultValue={order.inspectorId || ''} className="form-control">
                                <option value="">Unassigned</option>
                                {inspectors.map((i: any) => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Due Date *</label>
                            <input type="date" name="dueDate" className="form-control" required defaultValue={order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : ''} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Inspector Pay ($)</label>
                            <input type="number" name="inspectorPay" step="0.01" defaultValue={order.inspectorPay || 0} className="form-control" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Client Pay ($)</label>
                            <input type="number" name="clientPay" step="0.01" defaultValue={order.clientPay || 0} className="form-control" />
                        </div>
                    </div>
                </section>

                {/* Section: Instructions */}
                <section className="card glass p-6">
                    <h2 className="text-lg font-bold mb-4 border-b border-white/5 pb-2 text-primary">Instructions</h2>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-muted">Detailed Instructions</label>
                        <textarea name="instructions" defaultValue={order.instructions || ''} className="form-control min-h-[150px]"></textarea>
                    </div>
                </section>

                <div className="flex justify-end gap-4 pb-12">
                    <Link href={`/orders/${id}`} className="btn btn-secondary">Cancel</Link>
                    <button type="submit" className="btn btn-primary px-12">Save Changes</button>
                </div>
            </form>
        </div>
    );
}
