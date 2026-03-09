import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role || 'inspector';
        const userId = (session.user as any).id;

        const now = new Date();
        const notifications: any[] = [];

        // Overdue orders
        const overdueOrders = await prisma.workOrder.findMany({
            where: {
                dueDate: { lt: now },
                status: { in: ['Open', 'Unassigned'] },
                ...(userRole === 'inspector' ? { inspectorId: userId } : {}),
            },
            select: { id: true, orderNumber: true, address1: true, city: true, dueDate: true },
            take: 20,
            orderBy: { dueDate: 'asc' },
        });

        for (const order of overdueOrders) {
            const daysOverdue = Math.floor((now.getTime() - new Date(order.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
            notifications.push({
                id: `overdue-${order.id}`,
                type: 'overdue',
                severity: daysOverdue > 7 ? 'critical' : daysOverdue > 3 ? 'warning' : 'info',
                title: `Order #${order.orderNumber} is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`,
                description: `${order.address1}, ${order.city}`,
                orderId: order.id,
                createdAt: order.dueDate,
            });
        }

        // Unassigned orders (admin/manager only)
        if (userRole !== 'inspector') {
            const unassignedCount = await prisma.workOrder.count({
                where: { status: 'Unassigned' },
            });
            if (unassignedCount > 0) {
                notifications.push({
                    id: 'unassigned-alert',
                    type: 'unassigned',
                    severity: unassignedCount > 10 ? 'critical' : 'warning',
                    title: `${unassignedCount} order${unassignedCount !== 1 ? 's' : ''} need assignment`,
                    description: 'Review and assign inspectors to pending orders',
                    createdAt: now.toISOString(),
                });
            }
        }

        // Pending approval (admin/manager only)
        if (userRole !== 'inspector') {
            const pendingApproval = await prisma.workOrder.count({
                where: { status: 'Completed Pending Approval' },
            });
            if (pendingApproval > 0) {
                notifications.push({
                    id: 'pending-approval',
                    type: 'approval',
                    severity: 'info',
                    title: `${pendingApproval} order${pendingApproval !== 1 ? 's' : ''} pending approval`,
                    description: 'Review completed inspections for quality approval',
                    createdAt: now.toISOString(),
                });
            }
        }

        // Recent activity for the user
        const recentHistory = await prisma.historyEntry.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { order: { select: { orderNumber: true } } },
        });

        for (const entry of recentHistory) {
            notifications.push({
                id: `history-${entry.id}`,
                type: 'activity',
                severity: 'info',
                title: entry.action,
                description: entry.order?.orderNumber ? `Order #${entry.order.orderNumber}` : entry.details || '',
                createdAt: entry.createdAt.toISOString(),
            });
        }

        // Sort by severity then date
        const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
        notifications.sort((a, b) => {
            const sevDiff = (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
            if (sevDiff !== 0) return sevDiff;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return NextResponse.json({
            notifications: notifications.slice(0, 30),
            counts: {
                total: notifications.length,
                critical: notifications.filter(n => n.severity === 'critical').length,
                warning: notifications.filter(n => n.severity === 'warning').length,
            },
        });
    } catch (error) {
        console.error('Notifications error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}
