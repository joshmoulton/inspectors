import { ReactNode } from 'react';
import Link from 'next/link';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <h3 className="empty-state-text" style={{ marginBottom: 8 }}>{title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 360, margin: '0 auto 20px' }}>
                {description}
            </p>
            {action && (
                action.href ? (
                    <Link href={action.href} className="btn btn-primary">{action.label}</Link>
                ) : (
                    <button className="btn btn-primary" onClick={action.onClick}>{action.label}</button>
                )
            )}
        </div>
    );
}
