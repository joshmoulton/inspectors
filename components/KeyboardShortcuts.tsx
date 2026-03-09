'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
    { keys: ['Ctrl', 'K'], description: 'Search orders', section: 'Navigation' },
    { keys: ['Ctrl', 'N'], description: 'New order', section: 'Navigation' },
    { keys: ['G', 'then', 'D'], description: 'Go to Dashboard', section: 'Navigation' },
    { keys: ['G', 'then', 'O'], description: 'Go to Orders', section: 'Navigation' },
    { keys: ['G', 'then', 'R'], description: 'Go to Reports', section: 'Navigation' },
    { keys: ['G', 'then', 'U'], description: 'Go to Users', section: 'Navigation' },
    { keys: ['G', 'then', 'C'], description: 'Go to Clients', section: 'Navigation' },
    { keys: ['?'], description: 'Show keyboard shortcuts', section: 'General' },
    { keys: ['Esc'], description: 'Close dialogs / Clear focus', section: 'General' },
];

export default function KeyboardShortcuts() {
    const router = useRouter();
    const [showHelp, setShowHelp] = useState(false);
    const [goPrefix, setGoPrefix] = useState(false);

    useEffect(() => {
        let goTimer: ReturnType<typeof setTimeout> | null = null;

        function handleKeyDown(e: KeyboardEvent) {
            const tag = (e.target as HTMLElement)?.tagName;
            const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
            const mod = e.metaKey || e.ctrlKey;

            // ? key opens help (not in inputs)
            if (e.key === '?' && !isInput && !mod) {
                e.preventDefault();
                setShowHelp(prev => !prev);
                return;
            }

            // Escape closes help
            if (e.key === 'Escape') {
                if (showHelp) {
                    setShowHelp(false);
                    return;
                }
                // Blur active element
                (document.activeElement as HTMLElement)?.blur?.();
                return;
            }

            // "g" prefix for go-to shortcuts (not in inputs)
            if (e.key === 'g' && !isInput && !mod) {
                if (!goPrefix) {
                    setGoPrefix(true);
                    goTimer = setTimeout(() => setGoPrefix(false), 1500);
                    return;
                }
            }

            // Handle go-to shortcuts
            if (goPrefix && !isInput && !mod) {
                setGoPrefix(false);
                if (goTimer) clearTimeout(goTimer);
                const routes: Record<string, string> = {
                    d: '/', o: '/orders', r: '/reports', u: '/users', c: '/clients',
                };
                if (routes[e.key]) {
                    e.preventDefault();
                    router.push(routes[e.key]);
                    return;
                }
            }

            // Ctrl/Cmd shortcuts
            if (!mod) return;
            if (isInput && e.key !== 'k') return;

            if (e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.sidebar-search input') as HTMLInputElement;
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                } else {
                    router.push('/orders');
                }
            }

            if (e.key === 'n') {
                e.preventDefault();
                router.push('/orders/new');
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if (goTimer) clearTimeout(goTimer);
        };
    }, [router, showHelp, goPrefix]);

    if (!showHelp) return null;

    const sections = [...new Set(SHORTCUTS.map(s => s.section))];

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowHelp(false)}
        >
            <div
                className="card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 520, maxHeight: '80vh',
                    overflow: 'auto', padding: 0,
                }}
            >
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Keyboard size={18} style={{ color: 'var(--brand-primary-light)' }} />
                        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={() => setShowHelp(false)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-tertiary)', padding: 4, borderRadius: 6,
                        }}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div style={{ padding: '16px 24px' }}>
                    {sections.map(section => (
                        <div key={section} style={{ marginBottom: 20 }}>
                            <div style={{
                                fontSize: 10, textTransform: 'uppercase', fontWeight: 700,
                                color: 'var(--text-tertiary)', letterSpacing: '0.08em',
                                marginBottom: 10,
                            }}>
                                {section}
                            </div>
                            {SHORTCUTS.filter(s => s.section === section).map((shortcut, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
                                    }}
                                >
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                        {shortcut.description}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {shortcut.keys.map((key, j) => (
                                            key === 'then' ? (
                                                <span key={j} style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>then</span>
                                            ) : (
                                                <kbd key={j} style={{
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    minWidth: 24, height: 24, padding: '0 6px',
                                                    borderRadius: 5, fontSize: 11, fontWeight: 600,
                                                    fontFamily: 'monospace',
                                                    background: 'var(--bg-surface-hover)',
                                                    border: '1px solid var(--border-default)',
                                                    color: 'var(--text-primary)',
                                                }}>
                                                    {key}
                                                </kbd>
                                            )
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div style={{
                    padding: '12px 24px', borderTop: '1px solid var(--border-subtle)',
                    textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)',
                }}>
                    Press <kbd style={{
                        padding: '1px 5px', borderRadius: 3, fontSize: 10,
                        background: 'var(--bg-surface-hover)', border: '1px solid var(--border-default)',
                    }}>?</kbd> to toggle this dialog
                </div>
            </div>
        </div>
    );
}
