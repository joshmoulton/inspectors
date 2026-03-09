'use client';

import { useState } from 'react';
import { X, CheckSquare, UserPlus, Download, RefreshCw, Loader2 } from 'lucide-react';
import { ORDER_STATUSES } from '@/lib/types';
import { bulkUpdateStatus, bulkAssignInspector } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Inspector {
    id: string;
    firstName: string;
    lastName: string;
}

interface BulkActionBarProps {
    selectedIds: Set<string>;
    onClearSelection: () => void;
    inspectors: Inspector[];
    orders: { id: string; orderNumber: string; status: string; address1: string | null; city: string | null; state: string | null }[];
}

export default function BulkActionBar({ selectedIds, onClearSelection, inspectors, orders }: BulkActionBarProps) {
    const [loading, setLoading] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showAssignDropdown, setShowAssignDropdown] = useState(false);
    const router = useRouter();

    if (selectedIds.size === 0) return null;

    const ids = Array.from(selectedIds);

    async function handleBulkStatus(status: string) {
        setShowStatusDropdown(false);
        setLoading(true);
        try {
            const result = await bulkUpdateStatus(ids, status);
            if (result.success) {
                toast.success(`${result.count} order${result.count !== 1 ? 's' : ''} updated to "${status}"`);
                onClearSelection();
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to update');
            }
        } catch {
            toast.error('Failed to update orders');
        } finally {
            setLoading(false);
        }
    }

    async function handleBulkAssign(inspectorId: string) {
        setShowAssignDropdown(false);
        setLoading(true);
        try {
            const result = await bulkAssignInspector(ids, inspectorId);
            if (result.success) {
                toast.success(`${result.count} order${result.count !== 1 ? 's' : ''} assigned`);
                onClearSelection();
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to assign');
            }
        } catch {
            toast.error('Failed to assign inspector');
        } finally {
            setLoading(false);
        }
    }

    function handleExportSelected() {
        const selectedOrders = orders.filter(o => selectedIds.has(o.id));
        const rows = [['OrderNumber', 'Status', 'Address', 'City', 'State']];
        for (const o of selectedOrders) {
            rows.push([o.orderNumber, o.status, o.address1 || '', o.city || '', o.state || '']);
        }
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `selected_orders_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${selectedOrders.length} orders`);
    }

    return (
        <div style={{
            position: 'sticky', bottom: 16, zIndex: 50,
            margin: '16px 0',
            padding: '12px 20px',
            background: 'rgba(17, 17, 24, 0.95)',
            border: '1px solid var(--border-brand)',
            borderRadius: 12,
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-glow-strong)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 8,
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--brand-primary-light)',
                    fontSize: 13, fontWeight: 700,
                }}>
                    <CheckSquare size={14} />
                    {selectedIds.size} selected
                </div>

                {loading && <Loader2 size={16} className="spin" style={{ color: 'var(--brand-primary-light)' }} />}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Status Change */}
                <div style={{ position: 'relative' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowAssignDropdown(false); }}
                        disabled={loading}
                    >
                        <RefreshCw size={13} /> Change Status
                    </button>
                    {showStatusDropdown && (
                        <div className="inline-dropdown-menu" style={{ bottom: '100%', top: 'auto', marginBottom: 4, maxHeight: 240, overflowY: 'auto' }}>
                            {ORDER_STATUSES.map((status) => (
                                <button key={status} className="inline-dropdown-item" onClick={() => handleBulkStatus(status)}>
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Assign Inspector */}
                {inspectors.length > 0 && (
                    <div style={{ position: 'relative' }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => { setShowAssignDropdown(!showAssignDropdown); setShowStatusDropdown(false); }}
                            disabled={loading}
                        >
                            <UserPlus size={13} /> Assign
                        </button>
                        {showAssignDropdown && (
                            <div className="inline-dropdown-menu" style={{ bottom: '100%', top: 'auto', marginBottom: 4, maxHeight: 240, overflowY: 'auto' }}>
                                {inspectors.map((insp) => (
                                    <button key={insp.id} className="inline-dropdown-item" onClick={() => handleBulkAssign(insp.id)}>
                                        {insp.firstName} {insp.lastName}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Export Selected */}
                <button className="btn btn-secondary btn-sm" onClick={handleExportSelected} disabled={loading}>
                    <Download size={13} /> Export
                </button>

                {/* Clear Selection */}
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={onClearSelection}
                    disabled={loading}
                    style={{ padding: '0 8px', height: 28 }}
                    title="Clear selection"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
