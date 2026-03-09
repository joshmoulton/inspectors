'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Building2, Search, ClipboardList, Clock, CheckCircle, DollarSign,
    ChevronLeft, ChevronRight, LogOut, Loader2, ExternalLink
} from 'lucide-react';

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    type: string;
    address1: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    dueDate: string | null;
    completedDate: string | null;
    orderedDate: string | null;
    workCode: string | null;
    loanNumber: string | null;
}

const STATUS_FILTERS = ['All', 'In Progress', 'Completed', 'Submitted', 'Paid'];

export default function ClientPortalDashboard() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [clientName, setClientName] = useState('');
    const [clientCode, setClientCode] = useState('');
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

    const fetchOrders = useCallback(async (page: number, status: string, q: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                token,
                page: String(page),
                pageSize: '25',
                status,
                search: q,
            });
            const res = await fetch(`/api/client-portal/orders?${params}`);
            if (!res.ok) {
                if (res.status === 401) {
                    window.location.href = '/client-portal';
                    return;
                }
                throw new Error('Failed to fetch');
            }
            const data = await res.json();
            setOrders(data.orders);
            setTotal(data.total);
            setTotalPages(data.totalPages);
            setClientName(data.client?.name || '');
            setClientCode(data.client?.code || '');
            setStatusCounts(data.statusCounts || {});
        } catch {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchOrders(currentPage, statusFilter, search);
    }, [token, currentPage, statusFilter, fetchOrders]);

    function handleSearch() {
        setCurrentPage(1);
        fetchOrders(1, statusFilter, search);
    }

    const totalAll = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const completedCount = Object.entries(statusCounts)
        .filter(([k]) => k.includes('Completed') || k.includes('Submitted') || k === 'Paid')
        .reduce((a, [, v]) => a + v, 0);
    const inProgressCount = Object.entries(statusCounts)
        .filter(([k]) => k === 'Open' || k === 'Unassigned')
        .reduce((a, [, v]) => a + v, 0);
    const paidCount = statusCounts['Paid'] || 0;

    if (!token) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-root)' }}>
            {/* Header */}
            <header style={{
                padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg-surface)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, color: 'white',
                    }}>P</div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Client Portal</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{clientName} ({clientCode})</div>
                    </div>
                </div>
                <Link href="/client-portal" style={{
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
                    color: 'var(--text-tertiary)', textDecoration: 'none',
                }}>
                    <LogOut size={14} /> Sign Out
                </Link>
            </header>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
                {/* Stats */}
                <div className="stats-grid" style={{ marginBottom: 24 }}>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--brand-primary-light)' }}>
                            <ClipboardList size={22} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{totalAll}</div>
                            <div className="stat-label">Total Orders</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--status-warning)' }}>
                            <Clock size={22} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{inProgressCount}</div>
                            <div className="stat-label">In Progress</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)' }}>
                            <CheckCircle size={22} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{completedCount}</div>
                            <div className="stat-label">Completed</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(20, 184, 166, 0.12)', color: 'var(--status-teal)' }}>
                            <DollarSign size={22} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{paidCount}</div>
                            <div className="stat-label">Paid</div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                        <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200 }}>
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by order #, address, loan #..."
                                className="form-control"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={handleSearch}>Search</button>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>
                            {loading ? '...' : `${total.toLocaleString()} orders`}
                        </div>
                    </div>
                    <div className="filter-pills">
                        {STATUS_FILTERS.map((s) => (
                            <button
                                key={s}
                                className={`filter-pill ${statusFilter === s ? 'active' : ''}`}
                                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
                    {loading && (
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 10,
                            background: 'rgba(10, 10, 15, 0.7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(2px)',
                        }}>
                            <Loader2 size={24} className="spin" style={{ color: 'var(--brand-primary-light)' }} />
                        </div>
                    )}
                    <div className="table-scroll">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Type</th>
                                    <th>Address</th>
                                    <th>City</th>
                                    <th>State</th>
                                    <th>Loan #</th>
                                    <th>Due Date</th>
                                    <th>Completed</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td style={{ fontWeight: 700, color: 'var(--brand-primary-light)' }}>
                                            {order.orderNumber}
                                        </td>
                                        <td>{order.type}</td>
                                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {order.address1}
                                        </td>
                                        <td>{order.city}</td>
                                        <td style={{ textAlign: 'center' }}>{order.state}</td>
                                        <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{order.loanNumber || '---'}</td>
                                        <td style={{ fontSize: 13 }}>
                                            {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '---'}
                                        </td>
                                        <td style={{ fontSize: 13 }}>
                                            {order.completedDate ? new Date(order.completedDate).toLocaleDateString() : '---'}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${getStatusColor(order.status)}`}>
                                                {getClientStatus(order.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && orders.length === 0 && (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                                            No orders found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <span className="pagination-info">
                                Page {currentPage} of {totalPages} ({total} orders)
                            </span>
                            <div className="pagination-controls">
                                <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                                    <ChevronLeft size={16} />
                                </button>
                                <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    if (status.includes('Completed Approved') || status.includes('Submitted')) return 'success';
    if (status.includes('Completed Pending')) return 'info';
    if (status === 'Open') return 'warning';
    if (status === 'Cancelled') return 'danger';
    if (status === 'Unassigned') return 'gray';
    if (status === 'Paid') return 'teal';
    return 'brand';
}

function getClientStatus(status: string) {
    // Simplify internal statuses for client view
    if (status === 'Open' || status === 'Unassigned') return 'In Progress';
    if (status.includes('Completed')) return 'Completed';
    if (status === 'Submitted to Client') return 'Submitted';
    if (status === 'Paid') return 'Paid';
    if (status === 'Cancelled') return 'Cancelled';
    return status;
}
