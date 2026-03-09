'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: 'dark' | 'light';
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'dark',
    resolvedTheme: 'dark',
    setTheme: () => {},
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [systemPreference, setSystemPreference] = useState<'dark' | 'light'>('dark');

    const resolvedTheme = theme === 'system' ? systemPreference : theme;

    useEffect(() => {
        const saved = localStorage.getItem('theme') as Theme | null;
        if (saved && ['dark', 'light', 'system'].includes(saved)) {
            setThemeState(saved);
        }

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemPreference(mq.matches ? 'dark' : 'light');

        function handleChange(e: MediaQueryListEvent) {
            setSystemPreference(e.matches ? 'dark' : 'light');
        }
        mq.addEventListener('change', handleChange);
        return () => mq.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
    }, [resolvedTheme]);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        localStorage.setItem('theme', t);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
