import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import OrderTabs from '@/components/OrderTabs';
import CommentSection from '@/components/CommentSection';
import PhotoUpload from '@/components/PhotoUpload';

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
            <header className="page-header items-start">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 mb-1">
                        <Link href="/orders" className="text-muted hover:text-white transition-colors">
                            <span className="text-xl">←</span>
                        </Link>
                        <h1 className="page-title leading-none">Order #{order.orderNumber}</h1>
                        <span className={`badge badge-${getStatusColor(order.status)} ml-2`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="page-subtitle">
                        {order.address1}, {order.city}, {order.state} {order.zip}
                    </p>
                </div>
                <div className="header-actions">
                    <Link href={`/orders/${id}/edit`} className="btn btn-secondary mr-2">Edit Order</Link>
                    <button className="btn btn-primary">Submit to Client</button>
                </div>
            </header>

            <OrderTabs tabs={tabs}>
                {/* Overview Tab */}
                <div key="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card glass p-6">
                            <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-2">Property Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
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

                        <div className="card glass p-6">
                            <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-2">Details & Financials</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <DetailItem label="Lender / Mortgage Co" value={order.mortgageCompany} />
                                <DetailItem label="Loan #" value={order.loanNumber} />
                                <DetailItem label="Client Pay" value={order.clientPay ? `$${order.clientPay.toFixed(2)}` : '---'} />
                                <DetailItem label="Inspector Pay" value={order.inspectorPay ? `$${order.inspectorPay.toFixed(2)}` : '---'} />
                                <DetailItem label="Occupancy" value={order.vacant ? 'Vacant' : 'Occupied'} isBadge />
                                <DetailItem label="Photo Required" value={order.photoRequired ? 'Yes' : 'No'} isBadge />
                            </div>
                        </div>

                        <div className="card glass p-6">
                            <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-2">Instructions</h3>
                            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                                {order.instructions || 'No instructions provided.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card glass p-6">
                            <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-2">Timeline</h3>
                            <div className="space-y-4">
                                <TimelineItem label="Due Date" date={order.dueDate} isImportant />
                                <TimelineItem label="Ordered" date={order.orderedDate} />
                                <TimelineItem label="Assigned" date={order.assignedDate} />
                                <TimelineItem label="Completed" date={order.completedDate} />
                                <TimelineItem label="Submitted" date={order.submittedDate} />
                                <TimelineItem label="Paid" date={order.paidDate} />
                            </div>
                        </div>

                        <div className="card glass p-6">
                            <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-2">Assignment</h3>
                            <div className="space-y-4">
                                <DetailItem label="Client" value={order.client?.name} />
                                <DetailItem label="Code" value={order.client?.code} isBadge />
                                <DetailItem label="Inspector" value={order.inspector ? `${order.inspector.firstName} ${order.inspector.lastName}` : 'Unassigned'} />
                                <DetailItem label="QC Manager" value={order.qcUser ? `${order.qcUser.firstName} ${order.qcUser.lastName}` : 'None'} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Photos Tab */}
                <div key="photos" className="space-y-8 animate-in fade-in duration-500">
                    {order.attachments.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {order.attachments.map((file: any) => (
                                <div key={file.id} className="group card glass p-2 hover:border-primary/50 transition-all duration-300">
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden relative mb-2">
                                        <img
                                            src={file.url}
                                            alt={file.filename}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <a href={file.url} target="_blank" className="btn btn-secondary btn-sm">View Full</a>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-bold text-muted truncate max-w-[120px]">{file.filename}</span>
                                        <span className="text-[8px] font-mono text-muted/50">{(file.size! / 1024).toFixed(0)}KB</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-white/5 pt-8">
                        <PhotoUpload orderId={order.id} />
                    </div>
                </div>

                {/* Comments Tab */}
                <div key="comments" className="animate-in fade-in duration-500">
                    <CommentSection
                        orderId={order.id}
                        initialComments={order.comments.map((c: any) => ({
                            ...c,
                            createdAt: c.createdAt.toISOString()
                        }))}
                    />
                </div>

                {/* History Tab */}
                <div key="history" className="card glass overflow-hidden animate-in fade-in duration-500">
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
                                    <td className="font-bold text-white/90">{entry.action}</td>
                                    <td className="text-sm">{entry.details || '---'}</td>
                                    <td>{entry.user || 'System'}</td>
                                    <td className="text-xs font-mono">{new Date(entry.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {order.history.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center italic text-muted p-8">No history recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </OrderTabs>
        </div>
    );
}

function DetailItem({ label, value, isBadge }: { label: string; value?: string | null; isBadge?: boolean }) {
    if (!value) value = '---';
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted font-bold">{label}</span>
            {isBadge && value !== '---' ? (
                <span className="badge badge-info w-fit">{value}</span>
            ) : (
                <span className="text-sm font-medium">{value}</span>
            )}
        </div>
    );
}

function TimelineItem({ label, date, isImportant }: { label: string; date?: Date | null; isImportant?: boolean }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-muted">{label}</span>
            <span className={`font-mono ${isImportant ? 'text-primary' : 'text-white/80'}`}>
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
    if (status === 'Unassigned') return 'muted';
    return 'primary';
}
