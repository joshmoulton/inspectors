'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    LayoutDashboard, ClipboardList, Upload, Users, Building2, BookUser,
    BarChart3, Map, Wrench, Settings, FileText, Headphones, LogOut,
    PanelLeftClose, PanelLeft, Menu, X, User, ChevronDown, Search, MapPinned
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DropdownMenu from './DropdownMenu';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/', badge: null },
    { label: 'Orders', icon: ClipboardList, href: '/orders', badge: '10' },
    { section: 'Management' },
    { label: 'Import', icon: Upload, href: '/import', badge: null },
    { label: 'Users', icon: Users, href: '/users', badge: null },
    { label: 'Clients', icon: Building2, href: '/clients', badge: null },
    { label: 'Contacts', icon: BookUser, href: '/contacts', badge: null },
    { section: 'Operations' },
    { label: 'Zip Zones', icon: MapPinned, href: '/zip-zones', badge: null },
    { label: 'Reports', icon: BarChart3, href: '/reports', badge: null },
    { label: 'Routes', icon: Map, href: '/routes', badge: null },
    { label: 'Resources', icon: Wrench, href: '/resources', badge: null },
    { section: 'System' },
    { label: 'Utilities', icon: Settings, href: '/utilities', badge: null },
    { label: 'FormADE', icon: FileText, href: '/custom-forms', badge: null },
    { label: 'Support', icon: Headphones, href: '/support', badge: null },
];

export function Sidebar({ user, openOrdersCount = 0 }: { user: any, openOrdersCount?: number }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved === 'true') setCollapsed(true);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    function toggleCollapsed() {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem('sidebar-collapsed', String(next));
    }

    const dynamicNavItems = navItems.map(item =>
        'label' in item && item.label === 'Orders'
            ? { ...item, badge: openOrdersCount > 0 ? openOrdersCount.toLocaleString() : null }
            : item
    );

    const userDropdownItems = [
        { label: 'Profile', icon: <User size={15} />, onClick: () => { router.push('/profile'); } },
        { label: 'Settings', icon: <Settings size={15} />, onClick: () => { window.location.href = '/utilities'; } },
        { divider: true, label: '' },
        { label: 'Sign Out', icon: <LogOut size={15} />, variant: 'danger' as const, onClick: () => signOut() },
    ];

    return (
        <>
            <button
                className="mobile-menu-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Menu"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {isOpen && (
                <div className="sidebar-backdrop" onClick={() => setIsOpen(false)} />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">P</div>
                    <span className="sidebar-title">Powerade</span>
                    {!collapsed && (
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ThemeToggle />
                            <NotificationBell />
                        </div>
                    )}
                </div>
                <div className="sidebar-search">
                    <button
                        className="sidebar-search-wrapper"
                        onClick={() => {
                            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
                        }}
                    >
                        <Search size={14} className="search-icon" />
                        <span style={{ flex: 1, color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'left' }}>Search...</span>
                        <kbd className="command-palette-kbd">{'\u2318'}K</kbd>
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {dynamicNavItems.map((item, i) => {
                        if ('section' in item && item.section) {
                            return (
                                <div key={i} className="nav-section-label">
                                    {item.section}
                                </div>
                            );
                        }
                        if (!('href' in item) || !item.href) return null;
                        const IconComponent = item.icon!;
                        const isActive = item.href === '/'
                            ? pathname === '/'
                            : pathname?.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                title={collapsed ? item.label : undefined}
                            >
                                <span className="nav-icon">
                                    <IconComponent size={18} strokeWidth={2} />
                                </span>
                                <span className="nav-label">{item.label}</span>
                                {item.badge && <span className="nav-badge">{item.badge}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <DropdownMenu
                        trigger={
                            <div className="user-profile" style={{ cursor: 'pointer' }}>
                                <div className="user-avatar">
                                    {user?.name?.[0] || 'U'}
                                </div>
                                <div className="user-info">
                                    <div className="user-name">{user?.name}</div>
                                    <div className="user-role" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role}</div>
                                </div>
                                {!collapsed && <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }} />}
                            </div>
                        }
                        items={userDropdownItems}
                    />
                    <button
                        onClick={toggleCollapsed}
                        className="sidebar-toggle"
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
                        {!collapsed && <span>Collapse</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
