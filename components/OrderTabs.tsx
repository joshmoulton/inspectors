'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface OrderTabsProps {
    tabs: Tab[];
    children: React.ReactNode[];
}

export default function OrderTabs({ tabs, children }: OrderTabsProps) {
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    return (
        <>
            <div className="flex items-center gap-1 border-b border-white/10 mb-6 relative">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-6 py-3 text-sm font-semibold transition-colors duration-200 ${activeTab === tab.id
                                ? 'text-primary bg-primary/5'
                                : 'text-muted hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center">
                            {tab.label} {tab.count !== undefined && <span className="ml-1 opacity-60">({tab.count})</span>}
                        </span>
                    </button>
                ))}
            </div>

            <div className="tab-content relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children[tabs.findIndex(t => t.id === activeTab)]}
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    );
}
