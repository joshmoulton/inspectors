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
            <div className="tab-bar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="tab-indicator"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                        <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>
                            {tab.label}
                            {tab.count !== undefined && <span className="tab-count" style={{ marginLeft: 4 }}>({tab.count})</span>}
                        </span>
                    </button>
                ))}
            </div>

            <div className="tab-content" style={{ position: 'relative' }}>
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
