'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Edit, Copy, Trash2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import FormBuilder, { type FormField } from '@/components/FormBuilder';
import ConfirmDialog from '@/components/ConfirmDialog';

interface FormTemplate {
    id: string;
    name: string;
    description: string;
    fields: FormField[];
    lastModified: string;
    status: string;
    uses: number;
}

// Default field sets for initial templates
const exteriorFields: FormField[] = [
    { id: 'f1', type: 'section', label: 'Property Information', required: false },
    { id: 'f2', type: 'text', label: 'Property Address', required: true, placeholder: 'Full street address' },
    { id: 'f3', type: 'select', label: 'Property Type', required: true, options: ['Single Family', 'Multi-Family', 'Condo', 'Townhouse', 'Commercial'] },
    { id: 'f4', type: 'select', label: 'Occupancy Status', required: true, options: ['Occupied', 'Vacant', 'Unknown'] },
    { id: 'f5', type: 'section', label: 'Exterior Condition', required: false },
    { id: 'f6', type: 'select', label: 'Roof Condition', required: true, options: ['Good', 'Fair', 'Poor', 'Damaged'] },
    { id: 'f7', type: 'select', label: 'Siding Condition', required: true, options: ['Good', 'Fair', 'Poor', 'Damaged'] },
    { id: 'f8', type: 'select', label: 'Foundation', required: true, options: ['Good', 'Minor Cracks', 'Major Cracks', 'Settling'] },
    { id: 'f9', type: 'select', label: 'Yard Condition', required: true, options: ['Maintained', 'Overgrown', 'Debris Present'] },
    { id: 'f10', type: 'checkbox', label: 'Broken Windows', required: false },
    { id: 'f11', type: 'checkbox', label: 'Graffiti Present', required: false },
    { id: 'f12', type: 'checkbox', label: 'Posted Notices', required: false },
    { id: 'f13', type: 'section', label: 'Photos & Notes', required: false },
    { id: 'f14', type: 'photo', label: 'Front of Property', required: true },
    { id: 'f15', type: 'photo', label: 'Rear of Property', required: true },
    { id: 'f16', type: 'photo', label: 'Left Side', required: false },
    { id: 'f17', type: 'photo', label: 'Right Side', required: false },
    { id: 'f18', type: 'photo', label: 'Street View', required: true },
    { id: 'f19', type: 'textarea', label: 'Additional Notes', required: false, placeholder: 'Any observations or concerns...' },
    { id: 'f20', type: 'date', label: 'Inspection Date', required: true },
];

const initialTemplates: FormTemplate[] = [
    { id: '1', name: 'Standard Exterior Inspection', description: 'Standard exterior property inspection checklist', fields: exteriorFields, lastModified: '2026-02-15', status: 'Active', uses: 156 },
    { id: '2', name: 'Interior Inspection Report', description: 'Full interior inspection with room-by-room assessment', fields: [], lastModified: '2026-02-20', status: 'Active', uses: 89 },
    { id: '3', name: 'Contact Inspection Form', description: 'Contact-based inspection with occupant interview', fields: [], lastModified: '2026-01-10', status: 'Active', uses: 45 },
    { id: '4', name: 'Commercial Property Assessment', description: 'Commercial property condition assessment', fields: [], lastModified: '2026-03-01', status: 'Draft', uses: 0 },
    { id: '5', name: 'Vacant Property Checklist', description: 'Vacant property security and condition checklist', fields: [], lastModified: '2026-02-28', status: 'Active', uses: 67 },
    { id: '6', name: 'FEMA Disaster Assessment', description: 'Post-disaster property assessment form', fields: [], lastModified: '2026-03-05', status: 'Draft', uses: 0 },
];

