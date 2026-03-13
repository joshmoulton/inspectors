import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    try {
        const submission = await prisma.formSubmission.findUnique({
            where: { id },
            include: { template: true, order: { select: { orderNumber: true, id: true } } },
        });
        if (!submission) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(submission);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    try {
        const { data, complete } = await request.json();
        const updateData: any = { data };
        if (complete) {
            updateData.completedAt = new Date();
        }
        const submission = await prisma.formSubmission.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(submission);
    } catch (error) {
        console.error('Failed to update submission:', error);
        return NextResponse.json({ error: 'Failed to save form' }, { status: 500 });
    }
}
