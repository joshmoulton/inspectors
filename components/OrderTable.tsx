'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function OrderTable({ initialOrders }: { initialOrders: any[] }) {
    const [orders] = useState(initialOrders);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const filteredOrders = orders.filter((order: any) => {
        const matchesSearch =
            order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
            order.address1?.toLowerCase().includes(search.toLowerCase()) ||
            order.city?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'All' || order.status.includes(statusFilter);

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <div className="card glass p-4 mb-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Search by order # or address..."
                        className="form-control"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="form-control w-auto"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="Completed">Completed</option>
                    <option value="Unassigned">Unassigned</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <div className="text-xs text-muted font-bold ml-auto">
                    Showing {filteredOrders.length} of {orders.length} orders
                </div>
            </div>

            <div className="card glass overflow-hidden">
                <div className="table-scroll">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Type</th>
                                <th>Client</th>
                                <th>Address</th>
                                <th>City</th>
                                <th>State</th>
                                <th>Due Date</th>
                                <th>Inspector</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredOrders.map((order: any) => (
                                    <motion.tr
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="font-bold text-primary">
                                            <Link href={`/orders/${order.id}`}>{order.orderNumber}</Link>
                                        </td>
                                        <td>{order.type}</td>
                                        <td>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 uppercase tracking-wider">
                                                {order.client?.code || '---'}
                                            </span>
                                        </td>
                                        <td className="max-w-[150px] truncate">{order.address1}</td>
                                        <td>{order.city}</td>
                                        <td className="text-center">{order.state}</td>
                                        <td className="text-sm">
                                            {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '---'}
                                        </td>
                                        <td>
                                            {order.inspector ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                                                        {order.inspector.firstName[0]}{order.inspector.lastName[0]}
                                                    </div>
                                                    <span className="text-xs">{order.inspector.firstName[0]}. {order.inspector.lastName}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link href={`/orders/${order.id}`} className="text-xs text-primary hover:underline">Details</Link>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="p-12 text-center text-muted italic">No orders found matching your criteria.</div>
                )}
            </div>
        </>
    );
}

function getStatusColor(status: string) {
    if (status.includes('Completed Approved')) return 'success';
    if (status.includes('Completed Pending')) return 'info';
    if (status === 'Open') return 'warning';
    if (status === 'Cancelled') return 'danger';
    if (status === 'Unassigned') return 'muted';
    return 'primary';
}
