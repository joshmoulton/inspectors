import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// One-time migration: create indexes for performance at scale (28K+ orders)
export async function POST() {
  try {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "WorkOrder_status_idx" ON "WorkOrder"("status")',
      'CREATE INDEX IF NOT EXISTS "WorkOrder_orderNumber_idx" ON "WorkOrder"("orderNumber")',
      'CREATE INDEX IF NOT EXISTS "WorkOrder_createdAt_idx" ON "WorkOrder"("createdAt")',
      'CREATE INDEX IF NOT EXISTS "WorkOrder_clientId_idx" ON "WorkOrder"("clientId")',
      'CREATE INDEX IF NOT EXISTS "WorkOrder_inspectorId_idx" ON "WorkOrder"("inspectorId")',
      'CREATE INDEX IF NOT EXISTS "WorkOrder_city_idx" ON "WorkOrder"("city")',
      'CREATE INDEX IF NOT EXISTS "WorkOrder_state_idx" ON "WorkOrder"("state")',
    ];

    for (const sql of indexes) {
      await prisma.$executeRawUnsafe(sql);
    }

    return NextResponse.json({ success: true, message: `Created ${indexes.length} indexes` });
  } catch (error) {
    console.error('Migration error:', error);
    const message = error instanceof Error ? error.message : 'Migration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
