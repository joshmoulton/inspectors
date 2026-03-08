import React from 'react';

export default function OrdersLoading() {
    return (
        <div className="page-container fade-in">
            <header className="page-header">
                <div>
                    <div className="skeleton skeleton-title w-[200px] mb-2"></div>
                </div>
                <div className="header-actions">
                    <div className="skeleton h-10 w-32 rounded-lg"></div>
                </div>
            </header>

            <div className="search-section">
                <div className="search-wrapper">
                    <div className="skeleton h-10 w-full rounded-lg"></div>
                </div>
            </div>

            <div className="orders-filters mb-4 flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton h-8 w-24 rounded-full"></div>
                ))}
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
                                <th>Assigned To</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <tr key={i}>
                                    <td><div className="skeleton skeleton-text w-16"></div></td>
                                    <td><div className="skeleton skeleton-text w-32"></div></td>
                                    <td><div className="skeleton skeleton-text w-48"></div></td>
                                    <td><div className="skeleton h-6 w-20 rounded-full"></div></td>
                                    <td><div className="skeleton skeleton-text w-24"></div></td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="skeleton skeleton-avatar w-6 h-6"></div>
                                            <div className="skeleton skeleton-text w-20"></div>
                                        </div>
                                    </td>
                                    <td><div className="skeleton skeleton-text w-12"></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
