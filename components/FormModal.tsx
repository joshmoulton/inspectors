'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, FileText } from 'lucide-react';

interface FormData {
    id?: string;
    name: string;
    description: string;
    fields: number;
    status: string;
}

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: FormData) => void;
    initialData?: FormData;
    mode: 'create' | 'edit' | 'preview';
}

export default function FormModal({ isOpen, onClose, onSubmit, initialData, mode }: FormModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState(10);
    const [status, setStatus] = useState('Draft');
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setFields(initialData.fields);
            setStatus(initialData.status);
        } else {
            setName('');
            setDescription('');
            setFields(10);
            setStatus('Draft');
        }
    }, [initialData, isOpen]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }
        if (e.key === 'Tab' && dialogRef.current) {
            const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            document.addEventListener('keydown', handleKeyDown);
            requestAnimationFrame(() => {
                dialogRef.current?.querySelector<HTMLElement>('input:not([disabled])')?.focus();
            });
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previousFocusRef.current?.focus();
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const isPreview = mode === 'preview';
    const title = mode === 'create' ? 'Create New Form' : mode === 'edit' ? 'Edit Form' : 'Preview Form';

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit?.({ id: initialData?.id, name, description, fields, status });
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={dialogRef}
                className="confirm-dialog"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: 480, width: '100%' }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="form-modal-title"
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 id="form-modal-title" style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} style={{ color: 'var(--brand-primary-light)' }} /> {title}
                    </h3>
                    <button onClick={onClose} aria-label="Close dialog" style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Form Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isPreview}
                            required
                            placeholder="e.g., Standard Exterior Inspection"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Description</label>
                        <textarea
                            className="form-control"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isPreview}
                            placeholder="Describe the form's purpose..."
                            maxLength={500}
                            style={{ minHeight: 80, resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Number of Fields</label>
                            <input
                                type="number"
                                className="form-control"
                                value={fields}
                                onChange={(e) => setFields(parseInt(e.target.value) || 0)}
                                disabled={isPreview}
                                min={1}
                                max={100}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Status</label>
                            <select
                                className="form-control"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                disabled={isPreview}
                            >
                                <option value="Draft">Draft</option>
                                <option value="Active">Active</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            {isPreview ? 'Close' : 'Cancel'}
                        </button>
                        {!isPreview && (
                            <button type="submit" className="btn btn-primary">
                                {mode === 'create' ? 'Create Form' : 'Save Changes'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
