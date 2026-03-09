'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorFallback({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', maxWidth: 440 }}>
                <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', color: 'var(--status-danger)',
                }}>
                    <AlertTriangle size={28} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
                {error.digest && (
                    <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)', marginBottom: 16 }}>
                        Error ID: {error.digest}
                    </p>
                )}
                <button
                    onClick={reset}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                    <RefreshCw size={16} /> Try Again
                </button>
            </div>
        </div>
    );
}
