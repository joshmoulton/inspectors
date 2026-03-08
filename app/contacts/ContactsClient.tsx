'use client';

import { useState } from 'react';
import { createContact, updateContact, deleteContact } from '@/lib/contactActions';
import { Contact } from '@prisma/client';
import { toast } from 'sonner';

export default function ContactsClient({ initialContacts }: { initialContacts: Contact[] }) {
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        const res = await deleteContact(id);
        if (!res.success) {
            toast.error(res.error || 'Failed to delete contact');
        } else {
            toast.success('Contact deleted successfully');
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Contacts Management</h1>
                    <p className="page-subtitle">Manage client contacts, vendors, and partners.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => handleOpenDialog()}>
                        + New Contact
                    </button>
                </div>
            </header>

            <div className="card glass p-6">
                <div className="mb-6 flex justify-between items-center">
                    <div className="w-full max-w-sm">
                        <input
                            type="text"
                            placeholder="🔍 Search contacts by name, company, or email..."
                            className="input w-full bg-white/5 border-white/10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-muted">
                        Showing {filteredContacts.length} contacts
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="p-4 font-bold text-muted text-sm uppercase">Name</th>
                                <th className="p-4 font-bold text-muted text-sm uppercase">Company & Title</th>
                                <th className="p-4 font-bold text-muted text-sm uppercase">Contact Info</th>
                                <th className="p-4 font-bold text-muted text-sm uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted">
                                        No contacts found.
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr key={contact.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-primary text-lg">
                                                {contact.firstName} {contact.lastName}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-white/90">{contact.company || <span className="text-muted">—</span>}</div>
                                            <div className="text-xs text-muted font-mono mt-1">{contact.title || 'No Title'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                {contact.email && <div className="text-secondary mb-1">✉️ {contact.email}</div>}
                                                {contact.phone && <div className="text-muted">📞 {contact.phone}</div>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="btn btn-secondary px-3 py-1.5 text-xs"
                                                    onClick={() => handleOpenDialog(contact)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-secondary px-3 py-1.5 text-xs text-danger hover:border-danger hover:bg-danger/10"
                                                    onClick={() => handleDelete(contact.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Modal */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="card glass w-full max-w-2xl bg-[#0F1219] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold">
                                {editingContact ? 'Edit Contact' : 'Create New Contact'}
                            </h2>
                            <button className="text-muted hover:text-white transition-colors text-2xl" onClick={handleCloseDialog}>
                                &times;
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted">First Name <span className="text-danger">*</span></label>
                                        <input type="text" name="firstName" className="input" defaultValue={editingContact?.firstName || ''} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted">Last Name <span className="text-danger">*</span></label>
                                        <input type="text" name="lastName" className="input" defaultValue={editingContact?.lastName || ''} required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted">Email</label>
                                        <input type="email" name="email" className="input" defaultValue={editingContact?.email || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted">Phone Number</label>
                                        <input type="tel" name="phone" className="input" defaultValue={editingContact?.phone || ''} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted">Company</label>
                                        <input type="text" name="company" className="input" defaultValue={editingContact?.company || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted">Job Title</label>
                                        <input type="text" name="title" className="input" defaultValue={editingContact?.title || ''} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted">Notes</label>
                                    <textarea name="notes" className="input min-h-[100px]" defaultValue={editingContact?.notes || ''} placeholder="Additional context..." />
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-4 bg-white/5">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseDialog} disabled={isSaving}>
                                Cancel
                            </button>
                            <button type="submit" form="contact-form" className="btn btn-primary" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Contact'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
