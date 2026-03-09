export default function ReportsLoading() {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <div className="skeleton skeleton-title" style={{ width: 220, marginBottom: 8 }}></div>
                    <div className="skeleton skeleton-text" style={{ width: 340 }}></div>
                </div>
                <div className="header-actions">
                    <div className="skeleton" style={{ height: 40, width: 120, borderRadius: 'var(--radius-md)' }}></div>
                </div>
            </header>
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="stat-card">
                        <div className="skeleton skeleton-text" style={{ width: 96, marginBottom: 16 }}></div>
                        <div className="skeleton" style={{ height: 32, width: 64 }}></div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 36, width: 100, borderRadius: 8 }}></div>
                ))}
            </div>
            <div className="grid-2-col">
                <div className="card" style={{ padding: 24 }}>
                    <div className="skeleton skeleton-title" style={{ width: 180, marginBottom: 20 }}></div>
                    <div className="skeleton" style={{ width: '100%', height: 280 }}></div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                    <div className="skeleton skeleton-title" style={{ width: 160, marginBottom: 20 }}></div>
                    <div className="skeleton" style={{ width: '100%', height: 280 }}></div>
                </div>
            </div>
        </div>
    );
}
