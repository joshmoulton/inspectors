'use client';

import { useState, useRef } from 'react';
import { importOrdersCSV } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
            setFile(null); // Clear on success
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
                    <button className="btn btn-secondary">Download Template</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                <div className="lg:col-span-2 space-y-6">
                    <div
                        className={`card glass p-12 text-center border-dashed border-2 transition-all duration-300 ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-white/10 hover:border-white/20'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="mb-4 text-5xl">📄</div>
                        <h3 className="text-xl font-bold mb-2">Upload CSV File</h3>
                        <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
                            Drag and drop your spreadsheet here, or click to select from your files.
                        </p>

                        <input
                            type="file"
                            id="csv-input"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                            accept=".csv,text/csv"
                            disabled={isUploading}
                        />
                        <label htmlFor="csv-input" className={`btn btn-primary cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            Select File
                        </label>

                        {file && (
                            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between text-left">
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-primary">{file.name}</span>
                                    <span className="text-xs text-muted font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                                <button
                                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                    className="text-white hover:text-danger p-2"
                                    disabled={isUploading}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {file && (
                            <div className="mt-6">
                                <button
                                    className="btn btn-primary w-full"
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Processing Import...' : 'Start Import'}
                                </button>
                            </div>
                        )}

                        {result && (
                            <div className={`mt-6 p-4 rounded-lg text-left ${result.success ? 'bg-success/10 border-success/30' : 'bg-danger/10 border-danger/30'} border`}>
                                {result.success ? (
                                    <>
                                        <p className="text-success font-bold mb-1">Import Completed Successfully!</p>
                                        <p className="text-sm text-white/80">
                                            {result.imported} orders imported. {result.failed! > 0 && <span className="text-warning">{result.failed} failed.</span>}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-danger font-bold mb-1">Import Failed</p>
                                        <p className="text-sm text-white/80">{result.error}</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card glass p-6">
                        <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-2">CSV Format Guide</h3>
                        <p className="text-sm text-muted mb-4">Your CSV file must include headers in the first row. The system maps the following columns:</p>

                        <ul className="space-y-3 text-sm text-white/80">
                            <li className="flex flex-col"><span className="font-mono text-primary text-xs">OrderNumber</span> <span className="text-muted text-xs">Optional. Auto-generated if blank.</span></li>
                            <li className="flex flex-col"><span className="font-mono text-primary text-xs">Address1, City, State, Zip</span> <span className="text-muted text-xs">Required property details.</span></li>
                            <li className="flex flex-col"><span className="font-mono text-primary text-xs">ClientCode</span> <span className="text-muted text-xs">Matches existing Client (e.g., SGP).</span></li>
                            <li className="flex flex-col"><span className="font-mono text-primary text-xs">DueDate</span> <span className="text-muted text-xs">Format: YYYY-MM-DD.</span></li>
                            <li className="flex flex-col"><span className="font-mono text-primary text-xs">ClientPay, InspectorPay</span> <span className="text-muted text-xs">Numeric values (e.g., 55.00).</span></li>
                            <li className="flex flex-col"><span className="font-mono text-primary text-xs">Instructions</span> <span className="text-muted text-xs">Text field for order instructions.</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
