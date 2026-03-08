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
        <div className="card glass p-6">
            <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-2">Conversation</h3>
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-lg bg-white/5 border border-white/5 animate-in fade-in duration-300">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-primary">
                                {comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : 'System'}
                            </span>
                            <span className="text-[10px] text-muted uppercase font-mono">
                                {new Date(comment.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-sm text-white/90">{comment.text}</p>
                        {comment.showInspector && (
                            <div className="mt-2 text-[10px] text-success font-bold flex items-center gap-1">
                                <Check size={10} /> Visible to Inspector
                            </div>
                        )}
                    </div>
                ))}
                {comments.length === 0 && <p className="text-center text-muted italic p-4">No comments yet.</p>}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="form-control min-h-[100px]"
                    placeholder="Write a message..."
                    disabled={submitting}
                ></textarea>
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-muted cursor-pointer hover:text-white transition-colors">
                        <input
                            type="checkbox"
                            checked={showInspector}
                            onChange={(e) => setShowInspector(e.target.checked)}
                            className="rounded border-white/20 bg-transparent"
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
