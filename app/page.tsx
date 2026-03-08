import prisma from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  try {
    const [totalOrders, openOrders, completedOrders, pendingQC] = await Promise.all([
      prisma.workOrder.count(),
      prisma.workOrder.count({ where: { status: 'Open' } }),
      prisma.workOrder.count({ where: { status: { contains: 'Completed' } } }),
      prisma.workOrder.count({ where: { status: 'Completed Pending Approval' } }),
    ]);

    const recentOrders = await prisma.workOrder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    });

    // Chart data: orders created per day over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ordersLast30 = await prisma.workOrder.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Bucket by day
    const dayBuckets: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - 29 + i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayBuckets[key] = 0;
    }
    for (const order of ordersLast30) {
      const key = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in dayBuckets) dayBuckets[key]++;
    }
    const chartData = Object.entries(dayBuckets).map(([name, orders]) => ({ name, orders }));

    // Recent activity
    const recentHistory = await prisma.historyEntry.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { orderNumber: true } } },
    });

    const recentActivity = recentHistory.map(h => ({
      id: h.id,
      action: h.action,
      details: h.details,
      createdAt: h.createdAt.toISOString(),
      orderNumber: h.order?.orderNumber || undefined,
    }));

    return (
      <DashboardClient
        stats={{ totalOrders, openOrders, completedOrders, pendingQC }}
        recentOrders={recentOrders}
        chartData={chartData}
        recentActivity={recentActivity}
      />
    );
  } catch {
    return (
      <DashboardClient
        stats={{ totalOrders: 0, openOrders: 0, completedOrders: 0, pendingQC: 0 }}
        recentOrders={[]}
        chartData={[]}
        recentActivity={[]}
      />
    );
  }
}
