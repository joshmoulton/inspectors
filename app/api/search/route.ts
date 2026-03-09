import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const query = q.toLowerCase();

  try {
    const [orders, users, clients, contacts] = await Promise.all([
      prisma.workOrder.findMany({
        where: {
          OR: [
            { orderNumber: { contains: q, mode: 'insensitive' } },
            { address1: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
            { loanNumber: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          orderNumber: true,
          address1: true,
          city: true,
          state: true,
          status: true,
        },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { username: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, firstName: true, lastName: true, role: true },
        take: 5,
      }),
      prisma.client.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, code: true },
        take: 5,
      }),
      prisma.contact.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, firstName: true, lastName: true, company: true },
        take: 3,
      }),
    ]);

    const results = [
      ...orders.map(o => ({
        type: 'order' as const,
        id: o.id,
        title: `#${o.orderNumber}`,
        subtitle: [o.address1, o.city, o.state].filter(Boolean).join(', '),
        badge: o.status,
        href: `/orders/${o.id}`,
      })),
      ...users.map(u => ({
        type: 'user' as const,
        id: u.id,
        title: `${u.firstName} ${u.lastName}`,
        subtitle: u.role,
        badge: u.role,
        href: `/users/${u.id}`,
      })),
      ...clients.map(c => ({
        type: 'client' as const,
        id: c.id,
        title: c.name,
        subtitle: c.code || '',
        badge: 'client',
        href: `/clients`,
      })),
      ...contacts.map(c => ({
        type: 'contact' as const,
        id: c.id,
        title: `${c.firstName} ${c.lastName}`,
        subtitle: c.company || '',
        badge: 'contact',
        href: `/contacts`,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [] });
  }
}
