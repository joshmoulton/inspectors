export default function ClientsLoading() {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <div className="skeleton skeleton-title" style={{ width: 160, marginBottom: 8 }}></div>
                    <div className="skeleton skeleton-text" style={{ width: 280 }}></div>
                </div>
                <div className="header-actions">
                    <div className="skeleton" style={{ height: 40, width: 120, borderRadius: 'var(--radius-md)' }}></div>
                </div>
            </header>
            <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr><th>Name</th><th>Code</th><th>Orders</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <tr key={i}>
                                <td><div className="skeleton skeleton-text" style={{ width: 160 }}></div></td>
                                <td><div className="skeleton skeleton-text" style={{ width: 80 }}></div></td>
                                <td><div className="skeleton skeleton-text" style={{ width: 48 }}></div></td>
                                <td><div className="skeleton" style={{ height: 24, width: 64, borderRadius: 'var(--radius-full)' }}></div></td>
                                <td><div className="skeleton skeleton-text" style={{ width: 48 }}></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
