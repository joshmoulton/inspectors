import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Client code is required' }, { status: 400 });
    }

    try {
        const client = await prisma.client.findFirst({
            where: {
                code: { equals: code, mode: 'insensitive' },
                active: true,
            },
            select: { id: true, name: true, code: true },
        });

        if (!client) {
            return NextResponse.json({ error: 'Invalid client code. Please check and try again.' }, { status: 401 });
        }

        // Simple token (in production, use JWT or session)
        const token = Buffer.from(JSON.stringify({ clientId: client.id, code: client.code, name: client.name })).toString('base64');

        return NextResponse.json({ success: true, token, client: { name: client.name, code: client.code } });
    } catch (error) {
        console.error('Client auth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
