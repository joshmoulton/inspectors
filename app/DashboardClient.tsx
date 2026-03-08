'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
    { name: '1st', orders: 12 },
    { name: '4th', orders: 18 },
    { name: '8th', orders: 15 },
    { name: '12th', orders: 25 },
    { name: '16th', orders: 22 },
    { name: '20th', orders: 30 },
    { name: '24th', orders: 28 },
    { name: '28th', orders: 35 },
    { name: '31st', orders: 42 },
];

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
                <motion.div variants={item} className="stat-card relative overflow-hidden group">
                    <div className="stat-label">Total Orders</div>
                    <div className="stat-value">{stats.totalOrders}</div>
                    <div className="absolute bottom-4 right-4 text-xs font-bold text-success opacity-0 group-hover:opacity-100 transition-opacity">↑ 12%</div>
                </motion.div>
                <motion.div variants={item} className="stat-card relative overflow-hidden group">
                    <div className="stat-label">Open Orders</div>
                    <div className="stat-value text-warning">{stats.openOrders}</div>
                    <div className="absolute bottom-4 right-4 text-xs font-bold text-danger opacity-0 group-hover:opacity-100 transition-opacity">↑ 5%</div>
                </motion.div>
                <motion.div variants={item} className="stat-card relative overflow-hidden group">
                    <div className="stat-label">Completed</div>
                    <div className="stat-value text-success">{stats.completedOrders}</div>
                    <div className="absolute bottom-4 right-4 text-xs font-bold text-success opacity-0 group-hover:opacity-100 transition-opacity">↑ 28%</div>
                </motion.div>
                <motion.div variants={item} className="stat-card relative overflow-hidden group">
                    <div className="stat-label">Pending QC</div>
                    <div className="stat-value text-info">2</div>
                </motion.div>
            </motion.div>

            {/* Area Chart Section */}
            <motion.section
                className="dashboard-section mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 24 }}
            >
                <div className="card glass p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-white">Order Volume</h2>
                            <p className="text-xs text-muted">Last 30 Days</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="badge badge-primary">Weekly</span>
                            <span className="badge bg-white/5 text-muted hover:text-white cursor-pointer transition-colors">Monthly</span>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4facfe" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#4facfe" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="rgba(255,255,255,0.3)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.3)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#4facfe"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorOrders)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.section>

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
