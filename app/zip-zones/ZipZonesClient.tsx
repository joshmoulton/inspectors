'use client';

import { useState, useMemo } from 'react';
import { MapPinned, Plus, Trash2, Search, Upload, Download, UserCheck, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Inspector {
    id: string;
    name: string;
}

interface ZipAssignment {
    id: string;
    zip: string;
    inspectorId: string;
    inspectorName: string;
    inspectorActive: boolean;
    priority: number;
}

interface Props {
    inspectors: Inspector[];
    initialAssignments: ZipAssignment[];
}

export default function ZipZonesClient({ inspectors, initialAssignments }: Props) {
    const router = useRouter();
    const [assignments, setAssignments] = useState(initialAssignments);
    const [search, setSearch] = useState('');
    const [filterInspector, setFilterInspector] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [newZips, setNewZips] = useState('');
    const [newInspectorId, setNewInspectorId] = useState('');
    const [newPriority, setNewPriority] = useState(0);
    const [bulkText, setBulkText] = useState('');
    const [bulkInspectorId, setBulkInspectorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Group by zip for display
    const grouped = useMemo(() => {
        const map = new Map<string, ZipAssignment[]>();
        for (const a of assignments) {
            if (!map.has(a.zip)) map.set(a.zip, []);
            map.get(a.zip)!.push(a);
        }
        return map;
    }, [assignments]);

    // Filtered assignments
    const filtered = useMemo(() => {
        let list = assignments;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(a => a.zip.includes(q) || a.inspectorName.toLowerCase().includes(q));
        }
        if (filterInspector) {
            list = list.filter(a => a.inspectorId === filterInspector);
        }
        return list;
    }, [assignments, search, filterInspector]);

    // Stats
    const uniqueZips = new Set(assignments.map(a => a.zip)).size;
    const uniqueInspectors = new Set(assignments.map(a => a.inspectorId)).size;
    const unassignedInspectors = inspectors.length - uniqueInspectors;

    async function handleAdd() {
        if (!newZips.trim() || !newInspectorId) {
            toast.error('Please enter zip code(s) and select an inspector');
            return;
        }

        const zips = newZips.split(/[\s,;]+/).map(z => z.trim()).filter(z => /^\d{5}$/.test(z));
        if (zips.length === 0) {
            toast.error('Enter valid 5-digit zip codes separated by commas or spaces');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/zip-assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignments: zips.map(zip => ({ zip, inspectorId: newInspectorId, priority: newPriority })),
                }),
            });
            const data = await res.json();
            toast.success(`Added ${data.created} zip assignment${data.created !== 1 ? 's' : ''}`);
            if (data.errors?.length > 0) {
                toast.error(`${data.errors.length} failed`);
            }
            setNewZips('');
            setShowAddForm(false);
            router.refresh();
        } catch {
            toast.error('Failed to add assignments');
        }
        setLoading(false);
    }

    async function handleBulkImport() {
        if (!bulkText.trim()) {
            toast.error('Paste zip codes to import');
            return;
        }
        if (!bulkInspectorId) {
            toast.error('Select an inspector');
            return;
        }

        const zips = bulkText.split(/[\s,;\n\r]+/).map(z => z.trim()).filter(z => /^\d{5}$/.test(z));
        if (zips.length === 0) {
            toast.error('No valid 5-digit zip codes found');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/zip-assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignments: zips.map(zip => ({ zip, inspectorId: bulkInspectorId, priority: 0 })),
                }),
            });
            const data = await res.json();
            toast.success(`Imported ${data.created} zip codes`);
            setBulkText('');
            setShowBulkImport(false);
            router.refresh();
        } catch {
            toast.error('Import failed');
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        try {
            await fetch('/api/zip-assignments', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            setAssignments(prev => prev.filter(a => a.id !== id));
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            toast.success('Removed');
        } catch {
            toast.error('Failed to delete');
        }
    }

    async function handleBulkDelete() {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        setLoading(true);
        try {
            await fetch('/api/zip-assignments', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            });
            setAssignments(prev => prev.filter(a => !selectedIds.has(a.id)));
            setSelectedIds(new Set());
            toast.success(`Deleted ${ids.length} assignment${ids.length !== 1 ? 's' : ''}`);
        } catch {
            toast.error('Failed to delete');
        }
        setLoading(false);
    }

    function handleExport() {
        const csv = ['Zip,Inspector,Priority'];
        for (const a of assignments) {
            csv.push(`${a.zip},"${a.inspectorName}",${a.priority}`);
        }
        const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `zip-assignments-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    const allSelected = filtered.length > 0 && filtered.every(a => selectedIds.has(a.id));

    function toggleSelectAll() {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(a => a.id)));
        }
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Zip Zones</h1>
                    <p className="page-subtitle">Auto-assign inspectors to orders by zip code.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleExport} title="Export CSV">
                        <Download size={16} /> Export
                    </button>
                    <button className="btn btn-secondary" onClick={() => { setShowBulkImport(!showBulkImport); setShowAddForm(false); }}>
                        <Upload size={16} /> Bulk Import
                    </button>
                    <button className="btn btn-primary" onClick={() => { setShowAddForm(!showAddForm); setShowBulkImport(false); }}>
                        <Plus size={16} /> Add Zips
                    </button>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--brand-primary-light)' }}>
                        <MapPinned size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{uniqueZips.toLocaleString()}</div>
                        <div className="stat-label">Zip Codes Covered</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success)' }}>
                        <UserCheck size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{uniqueInspectors}</div>
                        <div className="stat-label">Inspectors with Zones</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--status-warning)' }}>
                        <AlertTriangle size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{unassignedInspectors}</div>
                        <div className="stat-label">No Zones Assigned</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--status-purple)' }}>
                        <MapPinned size={22} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{assignments.length.toLocaleString()}</div>
                        <div className="stat-label">Total Assignments</div>
                    </div>
                </div>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Add Zip Assignments</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 12, alignItems: 'end' }}>
                        <div>
                            <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>Zip Codes (comma or space separated)</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="30301, 30302, 30303"
                                value={newZips}
                                onChange={e => setNewZips(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>Inspector</label>
                            <select className="form-control" value={newInspectorId} onChange={e => setNewInspectorId(e.target.value)}>
                                <option value="">Select inspector...</option>
                                {inspectors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>Priority</label>
                            <input
                                type="number"
                                className="form-control"
                                style={{ width: 80 }}
                                value={newPriority}
                                onChange={e => setNewPriority(parseInt(e.target.value) || 0)}
                                min={0}
                                max={10}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={handleAdd} disabled={loading} style={{ height: 38 }}>
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
                        Higher priority inspectors are preferred. When multiple inspectors have the same priority, the one with fewer open orders is chosen.
                    </p>
                </div>
            )}

            {/* Bulk Import */}
            {showBulkImport && (
                <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Bulk Import Zip Codes</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12, alignItems: 'start' }}>
                        <div>
                            <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>Paste zip codes (one per line, or comma separated)</label>
                            <textarea
                                className="form-control"
                                style={{ minHeight: 120, fontFamily: 'monospace', fontSize: 13 }}
                                placeholder={"30301\n30302\n30303\n30304"}
                                value={bulkText}
                                onChange={e => setBulkText(e.target.value)}
                            />
                            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                                {bulkText.split(/[\s,;\n\r]+/).filter(z => /^\d{5}$/.test(z.trim())).length} valid zip codes detected
                            </p>
                        </div>
                        <div>
                            <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>Assign to Inspector</label>
                            <select className="form-control" value={bulkInspectorId} onChange={e => setBulkInspectorId(e.target.value)}>
                                <option value="">Select inspector...</option>
                                {inspectors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 12 }}
                                onClick={handleBulkImport}
                                disabled={loading}
                            >
                                {loading ? 'Importing...' : 'Import All'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        className="form-control"
                        style={{ paddingLeft: 32, height: 34 }}
                        placeholder="Search zip codes or inspectors..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="form-control"
                    style={{ width: 200, height: 34 }}
                    value={filterInspector}
                    onChange={e => setFilterInspector(e.target.value)}
                >
                    <option value="">All Inspectors</option>
                    {inspectors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                {selectedIds.size > 0 && (
                    <button className="btn btn-secondary" style={{ color: 'var(--status-danger)' }} onClick={handleBulkDelete} disabled={loading}>
                        <Trash2 size={14} /> Delete {selectedIds.size} Selected
                    </button>
                )}
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {filtered.length.toLocaleString()} assignment{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                {filtered.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <MapPinned size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No zip assignments found</div>
                        <div style={{ fontSize: 13 }}>
                            {assignments.length === 0
                                ? 'Click "Add Zips" or "Bulk Import" to get started.'
                                : 'Try adjusting your search or filter.'}
                        </div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: 40 }}>
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </th>
                                <th>Zip Code</th>
                                <th>Inspector</th>
                                <th style={{ textAlign: 'center' }}>Priority</th>
                                <th style={{ textAlign: 'center' }}>Coverage</th>
                                <th style={{ width: 60 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(a => {
                                const otherInspectors = (grouped.get(a.zip) || []).filter(x => x.id !== a.id);
                                return (
                                    <tr key={a.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(a.id)}
                                                onChange={() => {
                                                    setSelectedIds(prev => {
                                                        const next = new Set(prev);
                                                        if (next.has(a.id)) next.delete(a.id);
                                                        else next.add(a.id);
                                                        return next;
                                                    });
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>
                                                {a.zip}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{
                                                    width: 26, height: 26, borderRadius: '50%',
                                                    background: 'rgba(99, 102, 241, 0.12)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 10, fontWeight: 700, color: 'var(--brand-primary-light)', flexShrink: 0,
                                                }}>
                                                    {a.inspectorName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.inspectorName}</div>
                                                    {!a.inspectorActive && (
                                                        <span className="badge badge-gray" style={{ fontSize: 9 }}>Inactive</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {a.priority > 0 ? (
                                                <span className="badge badge-info" style={{ fontSize: 11 }}>{a.priority}</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>0</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {otherInspectors.length > 0 ? (
                                                <span className="badge badge-purple" style={{ fontSize: 11 }}>
                                                    +{otherInspectors.length} more
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>sole</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleDelete(a.id)}
                                                title="Remove assignment"
                                                style={{ color: 'var(--text-tertiary)' }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
