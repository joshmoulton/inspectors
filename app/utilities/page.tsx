'use client';

import { useState } from 'react';
import { Settings, Bell, Database, Globe, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function UtilitiesPage() {
    const [settings, setSettings] = useState({
        companyName: 'Powerade Inspections',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        defaultType: 'Standard',
        autoAssign: false,
        autoApprove: false,
        emailNotifications: true,
        notificationEmail: 'admin@powerade.io',
    });

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        toast.success('Settings saved successfully');
    }

    function updateSetting(key: string, value: any) {
        setSettings(prev => ({ ...prev, [key]: value }));
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Settings & Utilities</h1>
                    <p className="page-subtitle">Configure system preferences and manage application settings.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save Changes</button>
                </div>
            </header>

            <form onSubmit={handleSave} style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 32 }}>
                {/* General Settings */}
                <div className="settings-section">
                    <h2 className="settings-section-title"><Globe size={18} /> General Settings</h2>
                    <div className="card" style={{ padding: 0 }}>
                        <div className="setting-row" style={{ padding: '16px 24px' }}>
                            <div className="setting-info">
                                <div className="setting-label">Company Name</div>
                                <div className="setting-description">Display name used throughout the application</div>
                            </div>
                            <input type="text" className="form-control" style={{ maxWidth: 280 }} value={settings.companyName} onChange={e => updateSetting('companyName', e.target.value)} />
                        </div>
                        <div className="setting-row" style={{ padding: '16px 24px' }}>
                            <div className="setting-info">
                                <div className="setting-label">Timezone</div>
                                <div className="setting-description">Default timezone for dates and timestamps</div>
                            </div>
                            <select className="form-control" style={{ maxWidth: 280 }} value={settings.timezone} onChange={e => updateSetting('timezone', e.target.value)}>
                                <option value="America/New_York">Eastern (ET)</option>
                                <option value="America/Chicago">Central (CT)</option>
                                <option value="America/Denver">Mountain (MT)</option>
                                <option value="America/Los_Angeles">Pacific (PT)</option>
                            </select>
                        </div>
                        <div className="setting-row" style={{ padding: '16px 24px' }}>
                            <div className="setting-info">
                                <div className="setting-label">Date Format</div>
                                <div className="setting-description">How dates are displayed in the application</div>
                            </div>
                            <select className="form-control" style={{ maxWidth: 280 }} value={settings.dateFormat} onChange={e => updateSetting('dateFormat', e.target.value)}>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Order Defaults */}
                <div className="settings-section">
                    <h2 className="settings-section-title"><Settings size={18} /> Order Defaults</h2>
                    <div className="card" style={{ padding: 0 }}>
                        <div className="setting-row" style={{ padding: '16px 24px' }}>
                            <div className="setting-info">
                                <div className="setting-label">Default Inspection Type</div>
                                <div className="setting-description">Pre-selected type when creating new orders</div>
                            </div>
                            <select className="form-control" style={{ maxWidth: 280 }} value={settings.defaultType} onChange={e => updateSetting('defaultType', e.target.value)}>
                                <option>Standard</option>
                                <option>Interior</option>
                                <option>Contact</option>
                                <option>Residential</option>
                            </select>
                        </div>
                        <div className="setting-row" style={{ padding: '16px 24px' }}>
                            <div className="setting-info">
                                <div className="setting-label">Auto-assign Inspector</div>
                                <div className="setting-description">Automatically assign the nearest available inspector</div>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={settings.autoAssign} onChange={e => updateSetting('autoAssign', e.target.checked)} />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                        <div className="setting-row" style={{ padding: '16px 24px' }}>
                            <div className="setting-info">
                                <div className="setting-label">Auto-approve Completed Orders</div>
                                <div className="setting-description">Skip QC review and auto-approve when completed</div>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={settings.autoApprove} onChange={e => updateSetting('autoApprove', e.target.checked)} />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="settings-section">
                    <h2 className="settings-section-title"><Bell size={18} /> Notifications</h2>
                    <div className="card" style={{ padding: 0 }}>
                        <div className="setting-row" style={{ padding: '16px 24px' }}>
                            <div className="setting-info">
                                <div className="setting-label">Email Notifications</div>
                                <div className="setting-description">Receive email alerts for important events</div>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={settings.emailNotifications} onChange={e => updateSetting('emailNotifications', e.target.checked)} />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                        <div className="setting-row" style={{ padding: '16px 24px' }}>
                            <div className="setting-info">
                                <div className="setting-label">Notification Email</div>
                                <div className="setting-description">Email address for system notifications</div>
                            </div>
                            <input type="email" className="form-control" style={{ maxWidth: 280 }} value={settings.notificationEmail} onChange={e => updateSetting('notificationEmail', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div className="settings-section">
                    <h2 className="settings-section-title"><Database size={18} /> Data Management</h2>
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="button" className="btn btn-secondary" onClick={() => toast.success('Export started. Check your email for the download link.')}>Export All Data</button>
                            <button type="button" className="btn btn-danger" onClick={() => toast.error('This action is not available in the current environment.')}>Clear Test Data</button>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12 }}>
                            Export creates a ZIP archive of all orders, clients, users, and history. Clear test data removes all non-production records.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
