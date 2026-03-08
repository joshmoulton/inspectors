'use client';

import { addComment } from '@/lib/actions';
import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Send } from 'lucide-react';

interface Comment {
    id: string;
    text: string;
    showInspector: boolean;
    createdAt: string | Date;
    author?: {
        firstName: string;
        lastName: string;
    } | null;
}

interface CommentSectionProps {
    orderId: string;
    initialComments: Comment[];
}

export default function CommentSection({ orderId, initialComments }: CommentSectionProps) {
    const [comments, setComments] = useState(initialComments);
    const [text, setText] = useState('');
    const [showInspector, setShowInspector] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim() || submitting) return;

        setSubmitting(true);

        try {
            const result = await addComment(orderId, text, showInspector);
            if (result.success && result.comment) {
                setText('');
                setShowInspector(false);
                setComments([result.comment as any, ...comments]);
                toast.success('Comment added successfully');
            } else {
                toast.error(result.error || 'Failed to add comment');
            }
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
                Conversation
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto', marginBottom: 20, paddingRight: 8 }}>
                {comments.map((comment) => (
                    <div key={comment.id} style={{
                        padding: 16, borderRadius: 'var(--radius-md)',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-primary-light)' }}>
                                {comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : 'System'}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                                {new Date(comment.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{comment.text}</p>
                        {comment.showInspector && (
                            <div style={{ marginTop: 8, fontSize: 10, color: 'var(--status-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Check size={10} /> Visible to Inspector
                            </div>
                        )}
                    </div>
                ))}
                {comments.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: 24 }}>
                        No comments yet.
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="form-control"
                    style={{ minHeight: 100 }}
                    placeholder="Write a message..."
                    disabled={submitting}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={showInspector}
                            onChange={(e) => setShowInspector(e.target.checked)}
                        />
                        Show to Inspector
                    </label>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting || !text.trim()}
                    >
                        <Send size={14} /> {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </form>
        </div>
    );
}
