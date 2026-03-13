'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function SuccessToast({ message = 'Saved successfully' }: { message?: string }) {
    const searchParams = useSearchParams();
    const saved = searchParams.get('saved');

    useEffect(() => {
        if (saved === '1') {
            toast.success(message);
            // Clean up URL without triggering navigation
            const url = new URL(window.location.href);
            url.searchParams.delete('saved');
            window.history.replaceState({}, '', url.toString());
        }
    }, [saved, message]);

    return null;
}
