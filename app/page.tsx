import prisma from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  // Stats
  const [totalOrders, openOrders, completedOrders] = await Promise.all([
    prisma.workOrder.count(),
    prisma.workOrder.count({ where: { status: 'Open' } }),
    prisma.workOrder.count({ where: { status: { contains: 'Completed' } } }),
  ]);

  const recentOrders = await prisma.workOrder.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { client: true },
  });

  return (
    <DashboardClient
      stats={{ totalOrders, openOrders, completedOrders }}
      recentOrders={recentOrders}
    />
  );
}
