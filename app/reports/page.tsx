import prisma from '@/lib/prisma';
import { Download, Calendar } from 'lucide-react';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
    let orderStats: any[] = [];
    let clientStats: any[] = [];
    let monthlyData: { month: string; count: number }[] = [];
    let inspectorStats: any[] = [];
    let avgTurnaround = 0;
    let approvalRate = 0;
    let totalRevenue = 0;
    let inspectorCoverage = 0;

    try {
        const [stats, clients, allInspectors, completedOrders, paidOrders] = await Promise.all([
            prisma.workOrder.groupBy({ by: ['status'], _count: true }),
            prisma.client.findMany({
                include: { _count: { select: { orders: true } } },
                orderBy: { orders: { _count: 'desc' } },
                take: 10,
            }),
            prisma.user.findMany({
                where: { role: 'inspector' },
                include: {
                    assignedOrders: {
                        select: { id: true, status: true },
                    },
                },
            }),
            prisma.workOrder.findMany({
                where: { completedDate: { not: null }, orderedDate: { not: null } },
                select: { orderedDate: true, completedDate: true },
                take: 1000,
                orderBy: { completedDate: 'desc' },
            }),
            prisma.workOrder.aggregate({
                where: { status: 'Paid' },
                _sum: { clientPay: true },
            }),
        ]);

        orderStats = stats;
        clientStats = clients;
        totalRevenue = paidOrders._sum.clientPay || 0;

        // Avg turnaround (days between ordered and completed)
        if (completedOrders.length > 0) {
            const totalDays = completedOrders.reduce((sum, o) => {
                const diff = (new Date(o.completedDate!).getTime() - new Date(o.orderedDate!).getTime()) / (1000 * 60 * 60 * 24);
                return sum + Math.max(0, diff);
            }, 0);
            avgTurnaround = Math.round((totalDays / completedOrders.length) * 10) / 10;
        }

        // Approval rate
        const totalCompleted = stats.filter(s => s.status.includes('Completed')).reduce((a, s) => a + s._count, 0);
        const approved = stats.find(s => s.status === 'Completed Approved')?._count || 0;
        approvalRate = totalCompleted > 0 ? Math.round((approved / totalCompleted) * 1000) / 10 : 0;

        // Inspector coverage
        const activeInspectors = allInspectors.filter(i => i.assignedOrders.length > 0).length;
        inspectorCoverage = allInspectors.length > 0 ? Math.round((activeInspectors / allInspectors.length) * 100) : 0;

        // Inspector performance stats
        inspectorStats = allInspectors.map(i => ({
            name: `${i.firstName} ${i.lastName}`,
            total: i.assignedOrders.length,
            open: i.assignedOrders.filter(o => o.status === 'Open').length,
            completed: i.assignedOrders.filter(o => o.status.includes('Completed')).length,
        })).sort((a, b) => b.total - a.total).slice(0, 10);

        // Monthly orders (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const monthlyOrders = await prisma.workOrder.findMany({
            where: { createdAt: { gte: twelveMonthsAgo } },
            select: { createdAt: true },
        });
        const monthBuckets: Record<string, number> = {};
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            monthBuckets[key] = 0;
        }
        for (const o of monthlyOrders) {
            const key = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            if (key in monthBuckets) monthBuckets[key]++;
        }
        monthlyData = Object.entries(monthBuckets).map(([month, count]) => ({ month, count }));

    } catch (e) {
        console.error('Reports error:', e);
    }

    const totalOrders = orderStats.reduce((acc: number, s: { _count: number }) => acc + s._count, 0);

    return (
        <ReportsClient
            orderStats={orderStats}
            clientStats={clientStats}
            inspectorStats={inspectorStats}
            monthlyData={monthlyData}
            totalOrders={totalOrders}
            avgTurnaround={avgTurnaround}
            approvalRate={approvalRate}
            inspectorCoverage={inspectorCoverage}
            totalRevenue={totalRevenue}
        />
    );
}
