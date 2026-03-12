import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/zip-assignments/lookup?zip=30301
// Returns the best inspector match for a given zip code
export async function GET(request: NextRequest) {
    const zip = request.nextUrl.searchParams.get('zip')?.trim();
    if (!zip || !/^\d{5}$/.test(zip)) {
        return NextResponse.json({ inspector: null });
    }

    const assignments = await prisma.zipAssignment.findMany({
        where: { zip },
        include: {
            inspector: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
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

    const candidates = assignments.filter(a => a.inspector.active);
    if (candidates.length === 0) {
        return NextResponse.json({ inspector: null });
    }

    // Highest priority tier
    const topPriority = candidates[0].priority;
    const topCandidates = candidates.filter(a => a.priority === topPriority);

    // Load balance by fewest open orders
    topCandidates.sort((a, b) =>
        (a.inspector._count?.assignedOrders || 0) - (b.inspector._count?.assignedOrders || 0)
    );

    const best = topCandidates[0];
    return NextResponse.json({
        inspector: {
            id: best.inspectorId,
            name: `${best.inspector.firstName} ${best.inspector.lastName}`,
            openOrders: best.inspector._count?.assignedOrders || 0,
            priority: best.priority,
        },
        totalCoverage: candidates.length,
    });
}
