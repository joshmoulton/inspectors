'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, ClipboardList, Users, Building2, BookUser,
    LayoutDashboard, Upload, BarChart3, Map, MapPinned, ArrowRight, X
} from 'lucide-react';

interface SearchResult {
    type: 'order' | 'user' | 'client' | 'contact';
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    href: string;
}

const quickActions = [
    { label: 'Go to Dashboard', icon: LayoutDashboard, href: '/', keywords: 'home dashboard' },
    { label: 'View Orders', icon: ClipboardList, href: '/orders', keywords: 'orders list work' },
    { label: 'Create New Order', icon: ClipboardList, href: '/orders/new', keywords: 'new order create' },
    { label: 'Manage Users', icon: Users, href: '/users', keywords: 'users inspectors' },
    { label: 'View Clients', icon: Building2, href: '/clients', keywords: 'clients companies' },
    { label: 'Contacts', icon: BookUser, href: '/contacts', keywords: 'contacts people' },
    { label: 'Import CSV', icon: Upload, href: '/import', keywords: 'import csv upload' },
    { label: 'Reports', icon: BarChart3, href: '/reports', keywords: 'reports analytics' },
    { label: 'Route Map', icon: Map, href: '/routes', keywords: 'map routes locations' },
    { label: 'Zip Zones', icon: MapPinned, href: '/zip-zones', keywords: 'zip zones auto assign' },
];

const typeIcons: Record<string, typeof ClipboardList> = {
    order: ClipboardList,
    user: Users,
    client: Building2,
    contact: BookUser,
};

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // Open/close with Cmd+K / Ctrl+K
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Debounced search
    const search = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults(data.results || []);
        } catch {
            setResults([]);
        }
        setIsSearching(false);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.length >= 2) {
            debounceRef.current = setTimeout(() => search(query), 200);
        } else {
            setResults([]);
        }
        setSelectedIndex(0);
    }, [query, search]);

    // Filtered quick actions
    const filteredActions = query.length > 0
        ? quickActions.filter(a =>
            a.label.toLowerCase().includes(query.toLowerCase()) ||
            a.keywords.toLowerCase().includes(query.toLowerCase())
        )
        : quickActions;

    // Combined items for keyboard navigation
    const allItems = [
        ...results.map(r => ({ type: 'result' as const, ...r })),
        ...filteredActions.map(a => ({ type: 'action' as const, label: a.label, href: a.href, icon: a.icon })),
    ];

    function handleSelect(href: string) {
        setIsOpen(false);
        router.push(href);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && allItems[selectedIndex]) {
            e.preventDefault();
            const item = allItems[selectedIndex];
            handleSelect(item.href);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="command-palette-overlay" onClick={() => setIsOpen(false)}>
            <div className="command-palette" onClick={e => e.stopPropagation()}>
                {/* Search Input */}
                <div className="command-palette-input-wrapper">
                    <Search size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search orders, users, clients... or type a command"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="command-palette-input"
                    />
                    <kbd className="command-palette-kbd">ESC</kbd>
                </div>

                {/* Results */}
                <div className="command-palette-results">
                    {/* Search Results */}
                    {results.length > 0 && (
                        <div className="command-palette-section">
                            <div className="command-palette-section-label">Search Results</div>
                            {results.map((result, i) => {
                                const Icon = typeIcons[result.type] || ClipboardList;
                                const globalIndex = i;
                                return (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        className={`command-palette-item ${selectedIndex === globalIndex ? 'selected' : ''}`}
                                        onClick={() => handleSelect(result.href)}
                                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                                    >
                                        <Icon size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{result.title}</div>
                                            {result.subtitle && (
                                                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {result.subtitle}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`badge badge-${getBadgeColor(result.badge)}`} style={{ fontSize: 10, flexShrink: 0 }}>
                                            {result.badge}
                                        </span>
                                        <ArrowRight size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Loading indicator */}
                    {isSearching && query.length >= 2 && results.length === 0 && (
                        <div style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>
                            Searching...
                        </div>
                    )}

                    {/* No results */}
                    {!isSearching && query.length >= 2 && results.length === 0 && (
                        <div style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>
                            No results found for &ldquo;{query}&rdquo;
                        </div>
                    )}

                    {/* Quick Actions */}
                    {filteredActions.length > 0 && (
                        <div className="command-palette-section">
                            <div className="command-palette-section-label">
                                {query.length > 0 ? 'Actions' : 'Quick Actions'}
                            </div>
                            {filteredActions.map((action, i) => {
                                const globalIndex = results.length + i;
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.href}
                                        className={`command-palette-item ${selectedIndex === globalIndex ? 'selected' : ''}`}
                                        onClick={() => handleSelect(action.href)}
                                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                                    >
                                        <Icon size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                        <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{action.label}</span>
                                        <ArrowRight size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="command-palette-footer">
                    <span><kbd>&uarr;</kbd> <kbd>&darr;</kbd> Navigate</span>
                    <span><kbd>Enter</kbd> Select</span>
                    <span><kbd>Esc</kbd> Close</span>
                </div>
            </div>
        </div>
    );
}

function getBadgeColor(badge: string): string {
    const map: Record<string, string> = {
        'Open': 'info',
        'Unassigned': 'warning',
        'Completed Pending Approval': 'purple',
        'Completed Approved': 'success',
        'Paid': 'success',
        'Cancelled': 'danger',
        'admin': 'danger',
        'manager': 'info',
        'inspector': 'success',
        'client': 'primary',
        'contact': 'gray',
    };
    return map[badge] || 'gray';
}
