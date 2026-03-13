import Link from 'next/link';
import { createUser } from '@/lib/mgmt-actions';
import SubmitButton from '@/components/SubmitButton';
import ActionForm from '@/components/ActionForm';
import FormField from '@/components/FormField';
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

            <ActionForm id="new-user-form" action={createUser} className="form-page" >
                <section className="form-card" style={{ maxWidth: 640 }}>
                    <h2 className="form-card-title">
                        <UserPlus size={18} className="form-card-icon" />
                        User Details
                    </h2>

                    <div className="form-row">
                        <FormField label="First Name" name="firstName" required>
                            <input type="text" name="firstName" className="form-control" placeholder="John" required />
                        </FormField>
                        <FormField label="Last Name" name="lastName" required>
                            <input type="text" name="lastName" className="form-control" placeholder="Doe" required />
                        </FormField>
                    </div>

                    <div className="form-row cols-1">
                        <FormField label="Email Address" name="email" required>
                            <input type="email" name="email" className="form-control" placeholder="john.doe@example.com" required />
                        </FormField>
                    </div>

                    <div className="form-row">
                        <FormField label="Username" name="username" required>
                            <input type="text" name="username" className="form-control" placeholder="jdoe" required />
                        </FormField>
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
            </ActionForm>
        </div>
    );
}
