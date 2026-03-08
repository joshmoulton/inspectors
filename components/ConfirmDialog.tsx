'use client';

import { AlertTriangle, Trash2, Info } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'default';
}

export default function ConfirmDialog({
    isOpen,
    onConfirm,
    onCancel,
    title,
    description,
    confirmLabel = 'Confirm',
    variant = 'default',
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const iconMap = {
        danger: { icon: Trash2, bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-danger)' },
        warning: { icon: AlertTriangle, bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--status-warning)' },
        default: { icon: Info, bg: 'rgba(99, 102, 241, 0.15)', color: 'var(--brand-primary-light)' },
    };

    const { icon: Icon, bg, color } = iconMap[variant];

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-dialog-icon" style={{ background: bg, color }}>
                    <Icon size={24} />
                </div>
                <h3 className="confirm-dialog-title">{title}</h3>
                <p className="confirm-dialog-description">{description}</p>
                <div className="confirm-dialog-actions">
                    <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    <button
                        className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
