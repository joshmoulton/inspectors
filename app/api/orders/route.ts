import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const STATUS_GROUPS: Record<string, string[]> = {
  Open: ['Open'],
  Completed: ['Completed Pending Approval', 'Completed Approved', 'Completed Rejected'],
  Unassigned: ['Unassigned'],
  Cancelled: ['Cancelled'],
  Submitted: ['Submitted to Client'],
  Paid: ['Paid'],
};

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(params.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(params.get('pageSize') || '25')));
    const status = params.get('status') || 'All';
    const search = params.get('search')?.trim() || '';
    const sortField = params.get('sortField') || 'orderNumber';
    const sortDir = params.get('sortDir') === 'asc' ? 'asc' : 'desc';
    const inspectorId = params.get('inspector') || '';
    const clientId = params.get('client') || '';

    // Build where clause
    const conditions: Prisma.WorkOrderWhereInput[] = [];

    // Status filter
    if (status !== 'All' && STATUS_GROUPS[status]) {
      conditions.push({ status: { in: STATUS_GROUPS[status] } });
    }

    // Inspector filter
    if (inspectorId) {
      conditions.push({ inspectorId });
    }

    // Client filter
    if (clientId) {
      conditions.push({ clientId });
    }

    // Search filter (case-insensitive across multiple fields)
    if (search) {
      conditions.push({
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { address1: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
          { loanNumber: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.WorkOrderWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    // Build base filter for status counts (search + inspector + client but NOT status)
    const baseConditions: Prisma.WorkOrderWhereInput[] = [];
    if (inspectorId) baseConditions.push({ inspectorId });
    if (clientId) baseConditions.push({ clientId });
    if (search) {
      baseConditions.push({
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { address1: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
          { loanNumber: { contains: search, mode: 'insensitive' } },
        ],
      });
    }
    const baseWhere: Prisma.WorkOrderWhereInput = baseConditions.length > 0 ? { AND: baseConditions } : {};

    // Build orderBy
    let orderBy: Prisma.WorkOrderOrderByWithRelationInput;
    switch (sortField) {
      case 'client':
        orderBy = { client: { code: sortDir } };
        break;
      case 'inspector':
        orderBy = { inspector: { lastName: sortDir } };
        break;
      case 'dueDate':
        orderBy = { dueDate: sortDir };
        break;
      default:
        orderBy = { orderNumber: sortDir };
    }

    // Run queries in parallel
    const [orders, total, statusGroupCounts] = await Promise.all([
      // Page of orders
      prisma.workOrder.findMany({
        where,
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy,
        select: {
          id: true,
          orderNumber: true,
          type: true,
          status: true,
          address1: true,
          city: true,
          state: true,
          dueDate: true,
          inspectorPay: true,
          clientPay: true,
          client: { select: { id: true, name: true, code: true } },
          inspector: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      // Total matching count
      prisma.workOrder.count({ where }),
      // Status counts (for filter pills — use base filter but not status filter)
      prisma.workOrder.groupBy({
        by: ['status'],
        _count: true,
        ...(baseConditions.length > 0 ? { where: baseWhere } : {}),
      }),
    ]);

    // Transform groupBy results into status counts for the pills
    const statusCounts: Record<string, number> = { All: 0 };
    for (const group of statusGroupCounts) {
      statusCounts.All += group._count;
      // Map each DB status to its filter group
      for (const [groupName, statuses] of Object.entries(STATUS_GROUPS)) {
        if (statuses.includes(group.status)) {
          statusCounts[groupName] = (statusCounts[groupName] || 0) + group._count;
        }
      }
    }

    return NextResponse.json({
      orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      statusCounts,
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
