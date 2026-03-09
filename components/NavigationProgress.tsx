'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    const startProgress = useCallback(() => {
        setVisible(true);
        setProgress(0);
        // Quickly jump to ~70%, then slow down
        const t1 = setTimeout(() => setProgress(30), 50);
        const t2 = setTimeout(() => setProgress(60), 200);
        const t3 = setTimeout(() => setProgress(80), 500);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    const completeProgress = useCallback(() => {
        setProgress(100);
        const t = setTimeout(() => {
            setVisible(false);
            setProgress(0);
        }, 300);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        completeProgress();
    }, [pathname, searchParams, completeProgress]);

    // Listen for click events on links to start the progress bar
    useEffect(() => {
        let cleanup: (() => void) | undefined;

        function handleClick(e: MouseEvent) {
            const anchor = (e.target as HTMLElement).closest('a');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
            if (anchor.target === '_blank') return;
            // Only show progress for navigation to different pages
            if (href !== pathname) {
                cleanup = startProgress();
            }
        }

        document.addEventListener('click', handleClick, true);
        return () => {
            document.removeEventListener('click', handleClick, true);
            cleanup?.();
        };
    }, [pathname, startProgress]);

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                zIndex: 99999,
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-accent-light))',
                    boxShadow: '0 0 10px var(--brand-primary), 0 0 5px var(--brand-primary)',
                    transition: progress === 0 ? 'none' : progress === 100 ? 'width 0.2s ease-out' : 'width 0.4s ease-out',
                    borderRadius: '0 2px 2px 0',
                }}
            />
        </div>
    );
}
