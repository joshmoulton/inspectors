import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const orderId = request.nextUrl.searchParams.get('orderId');
    if (!orderId) {
        return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    try {
        const submissions = await prisma.formSubmission.findMany({
            where: { orderId },
            include: { template: { select: { id: true, name: true, description: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(submissions);
    } catch {
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const { templateId, orderId } = await request.json();
        if (!templateId || !orderId) {
            return NextResponse.json({ error: 'templateId and orderId are required' }, { status: 400 });
        }

        const submission = await prisma.formSubmission.create({
            data: { templateId, orderId, data: {} },
            include: { template: { select: { name: true } } },
        });
        return NextResponse.json(submission, { status: 201 });
    } catch (error) {
        console.error('Failed to create submission:', error);
        return NextResponse.json({ error: 'Failed to assign form' }, { status: 500 });
    }
}
