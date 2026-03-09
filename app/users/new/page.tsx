import Link from 'next/link';
import { createUser } from '@/lib/mgmt-actions';
import SubmitButton from '@/components/SubmitButton';
import { UserPlus } from 'lucide-react';

export default function NewUserPage() {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Add New User</h1>
                    <p className="page-subtitle">Create a new system user or inspector profile.</p>
                </div>
                <div className="header-actions">
                    <Link href="/users" className="btn btn-secondary">Cancel</Link>
                    <SubmitButton form="new-user-form">Create User</SubmitButton>
                </div>
            </header>

            <form id="new-user-form" action={createUser} className="form-page" style={{ maxWidth: 640 }}>
                <section className="form-card">
                    <h2 className="form-card-title">
                        <UserPlus size={18} className="form-card-icon" />
                        User Details
                    </h2>

                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">First Name <span className="required">*</span></label>
                            <input type="text" name="firstName" className="form-control" placeholder="John" required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Last Name <span className="required">*</span></label>
                            <input type="text" name="lastName" className="form-control" placeholder="Doe" required />
                        </div>
                    </div>

                    <div className="form-row cols-1">
                        <div className="form-field">
                            <label className="form-label">Email Address <span className="required">*</span></label>
                            <input type="email" name="email" className="form-control" placeholder="john.doe@example.com" required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label className="form-label">Username <span className="required">*</span></label>
                            <input type="text" name="username" className="form-control" placeholder="jdoe" required />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Role <span className="required">*</span></label>
                            <select name="role" className="form-control" required>
                                <option value="inspector">Inspector</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Administrator</option>
                                <option value="client">Client User</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row cols-1">
                        <div className="form-field">
                            <label className="form-label">Phone Number</label>
                            <input type="tel" name="phone" className="form-control" placeholder="555-0000" />
                        </div>
                    </div>

                    <div className="form-actions">
                        <Link href="/users" className="btn btn-secondary">Cancel</Link>
                        <SubmitButton>Create User</SubmitButton>
                    </div>
                </section>
            </form>
        </div>
    );
}
