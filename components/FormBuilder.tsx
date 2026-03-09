'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Plus, GripVertical, Trash2, ChevronDown, ChevronUp, Type, Hash, ToggleLeft, List, Calendar, Image, FileText, AlignLeft, Save } from 'lucide-react';

export interface FormField {
    id: string;
    type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'photo' | 'section';
    label: string;
    required: boolean;
    options?: string[]; // for select fields
    placeholder?: string;
}

interface FormBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; description: string; status: string; fields: FormField[] }) => void;
    initialData?: {
        name: string;
        description: string;
        status: string;
        fields: FormField[];
    };
    mode: 'create' | 'edit' | 'preview';
}

const FIELD_TYPES: { type: FormField['type']; label: string; icon: any }[] = [
    { type: 'text', label: 'Text Input', icon: Type },
    { type: 'number', label: 'Number', icon: Hash },
    { type: 'textarea', label: 'Text Area', icon: AlignLeft },
    { type: 'select', label: 'Dropdown', icon: List },
    { type: 'checkbox', label: 'Checkbox', icon: ToggleLeft },
    { type: 'date', label: 'Date', icon: Calendar },
    { type: 'photo', label: 'Photo Upload', icon: Image },
    { type: 'section', label: 'Section Header', icon: FileText },
];

function getFieldIcon(type: FormField['type']) {
    const config = FIELD_TYPES.find(t => t.type === type);
    if (!config) return <Type size={14} />;
    const Icon = config.icon;
    return <Icon size={14} />;
}

