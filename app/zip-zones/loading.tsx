export default function ZipZonesLoading() {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <div style={{ width: 140, height: 28, marginBottom: 8 }} className="skeleton skeleton-title" />
                    <div style={{ width: 280, height: 16 }} className="skeleton skeleton-text" />
                </div>
            </header>

            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="stat-card">
                        <div style={{ width: 48, height: 48, borderRadius: 12 }} className="skeleton" />
                        <div className="stat-content">
                            <div style={{ width: 50, height: 28, marginBottom: 4 }} className="skeleton skeleton-title" />
                            <div style={{ width: 90, height: 14 }} className="skeleton skeleton-text" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ width: 300, height: 34 }} className="skeleton" />
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {[40, 120, 200, 80, 80, 60].map((w, i) => (
                                <th key={i}><div style={{ width: w, height: 14 }} className="skeleton skeleton-text" /></th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(10)].map((_, i) => (
                            <tr key={i}>
                                <td><div style={{ width: 16, height: 16 }} className="skeleton" /></td>
                                <td><div style={{ width: 60, height: 16 }} className="skeleton skeleton-text" /></td>
                                <td><div style={{ width: 140, height: 16 }} className="skeleton skeleton-text" /></td>
                                <td><div style={{ width: 30, height: 16, margin: '0 auto' }} className="skeleton skeleton-text" /></td>
                                <td><div style={{ width: 50, height: 16, margin: '0 auto' }} className="skeleton skeleton-text" /></td>
                                <td><div style={{ width: 20, height: 16 }} className="skeleton" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
