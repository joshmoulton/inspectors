'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, Mail, Phone, Clock, ChevronDown, MessageSquare, HelpCircle, Book, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const faqItems = [
    { question: 'How do I create a new inspection order?', answer: 'Navigate to Orders > New Order from the sidebar, or click the "New Order" button on the Dashboard. Fill in the required fields including order number, client, property address, and due date.' },
    { question: 'How do I import orders from a CSV file?', answer: 'Go to Import from the sidebar. Download the CSV template, fill in your order data following the column format guide, then drag and drop your file or click to upload.' },
    { question: 'How do I assign an inspector to an order?', answer: 'Open the order detail page, click "Edit Order", and select an inspector from the "Assign Inspector" dropdown. You can also assign inspectors during order creation or use bulk assign from the Orders table.' },
    { question: 'What do the different order statuses mean?', answer: 'Open = assigned and active, Unassigned = no inspector assigned, Completed Pending Approval = inspection done awaiting QC, Completed Approved = passed QC, Submitted to Client = delivered, Paid = payment received, Cancelled = order cancelled.' },
    { question: 'How do I upload inspection photos?', answer: 'Open the order detail page, switch to the Photos tab, and use the drag-and-drop upload area. You can upload multiple photos at once. Supported formats include JPEG, PNG, and HEIC.' },
    { question: 'Can I export order data?', answer: 'Yes, go to Settings & Utilities and click "Export All Data" to download all orders as CSV. You can also generate visual reports from the Reports & Analytics page.' },
    { question: 'How do I use the FormADE builder?', answer: 'Navigate to FormADE from the sidebar. Click "Create New Form" to open the drag-and-drop builder. Add fields by clicking field types (text, number, dropdown, photo, etc.), reorder by dragging, and configure each field\'s label, required status, and options.' },
    { question: 'How do keyboard shortcuts work?', answer: 'Press Ctrl+K (or Cmd+K on Mac) to open the command palette. Common shortcuts: G then D for Dashboard, G then O for Orders, G then N for New Order, G then R for Reports. Press ? to see all available shortcuts.' },
];

const quickLinks: { label: string; href: string; action?: string; external: boolean }[] = [
    { label: 'Getting Started Guide', href: '/resources', external: false },
    { label: 'Keyboard Shortcuts', href: '#', action: 'shortcuts', external: false },
    { label: 'Release Notes', href: '#releases', external: false },
    { label: 'System Status', href: '#status', external: false },
];

interface Ticket {
    id: string;
    name: string;
    email: string;
    subject: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved';
    createdAt: string;
}

export default function SupportPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem('support-tickets');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const faqRef = useRef<HTMLDivElement>(null);

    function handleSubmitTicket(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const ticket: Ticket = {
            id: `TKT-${Date.now().toString(36).toUpperCase()}`,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            subject: formData.get('subject') as string,
            description: formData.get('description') as string,
            status: 'open',
            createdAt: new Date().toISOString(),
        };

        const updated = [ticket, ...tickets];
        setTickets(updated);
        try { localStorage.setItem('support-tickets', JSON.stringify(updated)); } catch {}

        setTimeout(() => {
            setSubmitting(false);
            form.reset();
            toast.success(`Ticket ${ticket.id} submitted successfully`);
        }, 500);
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Support Center</h1>
                    <p className="page-subtitle">Get help, browse FAQs, or contact our support team.</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                {/* FAQ Section */}
                <div>
                    <h2 ref={faqRef} style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <HelpCircle size={18} /> Frequently Asked Questions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {faqItems.map((item, i) => (
                            <div key={i} className="faq-item">
                                <button
                                    className={`faq-question ${openFaq === i ? 'open' : ''}`}
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                >
                                    {item.question}
                                    <ChevronDown size={16} />
                                </button>
                                {openFaq === i && (
                                    <div className="faq-answer">{item.answer}</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Submit Ticket */}
                    <div style={{ marginTop: 32 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MessageSquare size={18} /> Submit a Ticket
                        </h2>
                        <div className="card" style={{ padding: 24 }}>
                            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Your Name</label>
                                        <input type="text" name="name" className="form-control" placeholder="Full name" required />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email</label>
                                        <input type="email" name="email" className="form-control" placeholder="you@company.com" required />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Subject</label>
                                    <input type="text" name="subject" className="form-control" placeholder="Brief description of your issue" required />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Description</label>
                                    <textarea name="description" className="form-control" style={{ height: 'auto', minHeight: 120, padding: 12, resize: 'vertical' }} placeholder="Describe your issue in detail..." required />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Submitting...' : 'Submit Ticket'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Ticket History */}
                    {tickets.length > 0 && (
                        <div style={{ marginTop: 32 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CheckCircle size={18} /> Your Tickets ({tickets.length})
                            </h2>
                            <div className="card" style={{ overflow: 'hidden' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Ticket ID</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tickets.map(ticket => (
                                            <tr key={ticket.id}>
                                                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand-primary-light)' }}>{ticket.id}</td>
                                                <td>{ticket.subject}</td>
                                                <td>
                                                    <span className={`badge ${ticket.status === 'open' ? 'badge-warning' : ticket.status === 'resolved' ? 'badge-success' : 'badge-info'}`}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Headphones size={18} /> Contact Us
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary-light)' }}>
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>Phone Support</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>1-800-555-0199</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-success)' }}>
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>Email Support</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>support@powerade.io</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-warning)' }}>
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>Business Hours</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Mon-Fri 8AM - 6PM EST</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Book size={18} /> Quick Links
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {quickLinks.map((link) => (
                                <button
                                    key={link.label}
                                    onClick={() => {
                                        if (link.external) {
                                            window.open(link.href, '_blank', 'noopener,noreferrer');
                                        } else if (link.action === 'shortcuts') {
                                            toast.info('Press Ctrl+K or ? to view keyboard shortcuts');
                                        } else if (link.href.startsWith('#')) {
                                            faqRef.current?.scrollIntoView({ behavior: 'smooth' });
                                        } else {
                                            router.push(link.href);
                                        }
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'left', width: '100%' }}
                                >
                                    {link.label}
                                    <ExternalLink size={14} style={{ color: 'var(--text-tertiary)' }} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24, background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>System Information</h4>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Version</span>
                                <span style={{ fontFamily: 'monospace' }}>2.0.0</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Environment</span>
                                <span style={{ fontFamily: 'monospace' }}>Production</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Last Updated</span>
                                <span style={{ fontFamily: 'monospace' }}>March 2026</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: 'var(--status-success)' }}>
                                <AlertCircle size={12} /> All systems operational
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
