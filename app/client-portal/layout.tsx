import '../globals.css';
import { Toaster } from 'sonner';

export const metadata = {
    title: 'Powerade | Client Portal',
    description: 'View your inspection orders and track progress',
};

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-root)' }}>
            {children}
            <Toaster theme="dark" position="bottom-right" />
        </div>
    );
}
