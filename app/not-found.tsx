import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
            <div style={{ textAlign: 'center', maxWidth: 480 }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
                    background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Search size={32} style={{ color: 'var(--brand-primary-light)' }} />
                </div>
                <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>404</h1>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Page Not Found</h2>
                <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 32 }}>
                    The page you&apos;re looking for doesn&apos;t exist or has been moved. Check the URL or head back to familiar territory.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <Link href="/" className="btn btn-primary">
                        <Home size={16} /> Dashboard
                    </Link>
                    <Link href="/orders" className="btn btn-secondary">
                        <ArrowLeft size={16} /> Orders
                    </Link>
                </div>
            </div>
        </div>
    );
}
