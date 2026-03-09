'use client';

import { useEffect, useRef, useCallback } from 'react';
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
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel();
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
    }, [onCancel]);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            document.addEventListener('keydown', handleKeyDown);
            requestAnimationFrame(() => {
                dialogRef.current?.querySelector<HTMLElement>('button')?.focus();
            });
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previousFocusRef.current?.focus();
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const iconMap = {
        danger: { icon: Trash2, bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-danger)' },
        warning: { icon: AlertTriangle, bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--status-warning)' },
        default: { icon: Info, bg: 'rgba(99, 102, 241, 0.15)', color: 'var(--brand-primary-light)' },
    };

    const { icon: Icon, bg, color } = iconMap[variant];

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                ref={dialogRef}
                className="confirm-dialog"
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-desc"
            >
                <div className="confirm-dialog-icon" style={{ background: bg, color }}>
                    <Icon size={24} />
                </div>
                <h3 id="confirm-title" className="confirm-dialog-title">{title}</h3>
                <p id="confirm-desc" className="confirm-dialog-description">{description}</p>
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
