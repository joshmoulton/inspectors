'use client';

import { useState, useCallback } from 'react';
import { uploadPhotos } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Camera, Upload, X } from 'lucide-react';

export default function PhotoUpload({ orderId }: { orderId: string }) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave() {
        setIsDragging(false);
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selected = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
            setFiles(prev => [...prev, ...selected]);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0 || isUploading) return;
        setIsUploading(true);

        const formData = new FormData();
        files.forEach(file => formData.append('photos', file));

        try {
            const result = await uploadPhotos(orderId, formData);
            if (result.success) {
                setFiles([]);
                toast.success(`Successfully uploaded ${result.count || files.length} photos`);
                router.refresh();
            } else {
                toast.error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error('An unexpected error occurred during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Drop Zone */}
            <div
                className="card"
                style={{
                    padding: 48, textAlign: 'center',
                    border: isDragging ? '2px dashed var(--brand-primary-light)' : '2px dashed var(--border-default)',
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
                    <Camera size={28} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Upload Inspection Photos</h3>
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.5 }}>
                    Drag and drop your property photos here, or click to browse files.
                </p>
                <input
                    type="file"
                    id="photo-input"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                    accept="image/*"
                    disabled={isUploading}
                />
                <label htmlFor="photo-input" className="btn btn-primary" style={{ cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.5 : 1 }}>
                    <Upload size={14} /> {isUploading ? 'Processing...' : 'Select Photos'}
                </label>
            </div>

            {/* Photo Grid */}
            {files.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 12
                }}>
                    {files.map((file: File, i: number) => (
                        <div key={i} style={{
                            position: 'relative', aspectRatio: '1', borderRadius: 'var(--radius-md)',
                            overflow: 'hidden', background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <button
                                onClick={() => setFiles((prev: File[]) => prev.filter((_: File, idx: number) => idx !== i))}
                                disabled={isUploading}
                                style={{
                                    position: 'absolute', top: 6, right: 6,
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.7)', border: 'none',
                                    color: 'white', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <X size={12} />
                            </button>
                            <div style={{
                                position: 'absolute', bottom: 4, right: 4,
                                padding: '2px 6px', borderRadius: 4,
                                background: 'rgba(0,0,0,0.75)', fontSize: 9,
                                fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)'
                            }}>
                                {(file.size / 1024).toFixed(0)}KB
                            </div>
                        </div>
                    ))}
                    {!isUploading && (
                        <button
                            onClick={() => document.getElementById('photo-input')?.click()}
                            style={{
                                aspectRatio: '1', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                borderRadius: 'var(--radius-md)',
                                border: '1px dashed var(--border-default)',
                                background: 'transparent', cursor: 'pointer',
                                color: 'var(--text-tertiary)', transition: 'all 0.15s'
                            }}
                        >
                            <span style={{ fontSize: 24, marginBottom: 4 }}>+</span>
                            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Add More</span>
                        </button>
                    )}
                </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        <Upload size={14} /> {isUploading ? 'Uploading...' : `Upload ${files.length} Photos`}
                    </button>
                </div>
            )}
        </div>
    );
}
