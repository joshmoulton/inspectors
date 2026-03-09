export default function RoutesLoading() {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <div className="skeleton skeleton-title" style={{ width: 220, marginBottom: 8 }}></div>
                    <div className="skeleton skeleton-text" style={{ width: 360 }}></div>
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
            <div className="grid-sidebar-left">
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div className="skeleton skeleton-title" style={{ width: 100 }}></div>
                    </div>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div className="skeleton skeleton-avatar" style={{ width: 36, height: 36 }}></div>
                            <div>
                                <div className="skeleton skeleton-text" style={{ width: 120, marginBottom: 4 }}></div>
                                <div className="skeleton skeleton-text" style={{ width: 80 }}></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div className="skeleton skeleton-title" style={{ width: 140 }}></div>
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: 4 }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
