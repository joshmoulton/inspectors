'use client';

import { useState, useEffect } from 'react';
import { Settings, Bell, Database, Globe, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import ConfirmDialog from '@/components/ConfirmDialog';
import { clearTestData } from '@/lib/actions';

const DEFAULT_SETTINGS = {
    companyName: 'Powerade Inspections',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    defaultType: 'Standard',
    autoAssign: false,
    autoApprove: false,
    emailNotifications: true,
    notificationEmail: 'admin@powerade.io',
};

function loadLocalSettings() {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
        const saved = localStorage.getItem('powerade-settings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
}

function parseSettingsFromApi(data: Record<string, string>) {
    const result = { ...DEFAULT_SETTINGS };
    for (const [key, value] of Object.entries(data)) {
        if (key in result) {
            const defaultVal = (result as any)[key];
            if (typeof defaultVal === 'boolean') {
                (result as any)[key] = value === 'true';
            } else {
                (result as any)[key] = value;
            }
        }
    }
    return result;
}

export default function UtilitiesPage() {
    const [settings, setSettings] = useState(loadLocalSettings);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load from API on mount (overrides localStorage)
    useEffect(() => {
        fetch('/api/settings')
            .then(r => r.json())
            .then(data => {
                if (data && Object.keys(data).length > 0) {
                    const merged = parseSettingsFromApi(data);
                    setSettings(merged);
                    localStorage.setItem('powerade-settings', JSON.stringify(merged));
                }
            })
            .catch(() => { /* fall back to localStorage */ });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            // Save to API (primary) and localStorage (cache)
            const apiData: Record<string, string> = {};
            for (const [key, value] of Object.entries(settings)) {
                apiData[key] = String(value);
            }
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData),
            });
            if (!res.ok) throw new Error('API save failed');
            localStorage.setItem('powerade-settings', JSON.stringify(settings));
            setDirty(false);
            toast.success('Settings saved successfully');
        } catch {
            // Fallback to localStorage only
            localStorage.setItem('powerade-settings', JSON.stringify(settings));
            setDirty(false);
            toast.success('Settings saved locally');
        } finally {
            setSaving(false);
        }
    }

    function updateSetting(key: string, value: any) {
        setSettings((prev: typeof DEFAULT_SETTINGS) => ({ ...prev, [key]: value }));
        setDirty(true);
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Settings & Utilities</h1>
                    <p className="page-subtitle">Configure system preferences and manage application settings.</p>
                </div>
                <div className="header-actions">
                    <button className={`btn ${dirty ? 'btn-primary' : 'btn-secondary'}`} onClick={handleSave} disabled={!dirty || saving}>
                        {saving ? <><Loader2 size={14} className="spin" /> Saving...</> : <><Save size={16} /> {dirty ? 'Save Changes' : 'Saved'}</>}
                    </button>
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
                                <div className="setting-label">Auto-assign Inspector by Zip Zone</div>
                                <div className="setting-description">
                                    Automatically assign inspectors based on <a href="/zip-zones" style={{ color: 'var(--brand-primary-light)' }}>zip zone assignments</a>. Higher-priority inspectors are preferred; ties are broken by workload.
                                </div>
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
                    <DataManagement />
                </div>
            </form>
        </div>
    );
}

function DataManagement() {
    const [exporting, setExporting] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    async function handleExport() {
        setExporting(true);
        try {
            const res = await fetch('/api/export');
            if (!res.ok) throw new Error('Export failed');
            const data = await res.json();

            const rows = data.orders.map((o: any) => ({
                OrderNumber: o.orderNumber,
                Type: o.type,
                Status: o.status,
                WorkCode: o.workCode || '',
                Address1: o.address1 || '',
                Address2: o.address2 || '',
                City: o.city || '',
                State: o.state || '',
                Zip: o.zip || '',
                County: o.county || '',
                Client: o.client?.name || '',
                ClientCode: o.client?.code || '',
                Inspector: o.inspector ? `${o.inspector.firstName} ${o.inspector.lastName}` : '',
                DueDate: o.dueDate || '',
                OrderedDate: o.orderedDate || '',
                CompletedDate: o.completedDate || '',
                ClientPay: o.clientPay || 0,
                InspectorPay: o.inspectorPay || 0,
                LoanNumber: o.loanNumber || '',
                MortgageCompany: o.mortgageCompany || '',
            }));

            const csv = Papa.unparse(rows);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `powerade_export_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Exported ${data.total.toLocaleString()} orders as CSV`);
        } catch {
            toast.error('Failed to export data');
        } finally {
            setExporting(false);
        }
    }

    async function handleClear() {
        const result = await clearTestData();
        setShowClearConfirm(false);
        if (result.success) {
            toast.success('All test data has been cleared');
        } else {
            toast.error(result.error || 'Failed to clear data');
        }
    }

    return (
        <>
            <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" className="btn btn-secondary" onClick={handleExport} disabled={exporting}>
                        {exporting ? <><Loader2 size={14} className="spin" /> Exporting...</> : 'Export All Data'}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => setShowClearConfirm(true)}>
                        Clear Test Data
                    </button>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12 }}>
                    Export downloads all orders as CSV. Clear test data removes all orders, comments, and history (admin only).
                </p>
            </div>
            <ConfirmDialog
                isOpen={showClearConfirm}
                title="Clear All Test Data"
                description="This will permanently delete ALL orders, comments, history entries, and attachments. This action cannot be undone. Are you absolutely sure?"
                confirmLabel="Delete Everything"
                variant="danger"
                onConfirm={handleClear}
                onCancel={() => setShowClearConfirm(false)}
            />
        </>
    );
}
