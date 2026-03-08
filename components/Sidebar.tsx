'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navItems = [
    { label: 'Dashboard', icon: '📊', href: '/', badge: null },
    { label: 'Orders', icon: '📋', href: '/orders', badge: '10' },
    { section: 'Management' },
    { label: 'Import', icon: '📥', href: '/import', badge: null },
    { label: 'Users', icon: '👥', href: '/users', badge: null },
    { label: 'Clients', icon: '🏢', href: '/clients', badge: null },
    { label: 'Contacts', icon: '📇', href: '/contacts', badge: null },
    { section: 'Operations' },
    { label: 'Reports', icon: '📈', href: '/reports', badge: null },
    { label: 'Routes', icon: '🗺️', href: '/routes', badge: null },
    { label: 'Resources', icon: '🔧', href: '/resources', badge: null },
    { section: 'System' },
    { label: 'Utilities', icon: '⚙️', href: '/utilities', badge: null },
    { label: 'FormADE', icon: '📝', href: '/custom-forms', badge: null },
    { label: 'Support', icon: '🎧', href: '/support', badge: null },
];

export function Sidebar({ user, openOrdersCount = 0 }: { user: any, openOrdersCount?: number }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on route change on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Update orders badge dynamically
    const dynamicNavItems = navItems.map(item =>
        item.label === 'Orders' ? { ...item, badge: openOrdersCount > 0 ? openOrdersCount.toString() : null } : item
    );

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Menu"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {isOpen ? (
                        <>
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </>
                    ) : (
                        <>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </>
                    )}
                </svg>
            </button>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div className="sidebar-backdrop" onClick={() => setIsOpen(false)} />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">P</div>
                    <span className="sidebar-title">Powerade</span>
                </div>
                <nav className="sidebar-nav">
                    {dynamicNavItems.map((item, i) => {
                        if ('section' in item) {
                            return (
                                <div key={i} className="nav-section-label">
                                    {item.section}
                                </div>
                            );
                        }
                        const isActive = item.href === '/'
                            ? pathname === '/'
                            : pathname?.startsWith(item.href!);
                        return (
                            <Link
                                key={item.href}
                                href={item.href!}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                                {item.badge && <span className="nav-badge">{item.badge}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-role uppercase tracking-tighter">{user?.role}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="nav-item sign-out mt-2 w-full text-left"
                    >
                        <span className="nav-icon">🚪</span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
