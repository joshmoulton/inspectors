'use client';

import { useFormErrors } from './ActionForm';

interface FormFieldProps {
    label: string;
    name: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}

export default function FormField({ label, name, required, className = 'form-field', children }: FormFieldProps) {
    const errors = useFormErrors();
    const error = errors[name];
    const errorId = `${name}-error`;

    return (
        <div className={className}>
            <label className="form-label" htmlFor={name}>
                {label} {required && <span className="required">*</span>}
            </label>
            {children}
            {error && (
                <span id={errorId} role="alert" style={{
                    display: 'block', fontSize: 12, color: 'var(--status-danger)',
                    marginTop: 4, fontWeight: 500,
                }}>
                    {error}
                </span>
            )}
        </div>
    );
}
