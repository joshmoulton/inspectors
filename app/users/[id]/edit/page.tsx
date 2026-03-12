import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateUser } from '@/lib/mgmt-actions';
import SubmitButton from '@/components/SubmitButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import { UserCog } from 'lucide-react';

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return notFound();

    const updateUserWithId = updateUser.bind(null, id);

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Edit User</h1>
                    <p className="page-subtitle">Update profile for {user.firstName} {user.lastName}.</p>
                </div>
                <div className="header-actions">
                    <Link href={`/users/${id}`} className="btn btn-secondary">Cancel</Link>
                    <SubmitButton form="edit-user-form">Save Changes</SubmitButton>
                </div>
            </header>

            <Breadcrumbs items={[
                { label: 'Users', href: '/users' },
                { label: `${user.firstName} ${user.lastName}`, href: `/users/${id}` },
                { label: 'Edit' },
            ]} />

            <form id="edit-user-form" action={updateUserWithId} className="form-page" style={{ maxWidth: 640 }}>
                <section className="form-card">
                    <h2 className="form-card-title">
                        <UserCog size={18} className="form-card-icon" />
                        User Details
                    </h2>

                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">First Name <span className="required">*</span></label>
                            <input type="text" name="firstName" className="form-control" defaultValue={user.firstName} required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Last Name <span className="required">*</span></label>
                            <input type="text" name="lastName" className="form-control" defaultValue={user.lastName} required />
                        </div>
                    </div>

                    <div className="form-row cols-1">
                        <div className="form-field">
                            <label className="form-label">Email Address</label>
                            <input type="email" name="email" className="form-control" defaultValue={user.email || ''} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Role <span className="required">*</span></label>
                            <select name="role" className="form-control" defaultValue={user.role} required>
                                <option value="inspector">Inspector</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Administrator</option>
                                <option value="client">Client User</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Status</label>
                            <select name="active" className="form-control" defaultValue={user.active ? 'true' : 'false'}>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row cols-1">
                        <div className="form-field">
                            <label className="form-label">Phone Number</label>
                            <input type="tel" name="phone" className="form-control" defaultValue={user.phone || ''} />
                        </div>
                    </div>

                    <div style={{ padding: '12px 0', fontSize: 12, color: 'var(--text-tertiary)' }}>
                        Username: <strong style={{ fontFamily: 'monospace' }}>{user.username}</strong> (cannot be changed)
                    </div>

                    <div className="form-actions">
                        <Link href={`/users/${id}`} className="btn btn-secondary">Cancel</Link>
                        <SubmitButton>Save Changes</SubmitButton>
                    </div>
                </section>
            </form>
        </div>
    );
}
