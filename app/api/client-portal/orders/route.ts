import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function parseToken(token: string): { clientId: string; code: string; name: string } | null {
    try {
        return JSON.parse(Buffer.from(token, 'base64').toString());
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(1, parseInt(request.nextUrl.searchParams.get('pageSize') || '25')));
    const status = request.nextUrl.searchParams.get('status') || 'All';
    const search = request.nextUrl.searchParams.get('search')?.trim() || '';

    if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const auth = parseToken(token);
    if (!auth?.clientId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
        const where: any = { clientId: auth.clientId };

        // Status filter
        if (status !== 'All') {
            const statusMap: Record<string, string[]> = {
                'In Progress': ['Open', 'Unassigned'],
                'Completed': ['Completed Pending Approval', 'Completed Approved', 'Completed Rejected'],
                'Submitted': ['Submitted to Client'],
                'Paid': ['Paid'],
            };
            if (statusMap[status]) {
                where.status = { in: statusMap[status] };
            }
        }

        // Search
        if (search) {
            where.AND = [{
                OR: [
                    { orderNumber: { contains: search, mode: 'insensitive' } },
                    { address1: { contains: search, mode: 'insensitive' } },
                    { city: { contains: search, mode: 'insensitive' } },
                    { loanNumber: { contains: search, mode: 'insensitive' } },
                ],
            }];
        }

        const [orders, total] = await Promise.all([
            prisma.workOrder.findMany({
                where,
                take: pageSize,
                skip: (page - 1) * pageSize,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    type: true,
                    address1: true,
                    city: true,
                    state: true,
                    zip: true,
                    dueDate: true,
                    completedDate: true,
                    orderedDate: true,
                    workCode: true,
                    loanNumber: true,
                    // Exclude: financials, inspector details, internal notes
                },
            }),
            prisma.workOrder.count({ where }),
        ]);

        // Get status counts for the client
        const statusCounts = await prisma.workOrder.groupBy({
            by: ['status'],
            where: { clientId: auth.clientId },
            _count: true,
        });

        return NextResponse.json({
            orders,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            statusCounts: statusCounts.reduce((acc, s) => {
                acc[s.status] = s._count;
                return acc;
            }, {} as Record<string, number>),
            client: { name: auth.name, code: auth.code },
        });
    } catch (error) {
        console.error('Client portal orders error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
