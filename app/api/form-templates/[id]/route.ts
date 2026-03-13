import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    try {
        const { name, description, fields } = await request.json();
        const template = await prisma.formTemplate.update({
            where: { id },
            data: { name, description, fields },
        });
        return NextResponse.json(template);
    } catch (error) {
        console.error('Failed to update template:', error);
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    try {
        await prisma.formTemplate.update({
            where: { id },
            data: { active: false },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete template:', error);
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
}
