import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const settings = await prisma.setting.findMany();
        const map: Record<string, string> = {};
        for (const s of settings) {
            map[s.key] = s.value;
        }
        return NextResponse.json(map);
    } catch {
        return NextResponse.json({});
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const entries = Object.entries(body) as [string, string][];

        await Promise.all(
            entries.map(([key, value]) =>
                prisma.setting.upsert({
                    where: { key },
                    update: { value: String(value) },
                    create: { key, value: String(value) },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
