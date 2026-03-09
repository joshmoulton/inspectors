import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await prisma.workOrder.findMany({
            select: {
                orderNumber: true,
                type: true,
                status: true,
                workCode: true,
                address1: true,
                address2: true,
                city: true,
                state: true,
                zip: true,
                county: true,
                dueDate: true,
                orderedDate: true,
                completedDate: true,
                submittedDate: true,
                paidDate: true,
                inspectorPay: true,
                clientPay: true,
                loanNumber: true,
                mortgageCompany: true,
                vacant: true,
                photoRequired: true,
                instructions: true,
                client: { select: { name: true, code: true } },
                inspector: { select: { firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ orders, total: orders.length });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}
