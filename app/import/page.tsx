'use client';

import { useState, useRef } from 'react';
import { importOrdersCSV } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertTriangle, Download, Info } from 'lucide-react';

export default function ImportPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean, imported?: number, failed?: number, error?: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave() {
        setIsDragging(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setResult(null);
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    }

    async function handleUpload() {
        if (!file || isUploading) return;

        setIsUploading(true);
        setResult(null);
        const formData = new FormData();
        formData.append('file', file);

        const res = await importOrdersCSV(formData);

        setResult(res);
        setIsUploading(false);
        if (res.success) {
            toast.success(`Successfully imported ${res.imported} orders`);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            router.refresh();
        } else {
            toast.error(res.error || 'Failed to import CSV');
        }
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Import Data</h1>
                    <p className="page-subtitle">Batch create work orders using CSV files.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary"><Download size={16} /> Download Template</button>
                </div>
            </header>

            <div className="grid-sidebar-right">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Drop Zone */}
                    <div
                        className="card photo-drop-zone"
                        style={{
                            border: isDragging ? '2px dashed var(--brand-primary-light)' : '2px dashed var(--border-subtle)',
                            background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-surface)',
                            transition: 'all 0.2s'
                        }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div style={{
                            width: 64, height: 64, borderRadius: 16,
                            background: 'rgba(99, 102, 241, 0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px', color: 'var(--brand-primary-light)'
                        }}>
                            <Upload size={28} />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Upload CSV File</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
                            Drag and drop your spreadsheet here, or click to select from your files.
                        </p>

                        <input
                            type="file"
                            id="csv-input"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                            accept=".csv,text/csv"
                            disabled={isUploading}
                        />
                        <label htmlFor="csv-input" className={`btn btn-primary ${isUploading ? '' : ''}`} style={{ cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.5 : 1 }}>
                            <FileSpreadsheet size={16} /> Select File
                        </label>

                        {file && (
                            <div style={{
                                marginTop: 24, padding: '12px 16px',
                                background: 'rgba(99, 102, 241, 0.06)', border: '1px solid var(--border-subtle)',
                                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <FileSpreadsheet size={18} style={{ color: 'var(--brand-primary-light)' }} />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{file.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{(file.size / 1024).toFixed(1)} KB</div>
                                    </div>
                                </div>
                                <button
                                    className="btn-icon"
                                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                    disabled={isUploading}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {file && (
                            <div style={{ marginTop: 16 }}>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Processing Import...' : 'Start Import'}
                                </button>
                            </div>
                        )}

                        {result && (
                            <div style={{
                                marginTop: 24, padding: 16, borderRadius: 10, textAlign: 'left',
                                background: result.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                border: `1px solid ${result.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                            }}>
                                {result.success ? (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <CheckCircle size={18} style={{ color: 'var(--status-success)', marginTop: 1 }} />
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--status-success)', marginBottom: 4 }}>Import Completed Successfully!</div>
                                            <div style={{ fontSize: 13 }}>
                                                {result.imported} orders imported. {result.failed! > 0 && <span style={{ color: 'var(--status-warning)' }}>{result.failed} failed.</span>}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <AlertTriangle size={18} style={{ color: 'var(--status-danger)', marginTop: 1 }} />
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--status-danger)', marginBottom: 4 }}>Import Failed</div>
                                            <div style={{ fontSize: 13 }}>{result.error}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* CSV Format Guide */}
                <div className="card" style={{ padding: 24, alignSelf: 'flex-start' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Info size={16} /> CSV Format Guide
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16, lineHeight: 1.5 }}>
                        Your CSV file must include headers in the first row. The system maps the following columns:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { col: 'OrderNumber', desc: 'Optional. Auto-generated if blank.' },
                            { col: 'Address1, City, State, Zip', desc: 'Required property details.' },
                            { col: 'ClientCode', desc: 'Matches existing Client (e.g., SGP).' },
                            { col: 'DueDate', desc: 'Format: YYYY-MM-DD.' },
                            { col: 'ClientPay, InspectorPay', desc: 'Numeric values (e.g., 55.00).' },
                            { col: 'Instructions', desc: 'Text field for order instructions.' },
                        ].map((item) => (
                            <div key={item.col}>
                                <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--brand-primary-light)', marginBottom: 2 }}>{item.col}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
