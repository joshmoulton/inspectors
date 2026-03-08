'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface DropdownItem {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: 'danger';
    divider?: boolean;
}

interface DropdownMenuProps {
    trigger: ReactNode;
    items: DropdownItem[];
}

export default function DropdownMenu({ trigger, items }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="dropdown-wrapper" ref={ref}>
            <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
                {trigger}
            </div>
            {isOpen && (
                <div className="dropdown-menu">
                    {items.map((item, i) => {
                        if (item.divider) {
                            return <div key={i} className="dropdown-divider" />;
                        }
                        return (
                            <button
                                key={i}
                                className={`dropdown-item ${item.variant === 'danger' ? 'dropdown-item-danger' : ''}`}
                                onClick={() => {
                                    item.onClick?.();
                                    setIsOpen(false);
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
