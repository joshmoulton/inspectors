'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Save, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface FieldDef {
    id: string;
    type: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
}

interface SubmissionData {
    id: string;
    templateId: string;
    orderId: string;
    data: Record<string, any>;
    completedAt: string | null;
    template: {
        id: string;
        name: string;
        description: string;
        fields: FieldDef[];
    };
}

export default function FormFillPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;
    const submissionId = params.submissionId as string;

    const [submission, setSubmission] = useState<SubmissionData | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/form-submissions/${submissionId}`)
            .then(r => r.json())
            .then((data: SubmissionData) => {
                setSubmission(data);
                setFormData(data.data || {});
                setLoading(false);
            })
            .catch(() => {
                toast.error('Failed to load form');
                setLoading(false);
            });
    }, [submissionId]);

    function updateField(fieldId: string, value: any) {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    }

    async function handleSave(complete = false) {
        setSaving(true);
        try {
            await fetch(`/api/form-submissions/${submissionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: formData, complete }),
            });
            if (complete) {
                toast.success('Form completed successfully');
                router.push(`/orders/${orderId}#forms`);
            } else {
                toast.success('Progress saved');
            }
        } catch {
            toast.error('Failed to save');
        }
        setSaving(false);
    }

    if (loading) {
        return (
            <div className="page-container" style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
                Loading form...
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="page-container" style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
                Form submission not found.
            </div>
        );
    }

    const isCompleted = !!submission.completedAt;
    const fields = submission.template.fields || [];

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={20} style={{ color: 'var(--brand-primary-light)' }} />
                        {submission.template.name}
                    </h1>
                    <p className="page-subtitle">
                        {isCompleted
                            ? `Completed on ${new Date(submission.completedAt!).toLocaleDateString()}`
                            : submission.template.description || 'Fill out the form fields below.'
                        }
                    </p>
                </div>
                <div className="header-actions">
                    <Link href={`/orders/${orderId}#forms`} className="btn btn-secondary">
                        <ArrowLeft size={14} /> Back to Order
                    </Link>
                    {!isCompleted && (
                        <>
                            <button className="btn btn-secondary" onClick={() => handleSave(false)} disabled={saving}>
                                <Save size={14} /> Save Draft
                            </button>
                            <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving}>
                                <CheckCircle size={14} /> Complete Form
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="form-page">
                <section className="form-card" style={{ maxWidth: 720 }}>
                    {fields.map((field) => (
                        <FormFieldRenderer
                            key={field.id}
                            field={field}
                            value={formData[field.id] ?? ''}
                            onChange={(v) => updateField(field.id, v)}
                            disabled={isCompleted}
                        />
                    ))}
                    {fields.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: 13 }}>
                            This form template has no fields defined.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function FormFieldRenderer({ field, value, onChange, disabled }: {
    field: { id: string; type: string; label: string; required?: boolean; placeholder?: string; options?: string[] };
    value: any;
    onChange: (v: any) => void;
    disabled: boolean;
}) {
    if (field.type === 'section') {
        return (
            <h3 style={{
                fontSize: 14, fontWeight: 700, margin: '20px 0 8px',
                paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
            }}>
                {field.label}
            </h3>
        );
    }

    const labelEl = (
        <label className="form-label" htmlFor={field.id}>
            {field.label} {field.required && <span className="required">*</span>}
        </label>
    );

    let input;

    switch (field.type) {
        case 'text':
            input = (
                <input
                    type="text" id={field.id} className="form-control"
                    value={value} onChange={e => onChange(e.target.value)}
                    placeholder={field.placeholder} disabled={disabled}
                />
            );
            break;
        case 'textarea':
            input = (
                <textarea
                    id={field.id} className="form-control"
                    value={value} onChange={e => onChange(e.target.value)}
                    placeholder={field.placeholder} disabled={disabled}
                    style={{ minHeight: 100 }}
                />
            );
            break;
        case 'select':
            input = (
                <select
                    id={field.id} className="form-control"
                    value={value} onChange={e => onChange(e.target.value)}
                    disabled={disabled}
                >
                    <option value="">Select...</option>
                    {(field.options || []).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );
            break;
        case 'checkbox':
            input = (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: disabled ? 'default' : 'pointer' }}>
                    <input
                        type="checkbox" id={field.id}
                        checked={!!value} onChange={e => onChange(e.target.checked)}
                        disabled={disabled}
                    />
                    <span style={{ fontSize: 14 }}>{field.label}</span>
                </label>
            );
            return <div className="form-field" style={{ padding: '8px 0' }}>{input}</div>;
        case 'date':
            input = (
                <input
                    type="date" id={field.id} className="form-control"
                    value={value} onChange={e => onChange(e.target.value)}
                    disabled={disabled}
                />
            );
            break;
        case 'photo':
            input = (
                <div style={{
                    padding: 20, borderRadius: 8, textAlign: 'center',
                    border: '2px dashed var(--border-subtle)',
                    color: 'var(--text-tertiary)', fontSize: 13,
                }}>
                    {value ? (
                        <span style={{ color: 'var(--status-success)' }}>Photo captured</span>
                    ) : (
                        'Photo upload available on mobile device'
                    )}
                </div>
            );
            break;
        default:
            input = (
                <input
                    type="text" id={field.id} className="form-control"
                    value={value} onChange={e => onChange(e.target.value)}
                    disabled={disabled}
                />
            );
    }

    return (
        <div className="form-field" style={{ marginBottom: 12 }}>
            {field.type !== 'checkbox' && labelEl}
            {input}
        </div>
    );
}
