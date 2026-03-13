import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const templates = await prisma.formTemplate.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(templates);
    } catch {
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const { name, description, fields } = await request.json();
        if (!name?.trim()) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const template = await prisma.formTemplate.create({
            data: { name, description: description || '', fields: fields || [] },
        });
        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error('Failed to create template:', error);
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}
