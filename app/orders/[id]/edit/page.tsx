import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateOrder } from '@/lib/actions';
import { INSPECTION_TYPES, ORDER_STATUSES } from '@/lib/types';
import Breadcrumbs from '@/components/Breadcrumbs';
import SubmitButton from '@/components/SubmitButton';
import ZipInspectorHint from '@/components/ZipInspectorHint';
import {
    FileText, MapPin, UserCheck, ClipboardList, DollarSign,
    Building2
} from 'lucide-react';

function formatDate(d: Date | null | undefined): string {
    if (!d) return '';
    return new Date(d).toISOString().split('T')[0];
}

export default async function EditOrderPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const [order, clients, inspectors] = await Promise.all([
        prisma.workOrder.findUnique({ where: { id } }),
        prisma.client.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
        prisma.user.findMany({ where: { role: 'inspector' }, orderBy: { firstName: 'asc' }, select: { id: true, firstName: true, lastName: true } }),
    ]);

    if (!order) return notFound();

    const updateOrderWithId = updateOrder.bind(null, id);

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Edit Order #{order.orderNumber}</h1>
                    <p className="page-subtitle">Update order details, assignment, and financials.</p>
                </div>
                <div className="header-actions">
                    <Link href={`/orders/${id}`} className="btn btn-secondary">Cancel</Link>
                    <SubmitButton form="edit-order-form">Save Changes</SubmitButton>
                </div>
            </header>

            <Breadcrumbs items={[
                { label: 'Orders', href: '/orders' },
                { label: `#${order.orderNumber}`, href: `/orders/${id}` },
                { label: 'Edit' },
            ]} />

            <form id="edit-order-form" action={updateOrderWithId} className="form-page">
                {/* Basic Info */}
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
                                <option value="">Select a client...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row cols-3">
                        <div className="form-field">
                            <label className="form-label">Inspection Type</label>
                            <select name="type" defaultValue={order.type} className="form-control">
                                {INSPECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Work Code</label>
                            <input type="text" name="workCode" defaultValue={order.workCode || ''} className="form-control" />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Status</label>
                            <select name="status" defaultValue={order.status} className="form-control">
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Client Order Number</label>
                            <input type="text" name="clientOrderNum" defaultValue={order.clientOrderNum || ''} className="form-control" />
                        </div>
                    </div>
                </section>

                {/* Property Address */}
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
                            <input type="text" name="zip" defaultValue={order.zip || ''} className="form-control" required pattern="[0-9]{5}(-[0-9]{4})?" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">County</label>
                            <input type="text" name="county" defaultValue={order.county || ''} className="form-control" />
                        </div>
                    </div>
                </section>

                {/* Assignment & Dates */}
                <section className="form-card">
                    <h2 className="form-card-title">
                        <UserCheck size={18} className="form-card-icon" />
                        Assignment & Dates
                    </h2>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Assign Inspector</label>
                            <select name="inspectorId" defaultValue={order.inspectorId || ''} className="form-control">
                                <option value="">Unassigned (auto-assign by zip)</option>
                                {inspectors.map(i => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
                            </select>
                            <ZipInspectorHint />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Due Date <span className="required">*</span></label>
                            <input type="date" name="dueDate" className="form-control" required defaultValue={formatDate(order.dueDate)} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Window Start</label>
                            <input type="date" name="windowStartDate" className="form-control" defaultValue={formatDate(order.windowStartDate)} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Window End</label>
                            <input type="date" name="windowEndDate" className="form-control" defaultValue={formatDate(order.windowEndDate)} />
                        </div>
                    </div>
                </section>

                {/* Financials */}
                <section className="form-card">
                    <h2 className="form-card-title">
                        <DollarSign size={18} className="form-card-icon" />
                        Financials
                    </h2>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Inspector Pay ($)</label>
                            <input type="number" name="inspectorPay" step="0.01" min="0" defaultValue={order.inspectorPay || 0} className="form-control" />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Client Pay ($)</label>
                            <input type="number" name="clientPay" step="0.01" min="0" defaultValue={order.clientPay || 0} className="form-control" />
                        </div>
                    </div>
                </section>

                {/* Lender Info */}
                <section className="form-card">
                    <h2 className="form-card-title">
                        <Building2 size={18} className="form-card-icon" />
                        Lender Information
                    </h2>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Mortgage Company</label>
                            <input type="text" name="mortgageCompany" defaultValue={order.mortgageCompany || ''} className="form-control" />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Loan Number</label>
                            <input type="text" name="loanNumber" defaultValue={order.loanNumber || ''} className="form-control" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Owner</label>
                            <input type="text" name="owner" defaultValue={order.owner || ''} className="form-control" />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Vendor / Source</label>
                            <input type="text" name="vendor" defaultValue={order.vendor || ''} className="form-control" />
                        </div>
                    </div>
                </section>

                {/* Instructions */}
                <section className="form-card">
                    <h2 className="form-card-title">
                        <ClipboardList size={18} className="form-card-icon" />
                        Instructions
                    </h2>
                    <div className="form-row cols-1">
                        <div className="form-field">
                            <label className="form-label">Detailed Instructions</label>
                            <textarea name="instructions" defaultValue={order.instructions || ''} className="form-control" style={{ minHeight: 150 }} />
                        </div>
                    </div>
                </section>

                <div className="form-actions">
                    <Link href={`/orders/${id}`} className="btn btn-secondary">Cancel</Link>
                    <SubmitButton>Save Changes</SubmitButton>
                </div>
            </form>
        </div>
    );
}
