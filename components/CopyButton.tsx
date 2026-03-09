'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <button
            onClick={handleCopy}
            title={copied ? 'Copied!' : `Copy ${label || text}`}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: copied ? 'var(--status-success)' : 'var(--text-tertiary)',
                padding: 4,
                borderRadius: 4,
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'color 0.15s',
            }}
            aria-label={copied ? 'Copied' : `Copy ${label || text}`}
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
    );
}
