import prisma from '@/lib/prisma';
import ZipZonesClient from './ZipZonesClient';

export default async function ZipZonesPage() {
    const [inspectors, assignments] = await Promise.all([
        prisma.user.findMany({
            where: { role: 'inspector', active: true },
            orderBy: { firstName: 'asc' },
            select: { id: true, firstName: true, lastName: true },
        }),
        prisma.zipAssignment.findMany({
            include: {
                inspector: { select: { id: true, firstName: true, lastName: true, active: true } },
            },
            orderBy: [{ zip: 'asc' }, { priority: 'desc' }],
        }),
    ]);

    const serialized = assignments.map(a => ({
        id: a.id,
        zip: a.zip,
        inspectorId: a.inspectorId,
        inspectorName: `${a.inspector.firstName} ${a.inspector.lastName}`,
        inspectorActive: a.inspector.active,
        priority: a.priority,
    }));

    return (
        <ZipZonesClient
            inspectors={inspectors.map(i => ({ id: i.id, name: `${i.firstName} ${i.lastName}` }))}
            initialAssignments={serialized}
        />
    );
}
