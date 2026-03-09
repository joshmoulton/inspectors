'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, AlertTriangle, Clock, Users, CheckCircle, X } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    orderId?: string;
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [counts, setCounts] = useState({ total: 0, critical: 0, warning: 0 });
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();

        let interval: ReturnType<typeof setInterval>;

        function startPolling() {
            interval = setInterval(fetchNotifications, 60000);
        }

        function handleVisibilityChange() {
            if (document.hidden) {
                clearInterval(interval);
            } else {
                fetchNotifications(); // Refresh immediately when tab becomes visible
                startPolling();
            }
        }

        startPolling();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    async function fetchNotifications() {
        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(data.notifications || []);
            setCounts(data.counts || { total: 0, critical: 0, warning: 0 });
        } catch {
            // Silently fail
        }
    }

    function getIcon(type: string) {
        switch (type) {
            case 'overdue': return <Clock size={14} />;
            case 'unassigned': return <Users size={14} />;
            case 'approval': return <CheckCircle size={14} />;
            default: return <Bell size={14} />;
        }
    }

    function getSeverityColor(severity: string) {
        switch (severity) {
            case 'critical': return { bg: 'rgba(239, 68, 68, 0.12)', color: 'var(--status-danger)', border: 'rgba(239, 68, 68, 0.2)' };
            case 'warning': return { bg: 'rgba(245, 158, 11, 0.12)', color: 'var(--status-warning)', border: 'rgba(245, 158, 11, 0.2)' };
            default: return { bg: 'rgba(59, 130, 246, 0.12)', color: 'var(--status-info)', border: 'rgba(59, 130, 246, 0.2)' };
        }
    }

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: counts.critical > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${counts.critical > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`,
                    color: counts.critical > 0 ? 'var(--status-danger)' : 'var(--text-secondary)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', transition: 'all 200ms ease',
                }}
            >
                <Bell size={16} />
                {counts.total > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        width: 18, height: 18, borderRadius: '50%',
                        background: counts.critical > 0 ? 'var(--status-danger)' : 'var(--status-warning)',
                        color: 'white', fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid var(--bg-surface)',
                    }}>
                        {counts.total > 9 ? '9+' : counts.total}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 380, maxHeight: 480,
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1000,
                }}>
                    <div style={{
                        padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                            {counts.critical > 0 && (
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: '2px 8px',
                                    borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)',
                                    color: 'var(--status-danger)',
                                }}>
                                    {counts.critical} critical
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                        {notifications.length > 0 ? notifications.map((notif) => {
                            const colors = getSeverityColor(notif.severity);
                            const content = (
                                <div
                                    key={notif.id}
                                    style={{
                                        padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
                                        display: 'flex', gap: 12, cursor: notif.orderId ? 'pointer' : 'default',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                        background: colors.bg, color: colors.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {notif.severity === 'critical' ? <AlertTriangle size={14} /> : getIcon(notif.type)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{notif.title}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{notif.description}</div>
                                    </div>
                                </div>
                            );
                            return notif.orderId ? (
                                <Link key={notif.id} href={`/orders/${notif.orderId}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsOpen(false)}>
                                    {content}
                                </Link>
                            ) : (
                                <div key={notif.id}>{content}</div>
                            );
                        }) : (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: 13 }}>
                                No notifications
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
