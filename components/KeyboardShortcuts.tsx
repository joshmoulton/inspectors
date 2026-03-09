'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KeyboardShortcuts() {
    const router = useRouter();

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const mod = e.metaKey || e.ctrlKey;
            if (!mod) return;

            // Don't trigger inside input/textarea
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
                // Allow Cmd+K even in inputs to redirect focus
                if (e.key !== 'k') return;
            }

            if (e.key === 'k') {
                e.preventDefault();
                // Try to focus the sidebar search input first
                const searchInput = document.querySelector('.sidebar-search input') as HTMLInputElement;
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                } else {
                    router.push('/orders');
                }
            }

            if (e.key === 'n') {
                e.preventDefault();
                router.push('/orders/new');
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    return null;
}
