'use client';

import { useState } from 'react';
import { FileText, Plus, Eye, Edit, Copy } from 'lucide-react';
import { toast } from 'sonner';
import FormModal from '@/components/FormModal';

interface FormTemplate {
    id: string;
    name: string;
    description: string;
    fields: number;
    lastModified: string;
    status: string;
    uses: number;
}

const initialTemplates: FormTemplate[] = [
    { id: '1', name: 'Standard Exterior Inspection', description: 'Standard exterior property inspection checklist', fields: 24, lastModified: '2026-02-15', status: 'Active', uses: 156 },
    { id: '2', name: 'Interior Inspection Report', description: 'Full interior inspection with room-by-room assessment', fields: 32, lastModified: '2026-02-20', status: 'Active', uses: 89 },
    { id: '3', name: 'Contact Inspection Form', description: 'Contact-based inspection with occupant interview', fields: 18, lastModified: '2026-01-10', status: 'Active', uses: 45 },
    { id: '4', name: 'Commercial Property Assessment', description: 'Commercial property condition assessment', fields: 41, lastModified: '2026-03-01', status: 'Draft', uses: 0 },
    { id: '5', name: 'Vacant Property Checklist', description: 'Vacant property security and condition checklist', fields: 15, lastModified: '2026-02-28', status: 'Active', uses: 67 },
    { id: '6', name: 'FEMA Disaster Assessment', description: 'Post-disaster property assessment form', fields: 28, lastModified: '2026-03-05', status: 'Draft', uses: 0 },
];

export default function CustomFormsClient() {
    const [templates, setTemplates] = useState<FormTemplate[]>(initialTemplates);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'preview' | null>(null);
    const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);

    function handleCreate(data: any) {
        const newForm: FormTemplate = {
            id: String(Date.now()),
            name: data.name,
            description: data.description || '',
            fields: data.fields,
            status: data.status,
            lastModified: new Date().toISOString().split('T')[0],
            uses: 0,
        };
        setTemplates(prev => [...prev, newForm]);
        setModalMode(null);
        toast.success(`Form "${data.name}" created`);
    }

    function handleEdit(data: any) {
        setTemplates(prev => prev.map(f =>
            f.id === data.id
                ? { ...f, name: data.name, description: data.description, fields: data.fields, status: data.status, lastModified: new Date().toISOString().split('T')[0] }
                : f
        ));
        setModalMode(null);
        setSelectedForm(null);
        toast.success(`Form "${data.name}" updated`);
    }

    function handleDuplicate(form: FormTemplate) {
        const duplicate: FormTemplate = {
            ...form,
            id: String(Date.now()),
            name: `${form.name} (Copy)`,
            uses: 0,
            lastModified: new Date().toISOString().split('T')[0],
        };
        setTemplates(prev => [...prev, duplicate]);
        toast.success(`Form duplicated as "${duplicate.name}"`);
    }

    function openModal(mode: 'create' | 'edit' | 'preview', form?: FormTemplate) {
        setModalMode(mode);
        setSelectedForm(form || null);
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">FormADE</h1>
                    <p className="page-subtitle">Create and manage custom inspection forms and field checklists.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => openModal('create')}>
                        <Plus size={16} /> Create New Form
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--brand-primary-light)' }}>
                        <FileText size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{templates.length}</div>
                        <div className="stat-label">Total Forms</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)' }}>
                        <FileText size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{templates.filter(f => f.status === 'Active').length}</div>
                        <div className="stat-label">Active Forms</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--status-warning)' }}>
                        <Edit size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{templates.filter(f => f.status === 'Draft').length}</div>
                        <div className="stat-label">Drafts</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--status-purple)' }}>
                        <FileText size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{templates.reduce((s, f) => s + f.uses, 0)}</div>
                        <div className="stat-label">Total Submissions</div>
                    </div>
                </div>
            </div>

            {/* Forms Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Form Name</th>
                            <th style={{ textAlign: 'center' }}>Fields</th>
                            <th style={{ textAlign: 'center' }}>Submissions</th>
                            <th>Last Modified</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.map((form) => (
                            <tr key={form.id}>
                                <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8,
                                        background: form.status === 'Active' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: form.status === 'Active' ? 'var(--brand-primary-light)' : 'var(--status-warning)',
                                        flexShrink: 0,
                                    }}>
                                        <FileText size={16} />
                                    </div>
                                    {form.name}
                                </td>
                                <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{form.fields}</td>
                                <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{form.uses}</td>
                                <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{new Date(form.lastModified).toLocaleDateString()}</td>
                                <td>
                                    <span className={`badge ${form.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                                        {form.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button className="btn-icon" title="Preview" onClick={() => openModal('preview', form)}><Eye size={14} /></button>
                                        <button className="btn-icon" title="Edit" onClick={() => openModal('edit', form)}><Edit size={14} /></button>
                                        <button className="btn-icon" title="Duplicate" onClick={() => handleDuplicate(form)}><Copy size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <FormModal
                isOpen={modalMode !== null}
                onClose={() => { setModalMode(null); setSelectedForm(null); }}
                onSubmit={modalMode === 'create' ? handleCreate : modalMode === 'edit' ? handleEdit : undefined}
                initialData={selectedForm ? { id: selectedForm.id, name: selectedForm.name, description: selectedForm.description, fields: selectedForm.fields, status: selectedForm.status } : undefined}
                mode={modalMode || 'create'}
            />
        </div>
    );
}