export default function CustomFormsClient() {
    const [templates, setTemplates] = useState<FormTemplate[]>(initialTemplates);
    const [builderMode, setBuilderMode] = useState<'create' | 'edit' | 'preview' | null>(null);
    const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
    const [deleteForm, setDeleteForm] = useState<FormTemplate | null>(null);
    const [search, setSearch] = useState('');
    const [loaded, setLoaded] = useState(false);

    // Load templates from API on mount
    useEffect(() => {
        fetch('/api/form-templates')
            .then(r => r.json())
            .then((data: any[]) => {
                if (data && data.length > 0) {
                    const mapped: FormTemplate[] = data.map(t => ({
                        id: t.id,
                        name: t.name,
                        description: t.description || '',
                        fields: (t.fields || []) as FormField[],
                        lastModified: t.updatedAt ? new Date(t.updatedAt).toISOString().split('T')[0] : '',
                        status: 'Active',
                        uses: 0,
                    }));
                    setTemplates(mapped);
                }
                setLoaded(true);
            })
            .catch(() => setLoaded(true));
    }, []);

    const filtered = search
        ? templates.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase()))
        : templates;

    async function handleSave(data: { name: string; description: string; status: string; fields: FormField[] }) {
        if (builderMode === 'create') {
            try {
                const res = await fetch('/api/form-templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: data.name, description: data.description, fields: data.fields }),
                });
                const created = await res.json();
                const newForm: FormTemplate = {
                    id: created.id || String(Date.now()),
                    name: data.name,
                    description: data.description,
                    fields: data.fields,
                    status: 'Active',
                    lastModified: new Date().toISOString().split('T')[0],
                    uses: 0,
                };
                setTemplates(prev => [...prev, newForm]);
                toast.success(`Form "${data.name}" created with ${data.fields.length} fields`);
            } catch {
                toast.error('Failed to save form template');
            }
        } else if (builderMode === 'edit' && selectedForm) {
            try {
                await fetch(`/api/form-templates/${selectedForm.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: data.name, description: data.description, fields: data.fields }),
                });
                setTemplates(prev => prev.map(f =>
                    f.id === selectedForm.id
                        ? { ...f, name: data.name, description: data.description, status: data.status, fields: data.fields, lastModified: new Date().toISOString().split('T')[0] }
                        : f
                ));
                toast.success(`Form "${data.name}" updated`);
            } catch {
                toast.error('Failed to update form template');
            }
        }
        setBuilderMode(null);
        setSelectedForm(null);
    }

    async function handleDuplicate(form: FormTemplate) {
        try {
            const res = await fetch('/api/form-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `${form.name} (Copy)`, description: form.description, fields: form.fields }),
            });
            const created = await res.json();
            const duplicate: FormTemplate = {
                id: created.id || String(Date.now()),
                name: `${form.name} (Copy)`,
                description: form.description,
                fields: form.fields,
                status: 'Active',
                lastModified: new Date().toISOString().split('T')[0],
                uses: 0,
            };
            setTemplates(prev => [...prev, duplicate]);
            toast.success(`Form duplicated as "${duplicate.name}"`);
        } catch {
            toast.error('Failed to duplicate form');
        }
    }

    async function handleDelete() {
        if (!deleteForm) return;
        try {
            await fetch(`/api/form-templates/${deleteForm.id}`, { method: 'DELETE' });
            setTemplates(prev => prev.filter(f => f.id !== deleteForm.id));
            toast.success(`Form "${deleteForm.name}" deleted`);
        } catch {
            toast.error('Failed to delete form');
        }
        setDeleteForm(null);
    }

    function openBuilder(mode: 'create' | 'edit' | 'preview', form?: FormTemplate) {
        setBuilderMode(mode);
        setSelectedForm(form || null);
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">FormADE</h1>
                    <p className="page-subtitle">Create and manage custom inspection forms with drag-and-drop field builder.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => openBuilder('create')}>
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
                        <div className="stat-value">{templates.reduce((s, f) => s + f.uses, 0).toLocaleString()}</div>
                        <div className="stat-label">Total Submissions</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 16, position: 'relative', maxWidth: 320 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search forms..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: 36 }}
                    aria-label="Search forms"
                />
                {search && (
                    <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }} aria-label="Clear search">
                        <X size={14} />
                    </button>
                )}
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
                        {filtered.map((form) => (
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
                                    <div>
                                        {form.name}
                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 400, marginTop: 2 }}>{form.description}</div>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{form.fields.length}</td>
                                <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{form.uses}</td>
                                <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{new Date(form.lastModified).toLocaleDateString()}</td>
                                <td>
                                    <span className={`badge ${form.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                                        {form.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button className="btn-icon" title="Preview" onClick={() => openBuilder('preview', form)}><Eye size={14} /></button>
                                        <button className="btn-icon" title="Edit" onClick={() => openBuilder('edit', form)}><Edit size={14} /></button>
                                        <button className="btn-icon" title="Duplicate" onClick={() => handleDuplicate(form)}><Copy size={14} /></button>
                                        <button className="btn-icon" title="Delete" onClick={() => setDeleteForm(form)} style={{ color: 'var(--status-danger)' }}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                                    {search ? `No forms matching "${search}"` : 'No forms yet. Create your first form to get started.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Form Builder Modal */}
            <FormBuilder
                isOpen={builderMode !== null}
                onClose={() => { setBuilderMode(null); setSelectedForm(null); }}
                onSave={handleSave}
                initialData={selectedForm ? {
                    name: selectedForm.name,
                    description: selectedForm.description,
                    status: selectedForm.status,
                    fields: selectedForm.fields,
                } : undefined}
                mode={builderMode || 'create'}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteForm !== null}
                title="Delete Form"
                description={`Are you sure you want to delete "${deleteForm?.name}"? This action cannot be undone.`}
                confirmLabel="Delete Form"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteForm(null)}
            />
        </div>
    );
}
