export default function ResourcesLoading() {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <div className="skeleton skeleton-title" style={{ width: 180, marginBottom: 8 }}></div>
                    <div className="skeleton skeleton-text" style={{ width: 320 }}></div>
                </div>
                <div className="header-actions">
                    <div className="skeleton" style={{ height: 40, width: 150, borderRadius: 'var(--radius-md)' }}></div>
                </div>
            </header>
            {[1, 2, 3].map((section) => (
                <section key={section} style={{ marginBottom: 32 }}>
                    <div className="skeleton skeleton-title" style={{ width: 200, marginBottom: 16 }}></div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card" style={{ padding: 20 }}>
                                <div className="skeleton skeleton-text" style={{ width: 160, marginBottom: 8 }}></div>
                                <div className="skeleton skeleton-text" style={{ width: '100%', marginBottom: 12 }}></div>
                                <div className="skeleton" style={{ height: 32, width: 100, borderRadius: 'var(--radius-md)' }}></div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
