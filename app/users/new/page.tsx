import Link from 'next/link';
import { createUser } from '@/lib/mgmt-actions';

export default function NewUserPage() {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Add New User</h1>
                    <p className="page-subtitle">Create a new system user or inspector profile.</p>
                </div>
                <div className="header-actions">
                    <Link href="/users" className="btn btn-secondary mr-2">Cancel</Link>
                    <button type="submit" form="new-user-form" className="btn btn-primary">Create User</button>
                </div>
            </header>

            <div className="max-w-2xl">
                <form id="new-user-form" action={createUser} className="card glass p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">First Name</label>
                            <input type="text" name="firstName" className="form-control" placeholder="John" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Last Name</label>
                            <input type="text" name="lastName" className="form-control" placeholder="Doe" required />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-muted">Email Address</label>
                        <input type="email" name="email" className="form-control" placeholder="john.doe@example.com" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Username</label>
                            <input type="text" name="username" className="form-control" placeholder="jdoe" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase text-muted">Role</label>
                            <select name="role" className="form-control" required>
                                <option value="inspector">Inspector</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Administrator</option>
                                <option value="client">Client User</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-muted">Phone Number</label>
                        <input type="tel" name="phone" className="form-control" placeholder="555-0000" />
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <Link href="/users" className="btn btn-secondary">Cancel</Link>
                        <button type="submit" className="btn btn-primary px-8">Create User</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
