'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, ArrowUpDown, ClipboardList, Eye, CheckCircle, UserPlus, Loader2, Filter, X, Download } from 'lucide-react';
import { updateOrderStatus } from '@/lib/actions';
import { toast } from 'sonner';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import BulkActionBar from './BulkActionBar';
import ConfirmDialog from './ConfirmDialog';

interface Order {
    id: string;
    orderNumber: string;
    type: string;
    status: string;
    address1: string | null;
    city: string | null;
    state: string | null;
    dueDate: string | Date | null;
    inspectorPay: number | null;
    clientPay: number | null;
    client: { id: string; name: string; code: string | null } | null;
    inspector: { id: string; firstName: string; lastName: string } | null;
}

interface Inspector {
    id: string;
    firstName: string;
    lastName: string;
}

interface ClientOption {
    id: string;
    name: string;
    code: string | null;
}

interface ApiResponse {
    orders: Order[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    statusCounts: Record<string, number>;
}

const PAGE_SIZE = 25;
const STATUS_FILTERS = ['All', 'Open', 'Completed', 'Unassigned', 'Cancelled', 'Submitted', 'Paid'];

interface OrderTableProps {
    inspectors?: Inspector[];
    clients?: ClientOption[];
    initialSearch?: string;
    initialPage?: number;
    initialStatus?: string;
    initialSort?: string;
    initialDir?: 'asc' | 'desc';
}

export default function OrderTable({
    inspectors = [],
    clients = [],
    initialSearch = '',
    initialPage = 1,
    initialStatus = 'All',
    initialSort = 'orderNumber',
    initialDir = 'desc',
}: OrderTableProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

    const [search, setSearch] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [sortField, setSortField] = useState(initialSort);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialDir);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filterInspector, setFilterInspector] = useState('');
    const [filterClient, setFilterClient] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const hasAdvancedFilters = filterInspector || filterClient;

    // Fetch orders from paginated API
    const fetchOrders = useCallback(async (
        page: number,
        status: string,
        searchQuery: string,
        sort: string,
        dir: string,
        inspector: string,
        client: string,
    ) => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(PAGE_SIZE),
                status,
                search: searchQuery,
                sortField: sort,
                sortDir: dir,
            });
            if (inspector) params.set('inspector', inspector);
            if (client) params.set('client', client);

            const res = await fetch(`/api/orders?${params}`, { signal: controller.signal });
            if (!res.ok) throw new Error('Failed to fetch');

            const data: ApiResponse = await res.json();
            setOrders(data.orders);
            setTotalPages(data.totalPages);
            setTotalItems(data.total);
            setStatusCounts(data.statusCounts);
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Sync URL params → state on mount and URL changes
    useEffect(() => {
        const q = searchParams.get('q') || searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const status = searchParams.get('status') || 'All';
        const sort = searchParams.get('sort') || 'orderNumber';
        const dir = (searchParams.get('dir') as 'asc' | 'desc') || 'desc';
        const inspector = searchParams.get('inspector') || '';
        const client = searchParams.get('client') || '';

        setSearch(q);
        setCurrentPage(page);
        setStatusFilter(status);
        setSortField(sort);
        setSortDir(dir);
        setFilterInspector(inspector);
        setFilterClient(client);
        if (inspector || client) setShowAdvancedFilters(true);

        fetchOrders(page, status, q, sort, dir, inspector, client);
    }, [searchParams, fetchOrders]);

    function updateUrl(overrides: Record<string, string | number>) {
        const params = new URLSearchParams();
        const values = {
            page: String(currentPage),
            status: statusFilter,
            search: search,
            sort: sortField,
            dir: sortDir,
            inspector: filterInspector,
            client: filterClient,
            ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])),
        };

        if (values.page !== '1') params.set('page', values.page);
        if (values.status !== 'All') params.set('status', values.status);
        if (values.search) params.set('q', values.search);
        if (values.sort !== 'orderNumber') params.set('sort', values.sort);
        if (values.dir !== 'desc') params.set('dir', values.dir);
        if (values.inspector) params.set('inspector', values.inspector);
        if (values.client) params.set('client', values.client);

        const qs = params.toString();
        router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    }

    function handleSearchChange(val: string) {
        setSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            updateUrl({ search: val, page: 1 });
        }, 300);
    }

    function handleStatusChange(status: string) {
        setStatusFilter(status);
        setCurrentPage(1);
        setSelectedIds(new Set());
        updateUrl({ status, page: 1 });
    }

    function handleSort(field: string) {
        const newDir = sortField === field ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
        setSortField(field);
        setSortDir(newDir);
        updateUrl({ sort: field, dir: newDir });
    }

    function handlePageChange(page: number) {
        setCurrentPage(page);
        setSelectedIds(new Set());
        updateUrl({ page });
    }

    function handleInspectorFilter(id: string) {
        setFilterInspector(id);
        updateUrl({ inspector: id, page: 1 });
    }

    function handleClientFilter(id: string) {
        setFilterClient(id);
        updateUrl({ client: id, page: 1 });
    }

    function clearAdvancedFilters() {
        setFilterInspector('');
        setFilterClient('');
        updateUrl({ inspector: '', client: '', page: 1 });
    }

    const allSelected = orders.length > 0 && orders.every(o => selectedIds.has(o.id));

    function toggleSelectAll() {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(orders.map(o => o.id)));
        }
    }

    function toggleSelect(id: string) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    return (
        <>
            {/* Search + Filter Bar */}
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                    <div className="search-input-wrapper" style={{ flex: 1 }}>
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by order #, address, city, state, loan #..."
                            className="form-control"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            aria-label="Search orders"
                        />
                    </div>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        style={{ position: 'relative' }}
                    >
                        <Filter size={14} /> Filters
                        {hasAdvancedFilters && (
                            <span style={{
                                position: 'absolute', top: -4, right: -4,
                                width: 8, height: 8, borderRadius: '50%',
                                background: 'var(--brand-primary)',
                            }} />
                        )}
                    </button>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                            const csv = ['Order #,Type,Status,Address,City,State,Client,Inspector,Due Date,Client Pay,Inspector Pay'];
                            for (const o of orders) {
                                csv.push([
                                    o.orderNumber,
                                    o.type,
                                    o.status,
                                    `"${(o.address1 || '').replace(/"/g, '""')}"`,
                                    o.city || '',
                                    o.state || '',
                                    `"${(o.client?.name || '').replace(/"/g, '""')}"`,
                                    o.inspector ? `"${o.inspector.firstName} ${o.inspector.lastName}"` : '',
                                    o.dueDate ? new Date(o.dueDate).toLocaleDateString() : '',
                                    o.clientPay?.toFixed(2) || '0.00',
                                    o.inspectorPay?.toFixed(2) || '0.00',
                                ].join(','));
                            }
                            const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `orders-${statusFilter.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success(`Exported ${orders.length} orders to CSV`);
                        }}
                        title="Export current view to CSV"
                    >
                        <Download size={14} /> Export
                    </button>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                        {loading ? '...' : `${totalItems.toLocaleString()} orders`}
                    </div>
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                    <div style={{
                        display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12,
                        padding: '12px 0', borderTop: '1px solid var(--border-subtle)',
                    }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                            Filter by:
                        </span>
                        <select
                            className="form-control"
                            value={filterInspector}
                            onChange={(e) => handleInspectorFilter(e.target.value)}
                            style={{ maxWidth: 200, fontSize: 13, height: 32 }}
                        >
                            <option value="">All Inspectors</option>
                            {inspectors.map(i => (
                                <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>
                            ))}
                        </select>
                        <select
                            className="form-control"
                            value={filterClient}
                            onChange={(e) => handleClientFilter(e.target.value)}
                            style={{ maxWidth: 200, fontSize: 13, height: 32 }}
                        >
                            <option value="">All Clients</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name} {c.code ? `(${c.code})` : ''}</option>
                            ))}
                        </select>
                        {hasAdvancedFilters && (
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={clearAdvancedFilters}
                                style={{ height: 32 }}
                            >
                                <X size={12} /> Clear
                            </button>
                        )}
                    </div>
                )}

                <div className="filter-pills">
                    {STATUS_FILTERS.map((status) => (
                        <button
                            key={status}
                            className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => handleStatusChange(status)}
                        >
                            {status}
                            <span className="pill-count">{statusCounts[status]?.toLocaleString() || 0}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
                {loading && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 10,
                        background: 'rgba(var(--bg-surface-rgb, 30, 30, 46), 0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(2px)',
                    }}>
                        <Loader2 size={24} className="spin" style={{ color: 'var(--brand-primary-light)' }} />
                    </div>
                )}

                {orders.length > 0 || loading ? (
                    <>
                        <div className="table-scroll">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 40, textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleSelectAll}
                                                aria-label="Select all orders"
                                                style={{ cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                                            />
                                        </th>
                                        <th onClick={() => handleSort('orderNumber')} style={{ cursor: 'pointer' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                Order # <ArrowUpDown size={12} />
                                            </span>
                                        </th>
                                        <th>Type</th>
                                        <th onClick={() => handleSort('client')} style={{ cursor: 'pointer' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                Client <ArrowUpDown size={12} />
                                            </span>
                                        </th>
                                        <th>Address</th>
                                        <th>City</th>
                                        <th>ST</th>
                                        <th onClick={() => handleSort('dueDate')} style={{ cursor: 'pointer' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                Due <ArrowUpDown size={12} />
                                            </span>
                                        </th>
                                        <th>Inspector</th>
                                        <th style={{ textAlign: 'right' }}>Client $</th>
                                        <th style={{ textAlign: 'right' }}>Insp $</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} style={{ background: selectedIds.has(order.id) ? 'rgba(99, 102, 241, 0.04)' : undefined }}>
                                            <td style={{ textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(order.id)}
                                                    onChange={() => toggleSelect(order.id)}
                                                    aria-label={`Select order ${order.orderNumber}`}
                                                    style={{ cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                                                />
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--brand-primary-light)' }}>
                                                <Link href={`/orders/${order.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{order.orderNumber}</Link>
                                            </td>
                                            <td style={{ fontSize: 12 }}>{order.type}</td>
                                            <td>
                                                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {order.client?.code || '---'}
                                                </span>
                                            </td>
                                            <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{order.address1}</td>
                                            <td style={{ fontSize: 13 }}>{order.city}</td>
                                            <td style={{ textAlign: 'center', fontSize: 12 }}>{order.state}</td>
                                            <td style={{ fontSize: 13 }}>
                                                {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '---'}
                                            </td>
                                            <td>
                                                {order.inspector ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <div style={{
                                                            width: 22, height: 22, borderRadius: '50%',
                                                            background: 'rgba(99, 102, 241, 0.2)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: 9, fontWeight: 700, color: 'var(--brand-primary-light)'
                                                        }}>
                                                            {order.inspector.firstName[0]}{order.inspector.lastName[0]}
                                                        </div>
                                                        <span style={{ fontSize: 12 }}>{order.inspector.firstName[0]}. {order.inspector.lastName}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Unassigned</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, color: 'var(--status-success)' }}>
                                                {order.clientPay ? `$${order.clientPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                                            </td>
                                            <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, color: 'var(--status-info)' }}>
                                                {order.inspectorPay ? `$${order.inspectorPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <Link href={`/orders/${order.id}`} className="btn btn-secondary btn-sm" style={{ height: 28, padding: '0 8px' }} title="View Details">
                                                        <Eye size={13} />
                                                    </Link>
                                                    {order.status === 'Open' && (
                                                        <QuickCompleteButton orderId={order.id} />
                                                    )}
                                                    {order.status === 'Unassigned' && inspectors.length > 0 && (
                                                        <QuickAssignButton orderId={order.id} inspectors={inspectors} />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                pageSize={PAGE_SIZE}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={<ClipboardList size={48} />}
                        title="No orders found"
                        description="Try adjusting your search or filter criteria to find what you're looking for."
                    />
                )}
            </div>

            <BulkActionBar
                selectedIds={selectedIds}
                onClearSelection={() => setSelectedIds(new Set())}
                inspectors={inspectors}
                orders={orders}
            />
        </>
    );
}

function QuickCompleteButton({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    async function handleComplete() {
        setShowConfirm(false);
        setLoading(true);
        try {
            const result = await updateOrderStatus(orderId, 'Completed Pending Approval');
            if (result.success) {
                toast.success('Order marked as completed');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to update');
            }
        } catch {
            toast.error('Failed to update order');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                className="btn btn-success btn-sm"
                style={{ height: 28, padding: '0 8px' }}
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                title="Mark Complete"
                aria-label="Mark order complete"
            >
                <CheckCircle size={13} />
            </button>
            <ConfirmDialog
                isOpen={showConfirm}
                onConfirm={handleComplete}
                onCancel={() => setShowConfirm(false)}
                title="Complete Order"
                description="Mark this order as Completed Pending Approval?"
                confirmLabel="Complete"
            />
        </>
    );
}

function QuickAssignButton({ orderId, inspectors }: { orderId: string; inspectors: Inspector[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const ref = useRef<HTMLDivElement>(null);

    async function handleAssign(inspectorId: string) {
        setLoading(true);
        setOpen(false);
        try {
            const res = await fetch(`/api/orders/${orderId}/assign`, {
                method: 'POST',
                body: JSON.stringify({ inspectorId }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (res.ok) {
                toast.success('Inspector assigned');
                router.refresh();
            } else {
                await updateOrderStatus(orderId, 'Open');
                toast.success('Order status updated');
                router.refresh();
            }
        } catch {
            toast.error('Failed to assign inspector');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="inline-dropdown" ref={ref}>
            <button
                className="btn btn-secondary btn-sm"
                style={{ height: 28, padding: '0 8px' }}
                onClick={() => setOpen(!open)}
                disabled={loading}
                title="Assign Inspector"
            >
                <UserPlus size={13} />
            </button>
            {open && (
                <div className="inline-dropdown-menu">
                    {inspectors.map((insp) => (
                        <button
                            key={insp.id}
                            className="inline-dropdown-item"
                            onClick={() => handleAssign(insp.id)}
                        >
                            {insp.firstName} {insp.lastName}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function getStatusColor(status: string) {
    if (status.includes('Completed Approved')) return 'success';
    if (status.includes('Completed Pending')) return 'info';
    if (status === 'Open') return 'warning';
    if (status === 'Cancelled') return 'danger';
    if (status === 'Unassigned') return 'gray';
    if (status.includes('Submitted')) return 'purple';
    if (status === 'Paid') return 'teal';
    return 'brand';
}
