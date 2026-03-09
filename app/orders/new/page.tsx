import prisma from '@/lib/prisma';
import Link from 'next/link';
import { createOrder } from '@/lib/actions';
import { INSPECTION_TYPES } from '@/lib/types';
import Breadcrumbs from '@/components/Breadcrumbs';
import SubmitButton from '@/components/SubmitButton';
import { FileText, MapPin, UserCheck, ClipboardList } from 'lucide-react';

export default async function NewOrderPage() {
    let clients: any[] = [];
    let inspectors: any[] = [];
    try {
        [clients, inspectors] = await Promise.all([
            prisma.client.findMany({ orderBy: { name: 'asc' } }),
            prisma.user.findMany({ where: { role: 'inspector' }, orderBy: { firstName: 'asc' } }),
        ]);
    } catch {
        // Fallback to empty arrays
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">New Order</h1>
                    <p className="page-subtitle">Create a new work order and assign it to an inspector.</p>
                </div>
                <div className="header-actions">
                    <Link href="/orders" className="btn btn-secondary">Cancel</Link>
                    <SubmitButton form="new-order-form">Create Order</SubmitButton>
                </div>
            </header>

            <Breadcrumbs items={[{ label: 'Orders', href: '/orders' }, { label: 'New Order' }]} />

            <form id="new-order-form" action={createOrder} className="form-page">
                {/* Section: Basic Info */}
                <section className="form-card">
                    <h2 className="form-card-title">
                        <FileText size={18} className="form-card-icon" />
                        Basic Information
                    </h2>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Order Number <span className="required">*</span></label>
                            <input type="text" name="orderNumber" className="form-control" placeholder="e.g. 109642801" required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Client <span className="required">*</span></label>
                            <select name="clientId" className="form-control" required>
                                <option value="">Select a client...</option>
                                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Inspection Type</label>
                            <select name="type" className="form-control">
                                {INSPECTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Work Code</label>
                            <input type="text" name="workCode" className="form-control" placeholder="e.g. J100/INSP" />
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
                            <input type="text" name="address1" className="form-control" placeholder="Street address" required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field span-2">
                            <label className="form-label">Address Line 2</label>
                            <input type="text" name="address2" className="form-control" placeholder="Apt, Suite, etc." />
                        </div>
                    </div>
                    <div className="form-row cols-3">
                        <div className="form-field">
                            <label className="form-label">City <span className="required">*</span></label>
                            <input type="text" name="city" className="form-control" placeholder="City" required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">State <span className="required">*</span></label>
                            <input type="text" name="state" className="form-control" placeholder="ST" maxLength={2} required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Zip <span className="required">*</span></label>
                            <input type="text" name="zip" className="form-control" placeholder="12345" required />
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
                            <select name="inspectorId" className="form-control">
                                <option value="">Unassigned</option>
                                {inspectors.map((i: any) => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Due Date <span className="required">*</span></label>
                            <input type="date" name="dueDate" className="form-control" required defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Inspector Pay ($)</label>
                            <input type="number" name="inspectorPay" step="0.01" className="form-control" placeholder="0.00" />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Client Pay ($)</label>
                            <input type="number" name="clientPay" step="0.01" className="form-control" placeholder="0.00" />
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
                            <textarea name="instructions" className="form-control" style={{ minHeight: 150 }} placeholder="Specific requirements for this inspection..."></textarea>
                        </div>
                    </div>
                </section>

                <div className="form-actions">
                    <Link href="/orders" className="btn btn-secondary">Cancel</Link>
                    <SubmitButton>Create Order</SubmitButton>
                </div>
            </form>
        </div>
    );
}
