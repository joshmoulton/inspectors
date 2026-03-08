'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid username or password');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login-bg">
            <div className="login-card">
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56,
                        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
                        borderRadius: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, fontWeight: 800, color: 'white',
                        margin: '0 auto 16px',
                        boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)'
                    }}>
                        P
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Powerade</h1>
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Inspection Management</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {error && (
                        <div style={{
                            padding: 12, background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: 'var(--status-danger)', fontSize: 13, borderRadius: 10, textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>Username</label>
                        <div className="login-input-wrapper">
                            <User size={16} className="login-input-icon" />
                            <input
                                type="text"
                                className="form-control"
                                style={{ height: 48 }}
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>Password</label>
                        <div className="login-input-wrapper">
                            <Lock size={16} className="login-input-icon" />
                            <input
                                type="password"
                                className="form-control"
                                style={{ height: 48 }}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', height: 48, fontSize: 15, fontWeight: 700, marginTop: 8 }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: 32, textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)' }}>
                    <p>&copy; 2026 Powerade. All rights reserved.</p>
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 16 }}>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>Privacy Policy</button>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>Terms of Service</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
