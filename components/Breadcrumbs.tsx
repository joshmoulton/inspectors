import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav className="breadcrumbs">
            <Link href="/" className="breadcrumb-link">
                <Home size={14} />
            </Link>
            {items.map((item, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="breadcrumb-separator"><ChevronRight size={14} /></span>
                    {item.href && i < items.length - 1 ? (
                        <Link href={item.href} className="breadcrumb-link">{item.label}</Link>
                    ) : (
                        <span className="breadcrumb-current">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
