import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import OrderTabs from '@/components/OrderTabs';
import CommentSection from '@/components/CommentSection';
import PhotoUpload from '@/components/PhotoUpload';
import StatusStepper from '@/components/StatusStepper';
import Breadcrumbs from '@/components/Breadcrumbs';
import OrderDetailActions from './OrderDetailActions';
import CopyButton from '@/components/CopyButton';
import {
    MapPin, Phone, Building2, DollarSign, Calendar, User, Shield,
    FileText, AlertTriangle, Clock, CheckCircle, Tag, ExternalLink
} from 'lucide-react';

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

    const isOverdue = order.dueDate && new Date(order.dueDate) < new Date() && !['Paid', 'Cancelled', 'Submitted to Client'].includes(order.status);
    const tags = order.tags ? order.tags.split(',').filter(Boolean) : [];
    const profit = (order.clientPay || 0) - (order.inspectorPay || 0);

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            Order #{order.orderNumber}
                            <CopyButton text={order.orderNumber} label="order number" />
                        </h1>
                        <span className={`badge badge-${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                        {isOverdue && (
                            <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <AlertTriangle size={12} /> Overdue
                            </span>
                        )}
                        {order.rushFlag && (
                            <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <AlertTriangle size={12} /> Rush
                            </span>
                        )}
                    </div>
                    <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} style={{ flexShrink: 0 }} />
                        {order.address1}{order.address2 ? `, ${order.address2}` : ''}, {order.city}, {order.state} {order.zip}
                        {order.county && <span style={{ color: 'var(--text-tertiary)' }}>({order.county} County)</span>}
                    </p>
                    {tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                            {tags.map((tag) => (
                                <span key={tag} style={{
                                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                                    background: 'rgba(99, 102, 241, 0.1)', color: 'var(--brand-primary-light)',
                                    display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                    <Tag size={10} /> {tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="header-actions">
                    <Link href={`/orders/${id}/edit`} className="btn btn-secondary">Edit Order</Link>
                    <OrderDetailActions orderId={id} currentStatus={order.status} />
                </div>
            </header>

            <div className="card" style={{ padding: '16px 24px', marginBottom: 24 }}>
                <StatusStepper order={{
                    orderedDate: order.orderedDate,
                    assignedDate: order.assignedDate,
                    completedDate: order.completedDate,
                    status: order.status,
                    submittedDate: order.submittedDate,
                    paidDate: order.paidDate,
                }} />
            </div>

            <OrderTabs tabs={tabs}>
                {/* Overview Tab */}
                <div key="overview" className="grid-sidebar-right">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Property Information */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MapPin size={16} style={{ color: 'var(--brand-primary-light)' }} /> Property Information
                            </h3>
                            <div className="grid-detail-fields">
                                <DetailItem label="Address 1" value={order.address1} />
                                <DetailItem label="Address 2" value={order.address2} />
                                <DetailItem label="City" value={order.city} />
                                <DetailItem label="State" value={order.state} />
                                <DetailItem label="Zip" value={order.zip} />
                                <DetailItem label="County" value={order.county} />
                                <DetailItem label="Latitude" value={order.latitude?.toFixed(6)} />
                                <DetailItem label="Longitude" value={order.longitude?.toFixed(6)} />
                            </div>
                            {order.latitude && order.longitude && (
                                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                                    <div style={{
                                        height: 180, borderRadius: 8, overflow: 'hidden', marginBottom: 12,
                                        background: 'var(--bg-surface-hover)', position: 'relative',
                                    }}>
                                        <iframe
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.longitude! - 0.01},${order.latitude! - 0.007},${order.longitude! + 0.01},${order.latitude! + 0.007}&layer=mapnik&marker=${order.latitude},${order.longitude}`}
                                            style={{ width: '100%', height: '100%', border: 0, filter: 'invert(0.9) hue-rotate(180deg) saturate(0.5) brightness(0.9)' }}
                                            loading="lazy"
                                            title="Property location map"
                                        />
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary btn-sm"
                                        style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                    >
                                        <ExternalLink size={12} /> Open in Google Maps
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Details & Financials */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <DollarSign size={16} style={{ color: 'var(--status-success)' }} /> Details & Financials
                            </h3>
                            <div className="grid-detail-fields">
                                <DetailItem label="Work Code" value={order.workCode} />
                                <DetailItem label="Inspection Type" value={order.type} isBadge />
                                <DetailItem label="Lender / Mortgage Co" value={order.mortgageCompany} />
                                <DetailItem label="Loan #" value={order.loanNumber} />
                                <DetailItem label="Vendor" value={order.vendor} />
                                <DetailItem label="Client Order #" value={order.clientOrderNum} />
                            </div>
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
                                marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)'
                            }}>
                                <div style={{
                                    padding: 16, borderRadius: 10, textAlign: 'center',
                                    background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)'
                                }}>
                                    <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>Client Pay</div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--status-success)' }}>${(order.clientPay || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                                <div style={{
                                    padding: 16, borderRadius: 10, textAlign: 'center',
                                    background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.15)'
                                }}>
                                    <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>Inspector Pay</div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--status-info)' }}>${(order.inspectorPay || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                                <div style={{
                                    padding: 16, borderRadius: 10, textAlign: 'center',
                                    background: profit >= 0 ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                                    border: `1px solid ${profit >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`
                                }}>
                                    <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>Profit</div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: profit >= 0 ? 'var(--status-success)' : 'var(--status-danger)' }}>${profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                        </div>

                        {/* Flags */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Tag size={16} style={{ color: 'var(--status-warning)' }} /> Flags & Settings
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                                <FlagItem label="Occupancy" value={order.vacant ? 'Vacant' : 'Occupied'} active={order.vacant} />
                                <FlagItem label="Photo Required" value={order.photoRequired ? 'Yes' : 'No'} active={order.photoRequired} />
                                <FlagItem label="Rush Order" value={order.rushFlag ? 'Yes' : 'No'} active={order.rushFlag} />
                                <FlagItem label="Locked" value={order.locked ? 'Yes' : 'No'} active={order.locked} />
                                <FlagItem label="ECD Needed" value={order.ecdNeeded ? 'Yes' : 'No'} active={order.ecdNeeded} />
                                <FlagItem label="Auto-Approve" value={order.autoApprove === 2 ? 'On' : order.autoApprove === 1 ? 'Off' : 'Default'} active={order.autoApprove === 2} />
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FileText size={16} style={{ color: 'var(--brand-primary-light)' }} /> Instructions
                            </h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                {order.instructions || 'No instructions provided.'}
                            </p>
                            {order.doorCardMessage && (
                                <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                                    <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: 'var(--status-warning)', marginBottom: 6 }}>Door Card Message</div>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{order.doorCardMessage}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Timeline */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Calendar size={16} style={{ color: 'var(--brand-primary-light)' }} /> Timeline
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <TimelineItem label="Due Date" date={order.dueDate} isImportant icon={<Clock size={14} />} isOverdue={!!isOverdue} />
                                <TimelineItem label="Ordered" date={order.orderedDate} icon={<FileText size={14} />} />
                                <TimelineItem label="Assigned" date={order.assignedDate} icon={<User size={14} />} />
                                <TimelineItem label="Window Start" date={order.windowStartDate} icon={<Calendar size={14} />} />
                                <TimelineItem label="Window End" date={order.windowEndDate} icon={<Calendar size={14} />} />
                                <TimelineItem label="ECD" date={order.ecd} icon={<Clock size={14} />} />
                                <TimelineItem label="Completed" date={order.completedDate} icon={<CheckCircle size={14} />} />
                                <TimelineItem label="Submitted" date={order.submittedDate} icon={<ExternalLink size={14} />} />
                                <TimelineItem label="Paid" date={order.paidDate} icon={<DollarSign size={14} />} isLast />
                            </div>
                        </div>

                        {/* Assignment */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <User size={16} style={{ color: 'var(--brand-primary-light)' }} /> Assignment
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <PersonCard
                                    role="Client"
                                    icon={<Building2 size={16} />}
                                    name={order.client?.name}
                                    subtitle={order.client?.code}
                                />
                                <PersonCard
                                    role="Inspector"
                                    icon={<User size={16} />}
                                    name={order.inspector ? `${order.inspector.firstName} ${order.inspector.lastName}` : undefined}
                                    subtitle={order.inspector?.phone}
                                />
                                <PersonCard
                                    role="QC Manager"
                                    icon={<Shield size={16} />}
                                    name={order.qcUser ? `${order.qcUser.firstName} ${order.qcUser.lastName}` : undefined}
                                />
                            </div>
                        </div>

                        {/* Borrower Info */}
                        {(order.firstName || order.lastName || order.homePhone) && (
                            <div className="card" style={{ padding: 24 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Phone size={16} style={{ color: 'var(--status-info)' }} /> Borrower Info
                                </h3>
                                <div className="grid-detail-fields" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <DetailItem label="First Name" value={order.firstName} />
                                    <DetailItem label="Last Name" value={order.lastName} />
                                    <DetailItem label="Home Phone" value={order.homePhone} />
                                    <DetailItem label="Home Address" value={order.borrowerHomeAddr} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Photos Tab */}
                <div key="photos" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {order.attachments.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                            {order.attachments.map((file: any) => (
                                <div key={file.id} className="card photo-card" style={{ padding: 8, position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                                        <img src={file.url} alt={file.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{file.filename}</span>
                                        <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{(file.size! / 1024).toFixed(0)}KB</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', padding: '2px 4px' }}>
                                        {new Date(file.createdAt).toLocaleDateString()}
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
                                            <td>
                                                <span style={{
                                                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                                                    color: entry.action.includes('Created') ? 'var(--brand-primary-light)' :
                                                           entry.action.includes('Completed') || entry.action.includes('Approved') ? 'var(--status-success)' :
                                                           entry.action.includes('Cancelled') ? 'var(--status-danger)' : 'var(--text-primary)'
                                                }}>
                                                    {entry.action}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 13 }}>{entry.details || '---'}</td>
                                            <td>{entry.user || 'System'}</td>
                                            <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>
                                                {new Date(entry.createdAt).toLocaleString()}
                                            </td>
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

function FlagItem({ label, value, active }: { label: string; value: string; active: boolean }) {
    return (
        <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: active ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${active ? 'rgba(99, 102, 241, 0.2)' : 'var(--border-subtle)'}`,
        }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--brand-primary-light)' : 'var(--text-secondary)' }}>{value}</div>
        </div>
    );
}

function PersonCard({ role, icon, name, subtitle }: { role: string; icon: React.ReactNode; name?: string | null; subtitle?: string | null }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)',
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: name ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: name ? 'var(--brand-primary-light)' : 'var(--text-tertiary)',
            }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 2 }}>{role}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: name ? 'var(--text-primary)' : 'var(--text-tertiary)', fontStyle: name ? 'normal' : 'italic' }}>
                    {name || 'Not assigned'}
                </div>
                {subtitle && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1, fontFamily: 'monospace' }}>{subtitle}</div>}
            </div>
        </div>
    );
}

function TimelineItem({ label, date, isImportant, icon, isOverdue, isLast }: {
    label: string; date?: Date | null; isImportant?: boolean; icon?: React.ReactNode; isOverdue?: boolean; isLast?: boolean;
}) {
    const hasDate = !!date;
    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative',
            paddingBottom: isLast ? 0 : 16,
        }}>
            {!isLast && (
                <div style={{
                    position: 'absolute', left: 11, top: 24, bottom: 0, width: 1,
                    background: 'var(--border-subtle)',
                }} />
            )}
            <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: hasDate ? (isOverdue ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)') : 'rgba(255, 255, 255, 0.05)',
                color: hasDate ? (isOverdue ? 'var(--status-danger)' : 'var(--brand-primary-light)') : 'var(--text-tertiary)',
            }}>
                {icon || <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 22 }}>
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{label}</span>
                <span style={{
                    fontSize: 12, fontFamily: 'monospace',
                    color: isOverdue ? 'var(--status-danger)' : isImportant ? 'var(--brand-primary-light)' : 'var(--text-secondary)',
                    fontWeight: isImportant ? 600 : 400,
                }}>
                    {date ? new Date(date).toLocaleDateString() : '---'}
                </span>
            </div>
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
