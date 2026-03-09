'use client';

import { useState, useRef } from 'react';
import { FileText, BookOpen, GraduationCap, Download, FolderOpen, Upload, X, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Resource {
    name: string;
    type: string;
    size: string;
}

interface Category {
    title: string;
    icon: any;
    color: string;
    bg: string;
    resources: Resource[];
}

const initialCategories: Category[] = [
    {
        title: 'Inspection Guides',
        icon: BookOpen,
        color: 'var(--brand-primary-light)',
        bg: 'rgba(99, 102, 241, 0.12)',
        resources: [
            { name: 'Standard Exterior Inspection Guide', type: 'PDF', size: '2.4 MB' },
            { name: 'Interior Inspection Procedures', type: 'PDF', size: '1.8 MB' },
            { name: 'Photo Requirements Checklist', type: 'PDF', size: '540 KB' },
        ],
    },
    {
        title: 'Client Requirements',
        icon: FileText,
        color: 'var(--status-success)',
        bg: 'rgba(16, 185, 129, 0.12)',
        resources: [
            { name: 'Altisource - Service Level Agreement', type: 'PDF', size: '1.2 MB' },
            { name: 'Safeguard - Inspection Standards', type: 'PDF', size: '890 KB' },
            { name: 'MCS - Photo Submission Guidelines', type: 'PDF', size: '650 KB' },
        ],
    },
    {
        title: 'Training Materials',
        icon: GraduationCap,
        color: 'var(--status-warning)',
        bg: 'rgba(245, 158, 11, 0.12)',
        resources: [
            { name: 'New Inspector Onboarding', type: 'PDF', size: '3.1 MB' },
            { name: 'Quality Control Best Practices', type: 'PDF', size: '1.5 MB' },
            { name: 'Field Safety Procedures', type: 'PDF', size: '720 KB' },
        ],
    },
    {
        title: 'Templates & Forms',
        icon: Download,
        color: 'var(--status-purple)',
        bg: 'rgba(139, 92, 246, 0.12)',
        resources: [
            { name: 'CSV Import Template', type: 'CSV', size: '12 KB' },
            { name: 'Invoice Template', type: 'XLSX', size: '45 KB' },
            { name: 'Property Condition Report', type: 'DOCX', size: '230 KB' },
        ],
    },
];

function generateDownload(resource: Resource) {
    let content: string;
    let mimeType: string;

    if (resource.type === 'CSV') {
        content = 'OrderNumber,Type,Status,Address,City,State,Zip,DueDate,ClientPay,InspectorPay\n"100001","Standard","Open","123 Main St","Springfield","OH","45502","2026-04-01","35.00","25.00"';
        mimeType = 'text/csv';
    } else {
        content = `${resource.name}\n\nThis is a placeholder document for "${resource.name}".\nType: ${resource.type}\nSize: ${resource.size}\n\nIn a production environment, this file would contain the actual document content.`;
        mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = resource.type === 'CSV' ? '.csv' : resource.type === 'XLSX' ? '.xlsx' : resource.type === 'DOCX' ? '.docx' : '.txt';
    a.download = resource.name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_') + ext;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded "${resource.name}"`);
}

export default function ResourcesClient() {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadCategory, setUploadCategory] = useState(initialCategories[0].title);
    const [uploadName, setUploadName] = useState('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        if (!uploadFile) return;

        const name = uploadName || uploadFile.name;
        const ext = uploadFile.name.split('.').pop()?.toUpperCase() || 'FILE';
        const sizeKb = uploadFile.size / 1024;
        const size = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`;

        setCategories(prev => prev.map(cat =>
            cat.title === uploadCategory
                ? { ...cat, resources: [...cat.resources, { name, type: ext, size }] }
                : cat
        ));

        setShowUpload(false);
        setUploadName('');
        setUploadFile(null);
        toast.success(`Resource "${name}" added to ${uploadCategory}`);
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Resources</h1>
                    <p className="page-subtitle">Inspection guides, client requirements, training materials, and templates.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
                        <Upload size={16} /> Upload Resource
                    </button>
                </div>
            </header>

            {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                    <div key={cat.title} style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon size={18} style={{ color: cat.color }} /> {cat.title}
                            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-tertiary)' }}>({cat.resources.length})</span>
                        </h2>
                        <div className="resource-grid">
                            {cat.resources.map((res) => (
                                <div key={res.name} className="resource-card">
                                    <div className="resource-card-icon" style={{ background: cat.bg, color: cat.color }}>
                                        <FolderOpen size={20} />
                                    </div>
                                    <div>
                                        <div className="resource-card-title">{res.name}</div>
                                        <div className="resource-card-description">{res.type} &middot; {res.size}</div>
                                    </div>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                                        onClick={() => generateDownload(res)}
                                    >
                                        <Download size={14} /> Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Upload Modal */}
            {showUpload && (
                <div className="modal-overlay" onClick={() => setShowUpload(false)}>
                    <div className="confirm-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Upload size={18} style={{ color: 'var(--brand-primary-light)' }} /> Upload Resource
                            </h3>
                            <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Category</label>
                                <select className="form-control" value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
                                    {categories.map(c => <option key={c.title} value={c.title}>{c.title}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>File</label>
                                <input ref={fileRef} type="file" className="form-control" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Display Name (optional)</label>
                                <input type="text" className="form-control" value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="Leave blank to use filename" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={!uploadFile}>
                                    <Upload size={14} /> Upload
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
