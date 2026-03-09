export default function CustomFormsLoading() {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <div className="skeleton skeleton-title" style={{ width: 200, marginBottom: 8 }}></div>
                    <div className="skeleton skeleton-text" style={{ width: 300 }}></div>
                </div>
                <div className="header-actions">
                    <div className="skeleton" style={{ height: 40, width: 150, borderRadius: 'var(--radius-md)' }}></div>
                </div>
            </header>
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="stat-card">
                        <div className="skeleton skeleton-text" style={{ width: 96, marginBottom: 16 }}></div>
                        <div className="skeleton" style={{ height: 32, width: 48 }}></div>
                    </div>
                ))}
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr><th>Form Name</th><th>Type</th><th>Fields</th><th>Uses</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i}>
                                <td><div className="skeleton skeleton-text" style={{ width: 160 }}></div></td>
                                <td><div className="skeleton skeleton-text" style={{ width: 100 }}></div></td>
                                <td><div className="skeleton skeleton-text" style={{ width: 32 }}></div></td>
                                <td><div className="skeleton skeleton-text" style={{ width: 32 }}></div></td>
                                <td><div className="skeleton" style={{ height: 24, width: 60, borderRadius: 'var(--radius-full)' }}></div></td>
                                <td><div className="skeleton skeleton-text" style={{ width: 80 }}></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
