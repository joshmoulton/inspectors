import { FileText, BookOpen, GraduationCap, Download, FolderOpen, Search } from 'lucide-react';

const categories = [
    {
        title: 'Inspection Guides',
        icon: BookOpen,
        color: 'var(--brand-primary-light)',
        bg: 'rgba(99, 102, 241, 0.12)',
        resources: [
            { name: 'Standard Exterior Inspection Guide', type: 'PDF', size: '2.4 MB' },
            { name: 'Interior Inspection Procedures', type: 'PDF', size: '1.8 MB' },
            { name: 'Photo Requirements Checklist', type: 'PDF', size: '540 KB' },
        ]
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
        ]
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
        ]
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
        ]
    },
];

export default function ResourcesPage() {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Resources</h1>
                    <p className="page-subtitle">Inspection guides, client requirements, training materials, and templates.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary"><Download size={16} /> Upload Resource</button>
                </div>
            </header>

            {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                    <div key={cat.title} style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon size={18} style={{ color: cat.color }} /> {cat.title}
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
                                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
                                        <Download size={14} /> Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
