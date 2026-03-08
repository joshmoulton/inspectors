import prisma from '@/lib/prisma';
import Link from 'next/link';
import OrderTable from '@/components/OrderTable';

export default async function OrdersPage() {
    const orders = await prisma.workOrder.findMany({
        include: {
            client: true,
            inspector: true,
        },
        orderBy: {
            orderNumber: 'desc',
        },
    });

    // Convert dates to strings for client component serializability
    const serializedOrders = orders.map(order => ({
        ...order,
        dueDate: order.dueDate ? order.dueDate.toISOString() : null,
        orderedDate: order.orderedDate ? order.orderedDate.toISOString() : null,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
    }));

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Orders</h1>
                    <p className="page-subtitle">Manage and track all property inspections.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary mr-2">Export CSV</button>
                    <Link href="/orders/new" className="btn btn-primary">New Order</Link>
                </div>
            </header>

            <OrderTable initialOrders={serializedOrders} />
        </div>
    );
}
