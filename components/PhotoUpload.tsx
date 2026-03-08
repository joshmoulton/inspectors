'use client';

import { useState, useCallback } from 'react';
import { uploadPhotos } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'; // Keep useRouter for router.refresh()

export default function PhotoUpload({ orderId }: { orderId: string }) {
    const [isDragging, setIsDragging] = useState(false); // Keep isDragging state as it's used in JSX
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter(); // Keep useRouter for router.refresh()

    // Handlers for drag and drop
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

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0 || isUploading) return;

        setIsUploading(true);

        const formData = new FormData();
        // The original `uploadPhotos` action likely expects `orderId` as a separate argument,
        // not appended to formData. Assuming the action signature remains `uploadPhotos(orderId, formData)`.
        files.forEach(file => formData.append('photos', file));

        try {
            const result = await uploadPhotos(orderId, formData); // Pass orderId as first argument

            if (result.success) { // Check for result.success as in original code
                setFiles([]);
                toast.success(`Successfully uploaded ${result.count || files.length} photos`); // Use result.count if available, else files.length
                router.refresh(); // Keep router.refresh()
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
        <div className="space-y-6">
            <div
                className={`card glass p-12 text-center border-dashed border-2 transition-all duration-300 ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-white/10 hover:border-white/20'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div style={{ marginBottom: 16, color: 'var(--brand-primary-light)', opacity: 0.5 }}><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></div>
                <h3 className="text-xl font-bold mb-2">Upload Inspection Photos</h3>
                <p className="text-muted text-sm mb-6 max-w-xs mx-auto">
                    Drag and drop your property photos here, or click to browse files.
                </p>
                <input
                    type="file"
                    id="photo-input"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*"
                    disabled={isUploading}
                />
                <label htmlFor="photo-input" className={`btn btn-primary cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploading ? 'Processing...' : 'Select Photos'}
                </label>
            </div>

            {files.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-in fade-in slide-in-from-bottom-4">
                    {files.map((file: File, i: number) => (
                        <div key={i} className="group relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                            <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => setFiles((prev: File[]) => prev.filter((_: File, idx: number) => idx !== i))}
                                    className="text-xs font-bold text-danger hover:underline"
                                    disabled={isUploading}
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono text-white/50">
                                {(file.size / 1024).toFixed(0)}KB
                            </div>
                        </div>
                    ))}
                    {!isUploading && (
                        <button
                            className="aspect-square flex flex-col items-center justify-center rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
                            onClick={() => document.getElementById('photo-input')?.click()}
                        >
                            <span className="text-2xl text-muted">+</span>
                            <span className="text-[10px] text-muted font-bold uppercase">Add More</span>
                        </button>
                    )}
                </div>
            )}

            {files.length > 0 && (
                <div className="flex justify-end pt-4">
                    <button
                        className="btn btn-primary px-12"
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : `Upload ${files.length} Photos`}
                    </button>
                </div>
            )}
        </div>
    );
}
