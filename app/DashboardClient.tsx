'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface DashboardClientProps {
    stats: {
        totalOrders: number;
        openOrders: number;
        completedOrders: number;
    };
    recentOrders: any[];
}

export default function DashboardClient({ stats, recentOrders }: DashboardClientProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome back, Josh. Here's what's happening today.</p>
                </motion.div>
                <motion.div className="header-actions" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Link href="/orders/new" className="btn btn-primary">New Order</Link>
                </motion.div>
            </header>

            <motion.div
                className="stats-grid"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={item} className="stat-card">
                    <div className="stat-label">Total Orders</div>
                    <div className="stat-value">{stats.totalOrders}</div>
                </motion.div>
                <motion.div variants={item} className="stat-card">
                    <div className="stat-label">Open Orders</div>
                    <div className="stat-value text-warning">{stats.openOrders}</div>
                </motion.div>
                <motion.div variants={item} className="stat-card">
                    <div className="stat-label">Completed</div>
                    <div className="stat-value text-success">{stats.completedOrders}</div>
                </motion.div>
                <motion.div variants={item} className="stat-card">
                    <div className="stat-label">Pending QC</div>
                    <div className="stat-value text-info">2</div>
                </motion.div>
            </motion.div>

            <motion.section
                className="dashboard-section mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 24 }}
            >
                <div className="section-header mb-4">
                    <h2 className="text-xl font-bold">Recent Orders</h2>
                    <Link href="/orders" className="text-sm text-primary hover:underline">View all</Link>
                </div>

                <div className="card glass overflow-hidden">
                    <div className="table-scroll">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Client</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="font-bold text-primary">
                                            <Link href={`/orders/${order.id}`}>{order.orderNumber}</Link>
                                        </td>
                                        <td>{order.client?.name || '---'}</td>
                                        <td className="truncate max-w-[150px]">{order.address1}, {order.city}</td>
                                        <td>
                                            <span className={`badge badge-${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '---'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}

function getStatusColor(status: string) {
    if (status.includes('Completed')) return 'success';
    if (status === 'Open') return 'warning';
    if (status === 'Cancelled') return 'danger';
    if (status === 'Unassigned') return 'info';
    return 'primary';
}
