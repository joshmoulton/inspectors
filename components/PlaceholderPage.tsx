import Link from 'next/link';

export default function PlaceholderPage({ title, description }: { title: string, description: string }) {
    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle">{description}</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary">Action</button>
                </div>
            </header>

            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02] p-12 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl mb-6">
                    ✨
                </div>
                <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
                <p className="text-muted max-w-md mx-auto mb-8">
                    The {title} module is currently being optimized for the best performance and UI experience.
                    Check back soon for advanced {title.toLowerCase()} capabilities.
                </p>
                <Link href="/" className="btn btn-secondary">Back to Dashboard</Link>
            </div>
        </div>
    );
}

// Helper to generate pages
export function createPlaceholder(title: string, description: string) {
    return function Page() {
        return <PlaceholderPage title={title} description={description} />;
    };
}
