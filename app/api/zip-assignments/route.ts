import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET — list all zip assignments, optionally filtered by inspector
export async function GET(request: NextRequest) {
    const inspectorId = request.nextUrl.searchParams.get('inspectorId') || '';
    const zip = request.nextUrl.searchParams.get('zip') || '';

    const where: any = {};
    if (inspectorId) where.inspectorId = inspectorId;
    if (zip) where.zip = { contains: zip };

    const assignments = await prisma.zipAssignment.findMany({
        where,
        include: {
            inspector: { select: { id: true, firstName: true, lastName: true, active: true } },
        },
        orderBy: [{ zip: 'asc' }, { priority: 'desc' }],
    });

    return NextResponse.json({ assignments });
}

// POST — create one or many zip assignments
export async function POST(request: NextRequest) {
    const body = await request.json();

    // Bulk create: { assignments: [{ zip, inspectorId, priority? }] }
    if (Array.isArray(body.assignments)) {
        const results = [];
        const errors = [];

        for (const a of body.assignments) {
            const zip = a.zip?.trim();
            const inspectorId = a.inspectorId;
            if (!zip || !inspectorId) {
                errors.push({ zip, error: 'Missing zip or inspectorId' });
                continue;
            }
            try {
                const result = await prisma.zipAssignment.upsert({
                    where: { zip_inspectorId: { zip, inspectorId } },
                    update: { priority: a.priority ?? 0 },
                    create: { zip, inspectorId, priority: a.priority ?? 0 },
                });
                results.push(result);
            } catch (e: any) {
                errors.push({ zip, inspectorId, error: e.message });
            }
        }

        return NextResponse.json({ created: results.length, errors });
    }

    // Single create
    const { zip, inspectorId, priority } = body;
    if (!zip?.trim() || !inspectorId) {
        return NextResponse.json({ error: 'zip and inspectorId required' }, { status: 400 });
    }

    const assignment = await prisma.zipAssignment.upsert({
        where: { zip_inspectorId: { zip: zip.trim(), inspectorId } },
        update: { priority: priority ?? 0 },
        create: { zip: zip.trim(), inspectorId, priority: priority ?? 0 },
    });

    return NextResponse.json({ assignment });
}

// DELETE — delete a zip assignment by id, or bulk delete by inspectorId
export async function DELETE(request: NextRequest) {
    const body = await request.json();

    if (body.id) {
        await prisma.zipAssignment.delete({ where: { id: body.id } });
        return NextResponse.json({ success: true });
    }

    if (body.ids && Array.isArray(body.ids)) {
        await prisma.zipAssignment.deleteMany({ where: { id: { in: body.ids } } });
        return NextResponse.json({ success: true, deleted: body.ids.length });
    }

    if (body.inspectorId && body.zip) {
        await prisma.zipAssignment.deleteMany({
            where: { inspectorId: body.inspectorId, zip: body.zip },
        });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Provide id, ids[], or inspectorId+zip' }, { status: 400 });
}
