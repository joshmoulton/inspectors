export default function InspectorDetailLoading() {
    return (
        <div className="page-container">
            {/* Back link */}
            <div style={{ width: 120, height: 16, marginBottom: 16 }} className="skeleton" />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%' }} className="skeleton" />
                <div>
                    <div style={{ width: 200, height: 24, marginBottom: 8 }} className="skeleton skeleton-title" />
                    <div style={{ width: 300, height: 14 }} className="skeleton skeleton-text" />
                </div>
            </div>

            {/* Stat cards */}
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

            {/* Summary bar */}
            <div className="card" style={{ padding: '12px 20px', marginBottom: 24 }}>
                <div style={{ width: 400, height: 16 }} className="skeleton skeleton-text" />
            </div>

            {/* Tab bar placeholder */}
            <div style={{ width: 350, height: 40, borderRadius: 10, marginBottom: 20 }} className="skeleton" />

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {[...Array(6)].map((_, i) => (
                                <th key={i}><div style={{ width: 80, height: 14 }} className="skeleton skeleton-text" /></th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(8)].map((_, i) => (
                            <tr key={i}>
                                {[...Array(6)].map((_, j) => (
                                    <td key={j}><div style={{ width: j === 2 ? 180 : 80, height: 14 }} className="skeleton skeleton-text" /></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
