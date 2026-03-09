import prisma from '@/lib/prisma';
import Link from 'next/link';
import OrderTable from '@/components/OrderTable';

export default async function OrdersPage({ searchParams }: { searchParams: { q?: string; page?: string; status?: string; sort?: string; dir?: string } }) {
    const params = await searchParams;

    const inspectors = await prisma.user.findMany({
        where: { role: 'inspector' },
        orderBy: { firstName: 'asc' },
        select: { id: true, firstName: true, lastName: true },
    });

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Orders</h1>
                    <p className="page-subtitle">Manage and track all property inspections.</p>
                </div>
                <div className="header-actions">
                    <Link href="/orders/new" className="btn btn-primary">New Order</Link>
                </div>
            </header>

            <OrderTable
                inspectors={inspectors}
                initialSearch={params.q || ''}
                initialPage={parseInt(params.page || '1')}
                initialStatus={params.status || 'All'}
                initialSort={params.sort || 'orderNumber'}
                initialDir={(params.dir as 'asc' | 'desc') || 'desc'}
            />
        </div>
    );
}
