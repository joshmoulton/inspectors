'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Plus, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Submission {
    id: string;
    templateId: string;
    templateName: string;
    completedAt: string | null;
    createdAt: string;
}

interface Template {
    id: string;
    name: string;
    description: string;
}

export default function OrderFormsTab({ orderId, submissions: initial }: { orderId: string; submissions: Submission[] }) {
    const [submissions, setSubmissions] = useState(initial);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (showPicker && templates.length === 0) {
            fetch('/api/form-templates')
                .then(r => r.json())
                .then(setTemplates)
                .catch(() => {});
        }
    }, [showPicker, templates.length]);

    async function assignForm(templateId: string, templateName: string) {
        setAssigning(true);
        try {
            const res = await fetch('/api/form-submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId, orderId }),
            });
            const created = await res.json();
            setSubmissions(prev => [{
                id: created.id,
                templateId,
                templateName,
                completedAt: null,
                createdAt: new Date().toISOString(),
            }, ...prev]);
            toast.success(`Form "${templateName}" assigned to order`);
            setShowPicker(false);
        } catch {
            toast.error('Failed to assign form');
        }
        setAssigning(false);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Assigned Forms</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowPicker(!showPicker)}>
                    <Plus size={14} /> Assign Form
                </button>
            </div>

            {showPicker && (
                <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Select a form template:</div>
                    {templates.length === 0 ? (
                        <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: 16, textAlign: 'center' }}>
                            Loading templates...
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {templates.map(t => (
                                <button
                                    key={t.id}
                                    className="card"
                                    onClick={() => assignForm(t.id, t.name)}
                                    disabled={assigning}
                                    style={{
                                        padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
                                        transition: 'border-color 0.15s',
                                    }}
                                >
                                    <FileText size={16} style={{ color: 'var(--brand-primary-light)', flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                                        {t.description && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{t.description}</div>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {submissions.length > 0 ? (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Form</th>
                                <th>Status</th>
                                <th>Assigned</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map(s => (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FileText size={14} style={{ color: 'var(--brand-primary-light)' }} />
                                        {s.templateName}
                                    </td>
                                    <td>
                                        {s.completedAt ? (
                                            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                <CheckCircle size={12} /> Completed
                                            </span>
                                        ) : (
                                            <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                <Clock size={12} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                                        {new Date(s.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <Link
                                            href={`/orders/${orderId}/forms/${s.id}`}
                                            className="btn btn-secondary btn-sm"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                        >
                                            <ExternalLink size={12} /> {s.completedAt ? 'View' : 'Fill Out'}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : !showPicker ? (
                <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: 13 }}>
                    No forms assigned to this order yet. Click &quot;Assign Form&quot; to get started.
                </div>
            ) : null}
        </div>
    );
}
