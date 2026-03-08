'use client';

import { useState } from 'react';
import { createContact, updateContact, deleteContact } from '@/lib/contactActions';
import { Contact } from '@prisma/client';
import { toast } from 'sonner';
import { Search, Plus, Mail, Phone, Edit, Trash2, X } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function ContactsClient({ initialContacts }: { initialContacts: Contact[] }) {
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

    const filteredContacts = initialContacts.filter(
        (c) =>
            (c.firstName + ' ' + c.lastName).toLowerCase().includes(search.toLowerCase()) ||
            c.company?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase())
    );

    function handleOpenDialog(contact?: Contact) {
        setEditingContact(contact || null);
        setIsDialogOpen(true);
    }

    function handleCloseDialog() {
        setIsDialogOpen(false);
        setEditingContact(null);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);

        let res;
        if (editingContact) {
            res = await updateContact(editingContact.id, formData);
        } else {
            res = await createContact(formData);
        }

        setIsSaving(false);
        if (res.success) {
            handleCloseDialog();
            toast.success(editingContact ? 'Contact updated successfully' : 'Contact created successfully');
        } else {
            toast.error(res.error || 'An error occurred');
        }
    }

    async function handleDelete(contact: Contact) {
        const res = await deleteContact(contact.id);
        if (!res.success) {
            toast.error(res.error || 'Failed to delete contact');
        } else {
            toast.success('Contact deleted successfully');
        }
        setDeleteTarget(null);
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Contacts Management</h1>
                    <p className="page-subtitle">Manage client contacts, vendors, and partners.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => handleOpenDialog()}>
                        <Plus size={16} /> New Contact
                    </button>
                </div>
            </header>

            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="search-input-wrapper" style={{ maxWidth: 320 }}>
                        <Search size={15} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="form-control"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: 36 }}
                        />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        Showing {filteredContacts.length} contacts
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Company & Title</th>
                            <th>Contact Info</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                    No contacts found.
                                </td>
                            </tr>
                        ) : (
                            filteredContacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: 'rgba(99, 102, 241, 0.15)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11, fontWeight: 700, color: 'var(--brand-primary-light)', flexShrink: 0
                                        }}>
                                            {contact.firstName[0]}{contact.lastName[0]}
                                        </div>
                                        {contact.firstName} {contact.lastName}
                                    </td>
                                    <td>
                                        <div style={{ fontSize: 13 }}>{contact.company || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace', marginTop: 2 }}>{contact.title || 'No Title'}</div>
                                    </td>
                                    <td>
                                        {contact.email && (
                                            <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                                <Mail size={12} style={{ color: 'var(--text-tertiary)' }} /> {contact.email}
                                            </div>
                                        )}
                                        {contact.phone && (
                                            <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)' }}>
                                                <Phone size={12} /> {contact.phone}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button className="btn-icon" title="Edit" onClick={() => handleOpenDialog(contact)}><Edit size={14} /></button>
                                            <button className="btn-icon" title="Delete" onClick={() => setDeleteTarget(contact)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation */}
            {deleteTarget && (
                <ConfirmDialog
                    title="Delete Contact"
                    description={`Are you sure you want to delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This action cannot be undone.`}
                    confirmLabel="Delete"
                    variant="danger"
                    onConfirm={() => handleDelete(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* Create/Edit Modal */}
            {isDialogOpen && (
                <div className="modal-overlay" onClick={handleCloseDialog}>
                    <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700 }}>
                                {editingContact ? 'Edit Contact' : 'Create New Contact'}
                            </h2>
                            <button className="btn-icon" onClick={handleCloseDialog}><X size={18} /></button>
                        </div>

                        <form id="contact-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="grid-2-col" style={{ gap: 16 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label className="form-label">First Name <span className="required">*</span></label>
                                    <input type="text" name="firstName" className="form-control" defaultValue={editingContact?.firstName || ''} required />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label className="form-label">Last Name <span className="required">*</span></label>
                                    <input type="text" name="lastName" className="form-control" defaultValue={editingContact?.lastName || ''} required />
                                </div>
                            </div>

                            <div className="grid-2-col" style={{ gap: 16 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label className="form-label">Email</label>
                                    <input type="email" name="email" className="form-control" defaultValue={editingContact?.email || ''} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label className="form-label">Phone Number</label>
                                    <input type="tel" name="phone" className="form-control" defaultValue={editingContact?.phone || ''} />
                                </div>
                            </div>

                            <div className="grid-2-col" style={{ gap: 16 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label className="form-label">Company</label>
                                    <input type="text" name="company" className="form-control" defaultValue={editingContact?.company || ''} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label className="form-label">Job Title</label>
                                    <input type="text" name="title" className="form-control" defaultValue={editingContact?.title || ''} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label className="form-label">Notes</label>
                                <textarea name="notes" className="form-control" style={{ height: 'auto', minHeight: 100, resize: 'vertical' }} defaultValue={editingContact?.notes || ''} placeholder="Additional context..." />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseDialog} disabled={isSaving}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Contact'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
