'use client';

import { MoreHorizontal, CheckCircle, XCircle, Send, DollarSign, UserCheck, Printer } from 'lucide-react';
import DropdownMenu from '@/components/DropdownMenu';
import { updateOrderStatus } from '@/lib/actions';
import { toast } from 'sonner';

export default function OrderDetailActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
    async function handleStatusChange(newStatus: string) {
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
            toast.success(`Order status updated to ${newStatus}`);
        } else {
            toast.error(result.error || 'Failed to update status');
        }
    }

    return (
        <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary no-print" onClick={() => window.print()} title="Print order">
                <Printer size={16} />
            </button>
            <DropdownMenu
                trigger={
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        Actions <MoreHorizontal size={16} />
                    </button>
                }
                items={[
                    { label: 'Approve', icon: <CheckCircle size={15} />, onClick: () => handleStatusChange('Completed Approved') },
                    { label: 'Submit to Client', icon: <Send size={15} />, onClick: () => handleStatusChange('Submitted to Client') },
                    { label: 'Mark as Paid', icon: <DollarSign size={15} />, onClick: () => handleStatusChange('Paid') },
                    { label: 'Reassign', icon: <UserCheck size={15} />, onClick: () => handleStatusChange('Reassigned') },
                    { divider: true, label: '' },
                    { label: 'Cancel Order', icon: <XCircle size={15} />, variant: 'danger', onClick: () => handleStatusChange('Cancelled') },
                ]}
            />
        </div>
    );
}
