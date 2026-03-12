import prisma from '@/lib/prisma';

/**
 * Find the best inspector for a given zip code based on zip assignments.
 * Returns the inspector ID if found, null otherwise.
 *
 * Selection logic:
 * 1. Find all active inspectors assigned to this zip
 * 2. Sort by priority (highest first)
 * 3. Among equal priority, pick the one with fewest open orders (load balancing)
 */
export async function findInspectorForZip(zip: string): Promise<string | null> {
    if (!zip?.trim()) return null;

    const assignments = await prisma.zipAssignment.findMany({
        where: { zip: zip.trim() },
        include: {
            inspector: {
                select: {
                    id: true,
                    active: true,
                    _count: {
                        select: {
                            assignedOrders: {
                                where: { status: { in: ['Open', 'Unassigned'] } },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { priority: 'desc' },
    });

    // Filter to active inspectors only
    const candidates = assignments.filter(a => a.inspector.active);

    if (candidates.length === 0) return null;

    // Group by priority — take the highest priority tier
    const topPriority = candidates[0].priority;
    const topCandidates = candidates.filter(a => a.priority === topPriority);

    if (topCandidates.length === 1) {
        return topCandidates[0].inspectorId;
    }

    // Load balance: pick inspector with fewest open orders
    topCandidates.sort((a, b) =>
        (a.inspector._count?.assignedOrders || 0) - (b.inspector._count?.assignedOrders || 0)
    );

    return topCandidates[0].inspectorId;
}
