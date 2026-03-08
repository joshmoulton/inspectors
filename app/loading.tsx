import React from 'react';

export default function DashboardLoading() {
    return (
        <div className="page-container fade-in">
            <header className="page-header">
                <div>
                    <div className="skeleton skeleton-title w-[200px] mb-2"></div>
                    <div className="skeleton skeleton-text w-[300px]"></div>
                </div>
                <div className="header-actions">
                    <div className="skeleton h-10 w-32 rounded-lg"></div>
                </div>
            </header>

            <div className="stats-grid">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="stat-card">
                        <div className="skeleton skeleton-text w-24 mb-4"></div>
                        <div className="skeleton h-8 w-16"></div>
                    </div>
                ))}
            </div>

            <section className="dashboard-section mt-8">
                <div className="card glass p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="skeleton skeleton-title w-32 mb-2"></div>
                            <div className="skeleton skeleton-text w-24"></div>
                        </div>
                    </div>
                    <div className="skeleton" style={{ width: '100%', height: 350 }}></div>
                </div>
            </section>

            <section className="dashboard-section mt-8">
                <div className="section-header mb-4">
                    <div className="skeleton skeleton-title w-40"></div>
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
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i}>
                                        <td><div className="skeleton skeleton-text w-16"></div></td>
                                        <td><div className="skeleton skeleton-text w-32"></div></td>
                                        <td><div className="skeleton skeleton-text w-48"></div></td>
                                        <td><div className="skeleton h-6 w-20 rounded-full"></div></td>
                                        <td><div className="skeleton skeleton-text w-24"></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}
