import prisma from '@/lib/prisma';
import RoutesClient from './RoutesClient';

export default async function RoutesPage() {
    let inspectors: any[] = [];
    let orderLocations: any[] = [];

    try {
        inspectors = await prisma.user.findMany({
            where: { role: 'inspector' },
            include: {
                assignedOrders: {
                    where: { status: 'Open' },
                    select: {
                        id: true, orderNumber: true, address1: true, city: true, state: true,
                        latitude: true, longitude: true, dueDate: true, workCode: true,
                        client: { select: { name: true, code: true } },
                    },
                },
            },
            orderBy: { firstName: 'asc' },
        });

        // Get all open orders with coordinates for map
        orderLocations = await prisma.workOrder.findMany({
            where: {
                status: 'Open',
                latitude: { not: null },
                longitude: { not: null },
            },
            select: {
                id: true, orderNumber: true, address1: true, city: true, state: true,
                latitude: true, longitude: true, dueDate: true, inspectorId: true,
                inspector: { select: { firstName: true, lastName: true } },
                client: { select: { name: true, code: true } },
            },
            take: 500,
        });
    } catch (e) {
        console.error('Routes page error:', e);
    }

    const serializedInspectors = inspectors.map(i => ({
        id: i.id,
        firstName: i.firstName,
        lastName: i.lastName,
        phone: i.phone,
        orders: i.assignedOrders.map((o: any) => ({
            ...o,
            dueDate: o.dueDate?.toISOString() || null,
        })),
    }));

    const serializedLocations = orderLocations.map(o => ({
        ...o,
        dueDate: o.dueDate?.toISOString() || null,
    }));

    return (
        <RoutesClient
            inspectors={serializedInspectors}
            orderLocations={serializedLocations}
        />
    );
}
