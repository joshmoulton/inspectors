'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, ClipboardList, Eye, CheckCircle, UserPlus } from 'lucide-react';
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

const PAGE_SIZE = 25;

const STATUS_FILTERS = ['All', 'Open', 'Completed', 'Unassigned', 'Cancelled', 'Submitted', 'Paid'];

export default function OrderTable({ initialOrders, inspectors = [], initialSearch = '' }: { initialOrders: any[]; inspectors?: Inspector[]; initialSearch?: string }) {
    const [orders] = useState(initialOrders);
    const [search, setSearch] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState('All');
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const filteredOrders = useMemo(() => {
        let result = orders.filter((order: any) => {
            const matchesSearch =
                order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                order.address1?.toLowerCase().includes(search.toLowerCase()) ||
                order.city?.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'All' || order.status.includes(statusFilter);
            return matchesSearch && matchesStatus;
        });

        if (sortField) {
            result = [...result].sort((a: any, b: any) => {
                let valA = a[sortField] || '';
                let valB = b[sortField] || '';
                if (sortField === 'client') { valA = a.client?.code || ''; valB = b.client?.code || ''; }
                if (sortField === 'inspector') { valA = a.inspector?.lastName || ''; valB = b.inspector?.lastName || ''; }
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [orders, search, statusFilter, sortField, sortDir]);

    const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    function handleSort(field: string) {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    }

    // Reset to page 1 when filters change
    function handleSearchChange(val: string) {
        setSearch(val);
        setCurrentPage(1);
    }

    function handleStatusChange(status: string) {
        setStatusFilter(status);
        setCurrentPage(1);
    }

    // Count orders per status for pills
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { All: orders.length };
        for (const s of STATUS_FILTERS.slice(1)) {
            counts[s] = orders.filter((o: any) => o.status.includes(s)).length;
        }
        return counts;
    }, [orders]);

    return (
        <>
            {/* Search + Filter Bar */}
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                    <div className="search-input-wrapper">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by order #, address, or city..."
                            className="form-control"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                        {filteredOrders.length} of {orders.length} orders
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
                            <span className="pill-count">{statusCounts[status] || 0}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                {paginatedOrders.length > 0 ? (
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
                                    <AnimatePresence>
                                        {paginatedOrders.map((order: any) => (
                                            <motion.tr
                                                key={order.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                            >
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
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredOrders.length}
                            pageSize={PAGE_SIZE}
                            onPageChange={setCurrentPage}
                        />
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
            // Use fetch to call the assign endpoint via server action
            const formData = new FormData();
            formData.append('inspectorId', inspectorId);
            formData.append('status', 'Open');

            const res = await fetch(`/api/orders/${orderId}/assign`, {
                method: 'POST',
                body: JSON.stringify({ inspectorId }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (res.ok) {
                toast.success('Inspector assigned');
                router.refresh();
            } else {
                // Fallback: use updateOrderStatus to at least change status
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
