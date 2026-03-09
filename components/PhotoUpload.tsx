'use client';

import { useState, useRef } from 'react';
import { Upload, X, Camera, Loader2, ZoomIn } from 'lucide-react';
import { uploadPhotos } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PhotoUploadProps {
    orderId: string;
}

export default function PhotoUpload({ orderId }: PhotoUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    function handleFiles(newFiles: File[]) {
        const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length !== newFiles.length) {
            toast.error('Only image files are accepted');
        }
        if (imageFiles.length === 0) return;

        setFiles(prev => [...prev, ...imageFiles]);
        for (const file of imageFiles) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragActive(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    }

    function removeFile(index: number) {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    }

    async function handleUpload() {
        if (files.length === 0) return;
        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        files.forEach(file => formData.append('photos', file));

        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 15, 90));
        }, 300);

        try {
            const result = await uploadPhotos(orderId, formData);
            clearInterval(interval);
            setProgress(100);

            if (result.success) {
                toast.success(`${result.count} photo${result.count !== 1 ? 's' : ''} uploaded successfully`);
                setFiles([]);
                setPreviews([]);
                router.refresh();
            } else {
                toast.error(result.error || 'Upload failed');
            }
        } catch {
            clearInterval(interval);
            toast.error('Failed to upload photos');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Camera size={18} style={{ color: 'var(--brand-primary-light)' }} /> Upload Inspection Photos
                </h3>
                {files.length > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {files.length} file{files.length !== 1 ? 's' : ''} ({(totalSize / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                )}
            </div>

            {/* Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                    border: `2px dashed ${dragActive ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                    borderRadius: 12, padding: files.length > 0 ? 20 : 48,
                    textAlign: 'center', cursor: 'pointer',
                    background: dragActive ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 200ms ease',
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                    style={{ display: 'none' }}
                />
                {files.length === 0 ? (
                    <>
                        <div style={{
                            width: 56, height: 56, borderRadius: 14,
                            background: 'rgba(99, 102, 241, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px', color: 'var(--brand-primary-light)',
                        }}>
                            <Upload size={24} />
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                            Drag & drop photos here
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                            or click to browse (JPEG, PNG, HEIC)
                        </div>
                    </>
                ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <Upload size={14} /> Click or drop to add more photos
                    </div>
                )}
            </div>

            {/* Preview Grid */}
            {previews.length > 0 && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 12, marginTop: 16,
                }}>
                    {previews.map((preview, i) => (
                        <div key={i} style={{
                            position: 'relative', borderRadius: 10, overflow: 'hidden',
                            border: '1px solid var(--border-subtle)',
                        }}>
                            <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
                                <img src={preview} alt={files[i]?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{
                                position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.7))',
                                display: 'flex', alignItems: 'flex-end', padding: 8,
                            }}>
                                <span style={{ fontSize: 10, color: 'white', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                    {files[i]?.name}
                                </span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                style={{
                                    position: 'absolute', top: 6, right: 6,
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.6)', border: 'none',
                                    color: 'white', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <X size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                                style={{
                                    position: 'absolute', top: 6, left: 6,
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.6)', border: 'none',
                                    color: 'white', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <ZoomIn size={12} />
                            </button>
                            <div style={{
                                position: 'absolute', bottom: 6, right: 6,
                                fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)',
                                background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: 4,
                            }}>
                                {(files[i]?.size / 1024).toFixed(0)}KB
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Progress Bar */}
            {uploading && (
                <div style={{ marginTop: 16 }}>
                    <div style={{
                        height: 4, width: '100%', background: 'rgba(255,255,255,0.06)',
                        borderRadius: 2, overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%', background: 'var(--brand-primary)',
                            borderRadius: 2, width: `${progress}%`,
                            transition: 'width 300ms ease',
                        }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, textAlign: 'center' }}>
                        Uploading... {progress}%
                    </div>
                </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => { setFiles([]); setPreviews([]); }}
                        disabled={uploading}
                    >
                        Clear All
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <><Loader2 size={14} className="spin" /> Uploading...</>
                        ) : (
                            <><Upload size={14} /> Upload {files.length} Photo{files.length !== 1 ? 's' : ''}</>
                        )}
                    </button>
                </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="modal-overlay"
                    onClick={() => setLightboxIndex(null)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
                        <img
                            src={previews[lightboxIndex]}
                            alt={files[lightboxIndex]?.name}
                            style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 12 }}
                        />
                        <button
                            onClick={() => setLightboxIndex(null)}
                            style={{
                                position: 'absolute', top: -12, right: -12,
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                                color: 'var(--text-primary)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
