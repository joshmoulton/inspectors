'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, ArrowUpDown, ClipboardList, Eye, CheckCircle, UserPlus, Loader2 } from 'lucide-react';
import { updateOrderStatus } from '@/lib/actions';
import { toast } from 'sonner';
import Pagination from './Pagination';
import EmptyState from './EmptyState';

interface Order {
    id: string;
    orderNumber: string;
    type: string;
    status: string;
    address1: string | null;
    city: string | null;
    state: string | null;
    dueDate: string | Date | null;
    client: { name: string; code: string | null } | null;
    inspector: { firstName: string; lastName: string } | null;
}

interface Inspector {
    id: string;
    firstName: string;
    lastName: string;
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
    initialSearch?: string;
    initialPage?: number;
    initialStatus?: string;
    initialSort?: string;
    initialDir?: 'asc' | 'desc';
}

export default function OrderTable({
    inspectors = [],
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

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Fetch orders from paginated API
    const fetchOrders = useCallback(async (
        page: number,
        status: string,
        searchQuery: string,
        sort: string,
        dir: string,
    ) => {
        // Cancel any in-flight request
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

        setSearch(q);
        setCurrentPage(page);
        setStatusFilter(status);
        setSortField(sort);
        setSortDir(dir);

        fetchOrders(page, status, q, sort, dir);
    }, [searchParams, fetchOrders]);

    // Update URL params (without full page reload)
    function updateUrl(overrides: Record<string, string | number>) {
        const params = new URLSearchParams();
        const values = {
            page: String(currentPage),
            status: statusFilter,
            search: search,
            sort: sortField,
            dir: sortDir,
            ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])),
        };

        // Only add non-default params to keep URL clean
        if (values.page !== '1') params.set('page', values.page);
        if (values.status !== 'All') params.set('status', values.status);
        if (values.search) params.set('q', values.search);
        if (values.sort !== 'orderNumber') params.set('sort', values.sort);
        if (values.dir !== 'desc') params.set('dir', values.dir);

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
        updateUrl({ page });
    }

    return (
        <>
            {/* Search + Filter Bar */}
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                    <div className="search-input-wrapper">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by order #, address, city, state, loan #..."
                            className="form-control"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                        {loading ? '...' : `${totalItems.toLocaleString()} orders`}
                    </div>
                </div>
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
                {/* Loading overlay */}
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
                                        <th>State</th>
                                        <th onClick={() => handleSort('dueDate')} style={{ cursor: 'pointer' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                Due Date <ArrowUpDown size={12} />
                                            </span>
                                        </th>
                                        <th>Inspector</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td style={{ fontWeight: 700, color: 'var(--brand-primary-light)' }}>
                                                <Link href={`/orders/${order.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{order.orderNumber}</Link>
                                            </td>
                                            <td>{order.type}</td>
                                            <td>
                                                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {order.client?.code || '---'}
                                                </span>
                                            </td>
                                            <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.address1}</td>
                                            <td>{order.city}</td>
                                            <td style={{ textAlign: 'center' }}>{order.state}</td>
                                            <td style={{ fontSize: 13 }}>
                                                {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '---'}
                                            </td>
                                            <td>
                                                {order.inspector ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{
                                                            width: 24, height: 24, borderRadius: '50%',
                                                            background: 'rgba(99, 102, 241, 0.2)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: 10, fontWeight: 700, color: 'var(--brand-primary-light)'
                                                        }}>
                                                            {order.inspector.firstName[0]}{order.inspector.lastName[0]}
                                                        </div>
                                                        <span style={{ fontSize: 12 }}>{order.inspector.firstName[0]}. {order.inspector.lastName}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Unassigned</span>
                                                )}
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
        </>
    );
}

function QuickCompleteButton({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleComplete() {
        if (!confirm('Mark this order as Completed Pending Approval?')) return;
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
        <button
            className="btn btn-success btn-sm"
            style={{ height: 28, padding: '0 8px' }}
            onClick={handleComplete}
            disabled={loading}
            title="Mark Complete"
        >
            <CheckCircle size={13} />
        </button>
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
