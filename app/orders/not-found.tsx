import Link from 'next/link';
import { ClipboardList, ArrowLeft } from 'lucide-react';

export default function OrderNotFound() {
    return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                    background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <ClipboardList size={28} style={{ color: 'var(--status-warning)' }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Order Not Found</h2>
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 24 }}>
                    This order may have been deleted or the ID is invalid.
                </p>
                <Link href="/orders" className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back to Orders
                </Link>
            </div>
        </div>
    );
}
