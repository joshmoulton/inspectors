'use client';

import { useState } from 'react';
import { Building2, Lock, LogIn, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientPortalLogin() {
    const [clientCode, setClientCode] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (!clientCode.trim()) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/client-portal/auth?code=${encodeURIComponent(clientCode.trim())}`);
            const data = await res.json();

            if (data.success) {
                window.location.href = `/client-portal/dashboard?token=${data.token}`;
            } else {
                toast.error(data.error || 'Invalid client code');
            }
        } catch {
            toast.error('Failed to authenticate');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-root)', padding: 20,
        }}>
            <div style={{ width: '100%', maxWidth: 440 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', fontSize: 24, fontWeight: 800, color: 'white',
                    }}>
                        P
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Client Portal</h1>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
                        View your inspection orders and track progress
                    </p>
                </div>

                <div className="card" style={{ padding: 32 }}>
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>
                                Client Code
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter your client code (e.g., SAFEGUARD)"
                                    value={clientCode}
                                    onChange={(e) => setClientCode(e.target.value.toUpperCase())}
                                    style={{ paddingLeft: 36 }}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 44 }} disabled={loading}>
                            {loading ? <><Loader2 size={16} className="spin" /> Authenticating...</> : <><LogIn size={16} /> Access Portal</>}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-tertiary)' }}>
                    Contact your account manager for portal access credentials.
                </p>
            </div>
        </div>
    );
}
