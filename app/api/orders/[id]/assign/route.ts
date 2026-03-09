import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { inspectorId } = body;

        if (!inspectorId) {
            return NextResponse.json({ error: 'Inspector ID is required' }, { status: 400 });
        }

        await prisma.workOrder.update({
            where: { id },
            data: {
                inspectorId,
                status: 'Open',
                assignedDate: new Date(),
            },
        });

        await prisma.historyEntry.create({
            data: {
                action: 'Inspector Assigned',
                details: 'Inspector assigned via quick action',
                orderId: id,
            },
        });

        revalidatePath('/orders');
        revalidatePath(`/orders/${id}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to assign inspector:', error);
        return NextResponse.json({ error: 'Failed to assign inspector' }, { status: 500 });
    }
}
