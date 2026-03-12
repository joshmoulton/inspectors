export default function ClientDetailLoading() {
    return (
        <div className="page-container">
            <div style={{ width: 120, height: 16, marginBottom: 16 }} className="skeleton" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12 }} className="skeleton" />
                <div>
                    <div style={{ width: 200, height: 24, marginBottom: 8 }} className="skeleton skeleton-title" />
                    <div style={{ width: 250, height: 14 }} className="skeleton skeleton-text" />
                </div>
            </div>
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="stat-card">
                        <div style={{ width: 48, height: 48, borderRadius: 12 }} className="skeleton" />
                        <div className="stat-content">
                            <div style={{ width: 60, height: 28, marginBottom: 4 }} className="skeleton skeleton-title" />
                            <div style={{ width: 80, height: 14 }} className="skeleton skeleton-text" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {[...Array(7)].map((_, i) => (
                                <th key={i}><div style={{ width: 80, height: 14 }} className="skeleton skeleton-text" /></th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(8)].map((_, i) => (
                            <tr key={i}>
                                {[...Array(7)].map((_, j) => (
                                    <td key={j}><div style={{ width: j === 2 ? 150 : 70, height: 14 }} className="skeleton skeleton-text" /></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
