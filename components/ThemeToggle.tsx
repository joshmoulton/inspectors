'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const options = [
        { value: 'light' as const, icon: Sun, label: 'Light' },
        { value: 'dark' as const, icon: Moon, label: 'Dark' },
        { value: 'system' as const, icon: Monitor, label: 'System' },
    ];

    return (
        <div style={{
            display: 'flex',
            background: 'var(--bg-surface)',
            borderRadius: 8,
            padding: 2,
            gap: 2,
        }}>
            {options.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    title={label}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 30,
                        height: 28,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        background: theme === value ? 'var(--brand-primary)' : 'transparent',
                        color: theme === value ? 'white' : 'var(--text-tertiary)',
                        transition: 'all 150ms ease',
                    }}
                    aria-label={`${label} theme`}
                    aria-pressed={theme === value}
                >
                    <Icon size={14} />
                </button>
            ))}
        </div>
    );
}