export default function FormBuilder({ isOpen, onClose, onSave, initialData, mode }: FormBuilderProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('Draft');
    const [fields, setFields] = useState<FormField[]>([]);
    const [expandedField, setExpandedField] = useState<string | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setStatus(initialData.status);
            setFields(initialData.fields || []);
        } else if (isOpen) {
            setName('');
            setDescription('');
            setStatus('Draft');
            setFields([]);
        }
    }, [isOpen, initialData]);

    // Focus trap + Escape
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') { onClose(); return; }
        if (e.key === 'Tab' && dialogRef.current) {
            const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            document.addEventListener('keydown', handleKeyDown);
            requestAnimationFrame(() => {
                dialogRef.current?.querySelector<HTMLElement>('input')?.focus();
            });
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previousFocusRef.current?.focus();
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const isPreview = mode === 'preview';

    function addField(type: FormField['type']) {
        const newField: FormField = {
            id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            type,
            label: type === 'section' ? 'New Section' : `New ${FIELD_TYPES.find(t => t.type === type)?.label || 'Field'}`,
            required: false,
            options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
            placeholder: '',
        };
        setFields(prev => [...prev, newField]);
        setExpandedField(newField.id);
    }

    function updateField(id: string, updates: Partial<FormField>) {
        setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    }

    function removeField(id: string) {
        setFields(prev => prev.filter(f => f.id !== id));
        if (expandedField === id) setExpandedField(null);
    }

    function moveField(index: number, direction: -1 | 1) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= fields.length) return;
        const newFields = [...fields];
        [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
        setFields(newFields);
    }

    function handleDragStart(index: number) {
        setDragIndex(index);
    }

    function handleDragOver(e: React.DragEvent, index: number) {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;
        const newFields = [...fields];
        const [moved] = newFields.splice(dragIndex, 1);
        newFields.splice(index, 0, moved);
        setFields(newFields);
        setDragIndex(index);
    }

    function handleDragEnd() {
        setDragIndex(null);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSave({ name, description, status, fields });
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={dialogRef}
                className="confirm-dialog"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: 720, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                role="dialog"
                aria-modal="true"
                aria-label={mode === 'create' ? 'Create Form' : mode === 'edit' ? 'Edit Form' : 'Preview Form'}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} style={{ color: 'var(--brand-primary-light)' }} />
                        {mode === 'create' ? 'Create New Form' : mode === 'edit' ? 'Edit Form' : 'Preview Form'}
                    </h3>
                    <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto', flex: 1 }}>
                    {/* Name + Description */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label className="form-label">Form Name</label>
                            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} disabled={isPreview} required placeholder="e.g., Standard Exterior Inspection" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label className="form-label">Status</label>
                            <select className="form-control" value={status} onChange={e => setStatus(e.target.value)} disabled={isPreview}>
                                <option value="Draft">Draft</option>
                                <option value="Active">Active</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label className="form-label">Description</label>
                        <input type="text" className="form-control" value={description} onChange={e => setDescription(e.target.value)} disabled={isPreview} placeholder="Brief description of this form..." />
                    </div>

                    {/* Field Type Palette */}
                    {!isPreview && (
                        <div>
                            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Add Fields</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {FIELD_TYPES.map(ft => {
                                    const Icon = ft.icon;
                                    return (
                                        <button
                                            key={ft.type}
                                            type="button"
                                            onClick={() => addField(ft.type)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '6px 12px', borderRadius: 6,
                                                background: 'rgba(99, 102, 241, 0.08)',
                                                border: '1px solid rgba(99, 102, 241, 0.15)',
                                                color: 'var(--text-secondary)', fontSize: 12,
                                                cursor: 'pointer', transition: 'all 0.15s',
                                                fontFamily: 'inherit',
                                            }}
                                        >
                                            <Icon size={13} style={{ color: 'var(--brand-primary-light)' }} />
                                            {ft.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Fields List */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <label className="form-label">Form Fields ({fields.length})</label>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 360, overflowY: 'auto' }}>
                            {fields.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-tertiary)', fontSize: 13, border: '2px dashed var(--border-subtle)', borderRadius: 8 }}>
                                    {isPreview ? 'No fields defined' : 'Click a field type above to start building your form'}
                                </div>
                            )}
                            {fields.map((field, idx) => (
                                <div
                                    key={field.id}
                                    draggable={!isPreview}
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDragEnd={handleDragEnd}
                                    style={{
                                        background: field.type === 'section' ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                                        border: `1px solid ${dragIndex === idx ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                                        borderRadius: 8, overflow: 'hidden',
                                        opacity: dragIndex === idx ? 0.7 : 1,
                                    }}
                                >
                                    {/* Field Header */}
                                    <div
                                        onClick={() => !isPreview && setExpandedField(expandedField === field.id ? null : field.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '8px 12px', cursor: isPreview ? 'default' : 'pointer',
                                        }}
                                    >
                                        {!isPreview && (
                                            <GripVertical size={14} style={{ color: 'var(--text-tertiary)', cursor: 'grab', flexShrink: 0 }} />
                                        )}
                                        <div style={{ color: 'var(--brand-primary-light)', flexShrink: 0 }}>
                                            {getFieldIcon(field.type)}
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
                                            {field.label}
                                            {field.required && <span style={{ color: 'var(--status-danger)', marginLeft: 4 }}>*</span>}
                                        </span>
                                        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                                            {field.type}
                                        </span>
                                        {!isPreview && (
                                            <div style={{ display: 'flex', gap: 2 }}>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); moveField(idx, -1); }} disabled={idx === 0}
                                                    style={{ background: 'none', border: 'none', color: idx === 0 ? 'var(--border-subtle)' : 'var(--text-tertiary)', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: 2 }}>
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); moveField(idx, 1); }} disabled={idx === fields.length - 1}
                                                    style={{ background: 'none', border: 'none', color: idx === fields.length - 1 ? 'var(--border-subtle)' : 'var(--text-tertiary)', cursor: idx === fields.length - 1 ? 'not-allowed' : 'pointer', padding: 2 }}>
                                                    <ChevronDown size={14} />
                                                </button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                                                    style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', padding: 2, marginLeft: 4 }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Editor */}
                                    {expandedField === field.id && !isPreview && (
                                        <div style={{ padding: '8px 12px 12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    <label style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Label</label>
                                                    <input type="text" className="form-control" value={field.label}
                                                        onChange={e => updateField(field.id, { label: e.target.value })}
                                                        style={{ fontSize: 13 }}
                                                    />
                                                </div>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', paddingBottom: 8 }}>
                                                    <input type="checkbox" checked={field.required}
                                                        onChange={e => updateField(field.id, { required: e.target.checked })}
                                                    />
                                                    Required
                                                </label>
                                            </div>
                                            {(field.type === 'text' || field.type === 'textarea' || field.type === 'number') && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    <label style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Placeholder</label>
                                                    <input type="text" className="form-control" value={field.placeholder || ''}
                                                        onChange={e => updateField(field.id, { placeholder: e.target.value })}
                                                        style={{ fontSize: 13 }}
                                                    />
                                                </div>
                                            )}
                                            {field.type === 'select' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    <label style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Options (one per line)</label>
                                                    <textarea
                                                        className="form-control"
                                                        value={(field.options || []).join('\n')}
                                                        onChange={e => updateField(field.id, { options: e.target.value.split('\n') })}
                                                        style={{ fontSize: 13, minHeight: 60, resize: 'vertical' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, flexShrink: 0, borderTop: '1px solid var(--border-subtle)' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            {isPreview ? 'Close' : 'Cancel'}
                        </button>
                        {!isPreview && (
                            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
                                <Save size={14} /> {mode === 'create' ? 'Create Form' : 'Save Changes'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
