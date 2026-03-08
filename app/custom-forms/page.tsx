import { FileText, Plus, Eye, Edit, Copy } from 'lucide-react';

const formTemplates = [
    { id: '1', name: 'Standard Exterior Inspection', fields: 24, lastModified: '2026-02-15', status: 'Active', uses: 156 },
    { id: '2', name: 'Interior Inspection Report', fields: 32, lastModified: '2026-02-20', status: 'Active', uses: 89 },
    { id: '3', name: 'Contact Inspection Form', fields: 18, lastModified: '2026-01-10', status: 'Active', uses: 45 },
    { id: '4', name: 'Commercial Property Assessment', fields: 41, lastModified: '2026-03-01', status: 'Draft', uses: 0 },
    { id: '5', name: 'Vacant Property Checklist', fields: 15, lastModified: '2026-02-28', status: 'Active', uses: 67 },
    { id: '6', name: 'FEMA Disaster Assessment', fields: 28, lastModified: '2026-03-05', status: 'Draft', uses: 0 },
];

export default function CustomFormsPage() {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">FormADE</h1>
                    <p className="page-subtitle">Create and manage custom inspection forms and field checklists.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary"><Plus size={16} /> Create New Form</button>
                </div>
            </header>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--brand-primary-light)' }}>
                        <FileText size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{formTemplates.length}</div>
                        <div className="stat-label">Total Forms</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)' }}>
                        <FileText size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{formTemplates.filter(f => f.status === 'Active').length}</div>
                        <div className="stat-label">Active Forms</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--status-warning)' }}>
                        <Edit size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{formTemplates.filter(f => f.status === 'Draft').length}</div>
                        <div className="stat-label">Drafts</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--status-purple)' }}>
                        <FileText size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{formTemplates.reduce((s, f) => s + f.uses, 0)}</div>
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
                        {formTemplates.map((form) => (
                            <tr key={form.id}>
                                <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8,
                                        background: form.status === 'Active' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: form.status === 'Active' ? 'var(--brand-primary-light)' : 'var(--status-warning)',
                                        flexShrink: 0
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
                                        <button className="btn-icon" title="Preview"><Eye size={14} /></button>
                                        <button className="btn-icon" title="Edit"><Edit size={14} /></button>
                                        <button className="btn-icon" title="Duplicate"><Copy size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
