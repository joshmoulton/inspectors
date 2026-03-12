'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPinned, Zap } from 'lucide-react';

interface Props {
    onSuggest?: (inspectorId: string) => void;
}

export default function ZipInspectorHint({ onSuggest }: Props) {
    const [hint, setHint] = useState<{ name: string; id: string; openOrders: number; totalCoverage: number } | null>(null);
    const [lastZip, setLastZip] = useState('');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Watch the zip input field for changes
        const zipInput = document.querySelector('input[name="zip"]') as HTMLInputElement | null;
        if (!zipInput) return;

        function handleInput() {
            const val = zipInput!.value.trim();
            if (val === lastZip) return;
            setLastZip(val);

            if (timerRef.current) clearTimeout(timerRef.current);

            if (!/^\d{5}$/.test(val)) {
                setHint(null);
                return;
            }

            timerRef.current = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/zip-assignments/lookup?zip=${val}`);
                    const data = await res.json();
                    if (data.inspector) {
                        setHint({
                            name: data.inspector.name,
                            id: data.inspector.id,
                            openOrders: data.inspector.openOrders,
                            totalCoverage: data.totalCoverage,
                        });
                    } else {
                        setHint(null);
                    }
                } catch {
                    setHint(null);
                }
            }, 300);
        }

        zipInput.addEventListener('input', handleInput);
        // Check initial value
        handleInput();

        return () => {
            zipInput.removeEventListener('input', handleInput);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [lastZip]);

    if (!hint) return null;

    function handleAutoAssign() {
        // Select the inspector in the dropdown
        const select = document.querySelector('select[name="inspectorId"]') as HTMLSelectElement | null;
        if (select) {
            select.value = hint!.id;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }
        onSuggest?.(hint!.id);
    }

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: 13, marginTop: 8,
        }}>
            <MapPinned size={14} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <strong style={{ color: 'var(--status-success)' }}>{hint.name}</strong> covers this zip
                <span style={{ color: 'var(--text-tertiary)', marginLeft: 6, fontSize: 11 }}>
                    ({hint.openOrders} open order{hint.openOrders !== 1 ? 's' : ''})
                    {hint.totalCoverage > 1 && ` · ${hint.totalCoverage} inspectors in zone`}
                </span>
            </div>
            <button
                type="button"
                className="btn btn-sm"
                style={{
                    background: 'var(--status-success)', color: 'white',
                    border: 'none', padding: '4px 10px', fontSize: 12, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4, borderRadius: 6, cursor: 'pointer',
                }}
                onClick={handleAutoAssign}
            >
                <Zap size={12} /> Assign
            </button>
        </div>
    );
}
