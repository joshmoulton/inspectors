import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import OrderTabs from '@/components/OrderTabs';
import CommentSection from '@/components/CommentSection';
import PhotoUpload from '@/components/PhotoUpload';
import Breadcrumbs from '@/components/Breadcrumbs';
import OrderDetailActions from './OrderDetailActions';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const order = await prisma.workOrder.findUnique({
        where: { id },
        include: {
            client: { include: { logins: true } },
            inspector: true,
            qcUser: true,
            comments: { include: { author: true }, orderBy: { createdAt: 'desc' } },
            history: { orderBy: { createdAt: 'desc' } },
            attachments: true,
        },
    });

    if (!order) {
        return notFound();
    }

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'photos', label: 'Photos', count: order.attachments.length },
        { id: 'comments', label: 'Comments', count: order.comments.length },
        { id: 'history', label: 'History', count: order.history.length },
    ];

    return (
        <div className="page-container">
            <Breadcrumbs items={[
                { label: 'Orders', href: '/orders' },
                { label: `#${order.orderNumber}` },
            ]} />

            <header className="page-header" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h1 className="page-title">Order #{order.orderNumber}</h1>
                        <span className={`badge badge-${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="page-subtitle">
                        {order.address1}, {order.city}, {order.state} {order.zip}
                    </p>
                </div>
                <div className="header-actions">
                    <Link href={`/orders/${id}/edit`} className="btn btn-secondary">Edit Order</Link>
                    <OrderDetailActions orderId={id} currentStatus={order.status} />
                </div>
            </header>

            <OrderTabs tabs={tabs}>
                {/* Overview Tab */}
                <div key="overview" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>Property Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
                                <DetailItem label="Address 1" value={order.address1} />
                                <DetailItem label="Address 2" value={order.address2} />
                                <DetailItem label="City" value={order.city} />
                                <DetailItem label="State" value={order.state} />
                                <DetailItem label="Zip" value={order.zip} />
                                <DetailItem label="County" value={order.county} />
                                <DetailItem label="Latitude" value={order.latitude?.toString()} />
                                <DetailItem label="Longitude" value={order.longitude?.toString()} />
                            </div>
                        </div>

                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>Details & Financials</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
                                <DetailItem label="Lender / Mortgage Co" value={order.mortgageCompany} />
                                <DetailItem label="Loan #" value={order.loanNumber} />
                                <DetailItem label="Client Pay" value={order.clientPay ? `$${order.clientPay.toFixed(2)}` : '---'} />
                                <DetailItem label="Inspector Pay" value={order.inspectorPay ? `$${order.inspectorPay.toFixed(2)}` : '---'} />
                                <DetailItem label="Occupancy" value={order.vacant ? 'Vacant' : 'Occupied'} isBadge />
                                <DetailItem label="Photo Required" value={order.photoRequired ? 'Yes' : 'No'} isBadge />
                            </div>
                        </div>

                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>Instructions</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {order.instructions || 'No instructions provided.'}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>Timeline</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <TimelineItem label="Due Date" date={order.dueDate} isImportant />
                                <TimelineItem label="Ordered" date={order.orderedDate} />
                                <TimelineItem label="Assigned" date={order.assignedDate} />
                                <TimelineItem label="Completed" date={order.completedDate} />
                                <TimelineItem label="Submitted" date={order.submittedDate} />
                                <TimelineItem label="Paid" date={order.paidDate} />
                            </div>
                        </div>

                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>Assignment</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <DetailItem label="Client" value={order.client?.name} />
                                <DetailItem label="Code" value={order.client?.code} isBadge />
                                <DetailItem label="Inspector" value={order.inspector ? `${order.inspector.firstName} ${order.inspector.lastName}` : 'Unassigned'} />
                                <DetailItem label="QC Manager" value={order.qcUser ? `${order.qcUser.firstName} ${order.qcUser.lastName}` : 'None'} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Photos Tab */}
                <div key="photos" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {order.attachments.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                            {order.attachments.map((file: any) => (
                                <div key={file.id} className="card" style={{ padding: 8 }}>
                                    <div style={{ aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                                        <img src={file.url} alt={file.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{file.filename}</span>
                                        <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{(file.size! / 1024).toFixed(0)}KB</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 32 }}>
                        <PhotoUpload orderId={order.id} />
                    </div>
                </div>

                {/* Comments Tab */}
                <div key="comments">
                    <CommentSection
                        orderId={order.id}
                        initialComments={order.comments.map((c: any) => ({
                            ...c,
                            createdAt: c.createdAt.toISOString()
                        }))}
                    />
                </div>

                {/* History Tab */}
                <div key="history">
                    <div className="card" style={{ overflow: 'hidden' }}>
                        {order.history.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>Details</th>
                                        <th>User</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.history.map((entry: any) => (
                                        <tr key={entry.id}>
                                            <td style={{ fontWeight: 600 }}>{entry.action}</td>
                                            <td style={{ fontSize: 13 }}>{entry.details || '---'}</td>
                                            <td>{entry.user || 'System'}</td>
                                            <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{new Date(entry.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: 13 }}>
                                No history recorded yet.
                            </div>
                        )}
                    </div>
                </div>
            </OrderTabs>
        </div>
    );
}

function DetailItem({ label, value, isBadge }: { label: string; value?: string | null; isBadge?: boolean }) {
    if (!value) value = '---';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 600 }}>{label}</span>
            {isBadge && value !== '---' ? (
                <span className="badge badge-info" style={{ width: 'fit-content' }}>{value}</span>
            ) : (
                <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
            )}
        </div>
    );
}

function TimelineItem({ label, date, isImportant }: { label: string; date?: Date | null; isImportant?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
            <span style={{ fontFamily: 'monospace', color: isImportant ? 'var(--brand-primary-light)' : 'var(--text-secondary)', fontWeight: isImportant ? 600 : 400 }}>
                {date ? new Date(date).toLocaleDateString() : '---'}
            </span>
        </div>
    );
}

function getStatusColor(status: string) {
    if (status.includes('Completed Approved')) return 'success';
    if (status.includes('Completed Pending')) return 'info';
    if (status === 'Open') return 'warning';
    if (status === 'Cancelled') return 'danger';
    if (status === 'Unassigned') return 'gray';
    if (status.includes('Submitted')) return 'purple';
    if (status === 'Paid') return 'teal';
    return 'brand';
}
