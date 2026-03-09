import prisma from '@/lib/prisma';
import DashboardClient from './DashboardClient';
import { Suspense } from 'react';

async function getStats() {
  const [totalOrders, openOrders, completedOrders, pendingQC] = await Promise.all([
    prisma.workOrder.count(),
    prisma.workOrder.count({ where: { status: 'Open' } }),
    prisma.workOrder.count({ where: { status: { contains: 'Completed' } } }),
    prisma.workOrder.count({ where: { status: 'Completed Pending Approval' } }),
  ]);
  return { totalOrders, openOrders, completedOrders, pendingQC };
}

async function getChartData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const ordersLast30 = await prisma.workOrder.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

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
  return Object.entries(dayBuckets).map(([name, orders]) => ({ name, orders }));
}

async function getRecentData() {
  const [recentOrders, recentHistory] = await Promise.all([
    prisma.workOrder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    }),
    prisma.historyEntry.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { orderNumber: true } } },
    }),
  ]);

  const recentActivity = recentHistory.map(h => ({
    id: h.id,
    action: h.action,
    details: h.details,
    createdAt: h.createdAt.toISOString(),
    orderNumber: h.order?.orderNumber || undefined,
  }));

  return { recentOrders, recentActivity };
}

async function DashboardContent() {
  const [stats, chartData, { recentOrders, recentActivity }] = await Promise.all([
    getStats(),
    getChartData(),
    getRecentData(),
  ]);

  return (
    <DashboardClient
      stats={stats}
      recentOrders={recentOrders}
      chartData={chartData}
      recentActivity={recentActivity}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Loading your data...</p>
        </div>
      </header>
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="stat-card" style={{ opacity: 0.5 }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
            <div className="stat-content">
              <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4, marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
