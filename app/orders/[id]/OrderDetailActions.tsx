'use client';

import { MoreHorizontal, CheckCircle, XCircle, Send, DollarSign, UserCheck, Printer, RotateCcw, AlertTriangle, Clock } from 'lucide-react';
import DropdownMenu from '@/components/DropdownMenu';
import { updateOrderStatus } from '@/lib/actions';
import { toast } from 'sonner';
import { type ReactNode } from 'react';

// Define valid transitions per status
const STATUS_ACTIONS: Record<string, { label: string; status: string; icon: ReactNode; variant?: 'danger' }[]> = {
    'Unassigned': [
        { label: 'Mark as Open', status: 'Open', icon: <Clock size={15} /> },
        { label: 'Cancel Order', status: 'Cancelled', icon: <XCircle size={15} />, variant: 'danger' },
    ],
    'Open': [
        { label: 'Mark Completed', status: 'Completed Pending Approval', icon: <CheckCircle size={15} /> },
        { label: 'Flag Follow-Up', status: 'Follow-Up Needed', icon: <AlertTriangle size={15} /> },
        { label: 'Reassign', status: 'Reassigned', icon: <UserCheck size={15} /> },
        { label: 'Cancel Order', status: 'Cancelled', icon: <XCircle size={15} />, variant: 'danger' },
    ],
    'Completed Pending Approval': [
        { label: 'Approve', status: 'Completed Approved', icon: <CheckCircle size={15} /> },
        { label: 'Reject', status: 'Completed Rejected', icon: <XCircle size={15} />, variant: 'danger' },
    ],
    'Completed Approved': [
        { label: 'Submit to Client', status: 'Submitted to Client', icon: <Send size={15} /> },
    ],
    'Completed Rejected': [
        { label: 'Reopen', status: 'Open', icon: <RotateCcw size={15} /> },
        { label: 'Cancel Order', status: 'Cancelled', icon: <XCircle size={15} />, variant: 'danger' },
    ],
    'Submitted to Client': [
        { label: 'Mark as Paid', status: 'Paid', icon: <DollarSign size={15} /> },
    ],
    'Follow-Up Needed': [
        { label: 'Follow-Up Complete', status: 'Follow-Up Completed', icon: <CheckCircle size={15} /> },
        { label: 'Reopen', status: 'Open', icon: <RotateCcw size={15} /> },
    ],
    'Follow-Up Completed': [
        { label: 'Mark Completed', status: 'Completed Pending Approval', icon: <CheckCircle size={15} /> },
    ],
    'Reassigned': [
        { label: 'Mark as Open', status: 'Open', icon: <Clock size={15} /> },
    ],
    'Cancelled': [
        { label: 'Reopen', status: 'Open', icon: <RotateCcw size={15} /> },
    ],
    'Paid': [],
};

export default function OrderDetailActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
    async function handleStatusChange(newStatus: string) {
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
            toast.success(`Order status updated to ${newStatus}`);
        } else {
            toast.error(result.error || 'Failed to update status');
        }
    }

    const actions = STATUS_ACTIONS[currentStatus] || [];

    const menuItems = actions.map(a => ({
        label: a.label,
        icon: a.icon,
        variant: a.variant as 'danger' | undefined,
        onClick: () => handleStatusChange(a.status),
    }));

    // Insert divider before danger items if there are non-danger items
    const hasDanger = menuItems.some(i => i.variant === 'danger');
    const hasNonDanger = menuItems.some(i => !i.variant);
    if (hasDanger && hasNonDanger) {
        const firstDangerIdx = menuItems.findIndex(i => i.variant === 'danger');
        menuItems.splice(firstDangerIdx, 0, { label: '', divider: true } as any);
    }

    return (
        <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary no-print" onClick={() => window.print()} title="Print order">
                <Printer size={16} />
            </button>
            {menuItems.length > 0 && (
                <DropdownMenu
                    trigger={
                        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            Actions <MoreHorizontal size={16} />
                        </button>
                    }
                    items={menuItems}
                />
            )}
        </div>
    );
}
