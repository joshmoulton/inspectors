import React from 'react';

export default function DashboardLoading() {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <div className="skeleton skeleton-title" style={{ width: 200, marginBottom: 8 }}></div>
                    <div className="skeleton skeleton-text" style={{ width: 300 }}></div>
                </div>
                <div className="header-actions">
                    <div className="skeleton" style={{ height: 40, width: 120, borderRadius: 'var(--radius-md)' }}></div>
                </div>
            </header>

            <div className="stats-grid">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="stat-card">
                        <div className="skeleton skeleton-text" style={{ width: 96, marginBottom: 16 }}></div>
                        <div className="skeleton" style={{ height: 32, width: 64 }}></div>
                    </div>
                ))}
            </div>

            <section style={{ marginTop: 32 }}>
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div>
                            <div className="skeleton skeleton-title" style={{ width: 128, marginBottom: 8 }}></div>
                            <div className="skeleton skeleton-text" style={{ width: 96 }}></div>
                        </div>
                    </div>
                    <div className="skeleton" style={{ width: '100%', height: 350 }}></div>
                </div>
            </section>

            <section style={{ marginTop: 32 }}>
                <div style={{ marginBottom: 16 }}>
                    <div className="skeleton skeleton-title" style={{ width: 160 }}></div>
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
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i}>
                                    <td><div className="skeleton skeleton-text" style={{ width: 64 }}></div></td>
                                    <td><div className="skeleton skeleton-text" style={{ width: 128 }}></div></td>
                                    <td><div className="skeleton skeleton-text" style={{ width: 192 }}></div></td>
                                    <td><div className="skeleton" style={{ height: 24, width: 80, borderRadius: 'var(--radius-full)' }}></div></td>
                                    <td><div className="skeleton skeleton-text" style={{ width: 96 }}></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
