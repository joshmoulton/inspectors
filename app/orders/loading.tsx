import React from 'react';

export default function OrdersLoading() {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <div className="skeleton skeleton-title" style={{ width: 200, marginBottom: 8 }}></div>
                </div>
                <div className="header-actions">
                    <div className="skeleton" style={{ height: 40, width: 120, borderRadius: 'var(--radius-md)' }}></div>
                </div>
            </header>

            <div style={{ marginBottom: 16 }}>
                <div className="skeleton" style={{ height: 40, width: '100%', borderRadius: 'var(--radius-md)' }}></div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 32, width: 96, borderRadius: 'var(--radius-full)' }}></div>
                ))}
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
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
                                <td><div className="skeleton skeleton-text" style={{ width: 64 }}></div></td>
                                <td><div className="skeleton skeleton-text" style={{ width: 128 }}></div></td>
                                <td><div className="skeleton skeleton-text" style={{ width: 192 }}></div></td>
                                <td><div className="skeleton" style={{ height: 24, width: 80, borderRadius: 'var(--radius-full)' }}></div></td>
                                <td><div className="skeleton skeleton-text" style={{ width: 96 }}></div></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div className="skeleton skeleton-avatar" style={{ width: 24, height: 24 }}></div>
                                        <div className="skeleton skeleton-text" style={{ width: 80 }}></div>
                                    </div>
                                </td>
                                <td><div className="skeleton skeleton-text" style={{ width: 48 }}></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
