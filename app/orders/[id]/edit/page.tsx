import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateOrder } from '@/lib/actions';
import { INSPECTION_TYPES, ORDER_STATUSES } from '@/lib/types';
import Breadcrumbs from '@/components/Breadcrumbs';
import { FileText, MapPin, UserCheck, ClipboardList } from 'lucide-react';

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
                    <Link href={`/orders/${id}`} className="btn btn-secondary">Cancel</Link>
                    <button type="submit" form="edit-order-form" className="btn btn-primary">Save Changes</button>
                </div>
            </header>

            <Breadcrumbs items={[{ label: 'Orders', href: '/orders' }, { label: `#${order.orderNumber}`, href: `/orders/${id}` }, { label: 'Edit' }]} />

            <form id="edit-order-form" action={updateOrderWithId} className="form-page">
                {/* Section: Basic Info */}
                <section className="form-card">
                    <h2 className="form-card-title">
                        <FileText size={18} className="form-card-icon" />
                        Basic Information
                    </h2>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Order Number <span className="required">*</span></label>
                            <input type="text" name="orderNumber" defaultValue={order.orderNumber} className="form-control" required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Client <span className="required">*</span></label>
                            <select name="clientId" defaultValue={order.clientId || ''} className="form-control" required>
                                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row cols-3">
                        <div className="form-field">
                            <label className="form-label">Inspection Type</label>
                            <select name="type" defaultValue={order.type} className="form-control">
                                {INSPECTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Work Code</label>
                            <input type="text" name="workCode" defaultValue={order.workCode || ''} className="form-control" />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Status</label>
                            <select name="status" defaultValue={order.status} className="form-control">
                                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Section: Property Address */}
                <section className="form-card">
                    <h2 className="form-card-title">
                        <MapPin size={18} className="form-card-icon" />
                        Property Address
                    </h2>
                    <div className="form-row">
                        <div className="form-field span-2">
                            <label className="form-label">Address Line 1 <span className="required">*</span></label>
                            <input type="text" name="address1" defaultValue={order.address1 || ''} className="form-control" required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field span-2">
                            <label className="form-label">Address Line 2</label>
                            <input type="text" name="address2" defaultValue={order.address2 || ''} className="form-control" />
                        </div>
                    </div>
                    <div className="form-row cols-3">
                        <div className="form-field">
                            <label className="form-label">City <span className="required">*</span></label>
                            <input type="text" name="city" defaultValue={order.city || ''} className="form-control" required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">State <span className="required">*</span></label>
                            <input type="text" name="state" defaultValue={order.state || ''} className="form-control" maxLength={2} required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Zip <span className="required">*</span></label>
                            <input type="text" name="zip" defaultValue={order.zip || ''} className="form-control" required />
                        </div>
                    </div>
                </section>

                {/* Section: Assignment & Dates */}
                <section className="form-card">
                    <h2 className="form-card-title">
                        <UserCheck size={18} className="form-card-icon" />
                        Assignment & Dates
                    </h2>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Assign Inspector</label>
                            <select name="inspectorId" defaultValue={order.inspectorId || ''} className="form-control">
                                <option value="">Unassigned</option>
                                {inspectors.map((i: any) => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Due Date <span className="required">*</span></label>
                            <input type="date" name="dueDate" className="form-control" required defaultValue={order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : ''} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Inspector Pay ($)</label>
                            <input type="number" name="inspectorPay" step="0.01" defaultValue={order.inspectorPay || 0} className="form-control" />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Client Pay ($)</label>
                            <input type="number" name="clientPay" step="0.01" defaultValue={order.clientPay || 0} className="form-control" />
                        </div>
                    </div>
                </section>

                {/* Section: Instructions */}
                <section className="form-card">
                    <h2 className="form-card-title">
                        <ClipboardList size={18} className="form-card-icon" />
                        Instructions
                    </h2>
                    <div className="form-row cols-1">
                        <div className="form-field">
                            <label className="form-label">Detailed Instructions</label>
                            <textarea name="instructions" defaultValue={order.instructions || ''} className="form-control" style={{ minHeight: 150 }}></textarea>
                        </div>
                    </div>
                </section>

                <div className="form-actions">
                    <Link href={`/orders/${id}`} className="btn btn-secondary">Cancel</Link>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    );
}
