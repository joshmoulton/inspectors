import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// One-time cleanup of seed/mock data
// Deletes: 3 seed orders, 4 fake users (keeps admin), orphaned seed clients
const SEED_ORDER_NUMBERS = ['109642801', '109643215', '109643890'];
const SEED_USERNAMES = ['rafael.felleto', 'sarah.chen', 'marcus.johnson', 'lisa.wang'];

export async function POST() {
  try {
    const results = {
      ordersDeleted: 0,
      usersDeleted: 0,
      clientsDeleted: 0,
      clientLoginsDeleted: 0,
      commentsDeleted: 0,
      historyDeleted: 0,
    };

    // 1. Delete seed orders and their related data (cascade handles comments, history, attachments)
    for (const orderNumber of SEED_ORDER_NUMBERS) {
      const order = await prisma.workOrder.findUnique({ where: { orderNumber } });
      if (order) {
        // Delete related records first (cascade should handle this but being explicit)
        const commentCount = await prisma.comment.deleteMany({ where: { orderId: order.id } });
        const historyCount = await prisma.historyEntry.deleteMany({ where: { orderId: order.id } });
        await prisma.event.deleteMany({ where: { orderId: order.id } });
        await prisma.attachment.deleteMany({ where: { orderId: order.id } });
        await prisma.workOrder.delete({ where: { id: order.id } });

        results.commentsDeleted += commentCount.count;
        results.historyDeleted += historyCount.count;
        results.ordersDeleted++;
      }
    }

    // 2. Delete fake users (unlink from any orders first)
    for (const username of SEED_USERNAMES) {
      const user = await prisma.user.findUnique({ where: { username } });
      if (user) {
        // Unlink orders assigned to this fake user (don't delete real orders)
        await prisma.workOrder.updateMany({
          where: { inspectorId: user.id },
          data: { inspectorId: null },
        });
        await prisma.workOrder.updateMany({
          where: { qcUserId: user.id },
          data: { qcUserId: null },
        });
        // Remove comments by this user
        await prisma.comment.deleteMany({ where: { authorId: user.id } });
        await prisma.event.deleteMany({ where: { createdById: user.id } });

        await prisma.user.delete({ where: { id: user.id } });
        results.usersDeleted++;
      }
    }

    // 3. Delete orphaned seed clients (clients with no remaining orders)
    const seedClientCodes = ['ALT-PPW', 'SS', 'SGP', 'MCS'];
    for (const code of seedClientCodes) {
      const client = await prisma.client.findUnique({ where: { code } });
      if (client) {
        const orderCount = await prisma.workOrder.count({ where: { clientId: client.id } });
        if (orderCount === 0) {
          // Safe to delete — no orders reference this client
          await prisma.clientLogin.deleteMany({ where: { clientId: client.id } });
          await prisma.contact.deleteMany({ where: { clientId: client.id } });
          await prisma.client.delete({ where: { id: client.id } });
          results.clientsDeleted++;
          results.clientLoginsDeleted++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Mock data cleaned up',
      ...results,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    const message = error instanceof Error ? error.message : 'Cleanup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
