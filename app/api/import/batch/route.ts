import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface ImportRow {
  ID?: string;
  Address?: string;
  City?: string;
  State?: string;
  Zip?: string;
  CountyName?: string;
  WorkCode?: string;
  InspectorPay?: string;
  InspectorDueDate?: string;
  ECD?: string;
  WindowStartDate?: string;
  WindowEndDate?: string;
  Client?: string;
  Inspector?: string;
  Assigned?: string;
  Ordered?: string;
  Completed?: string;
  Submitted?: string;
  SubmittedToClient?: string;
  Paid?: string;
  Cancelled?: string;
  Lender?: string;
  LoanNumber?: string;
  Status?: string;
  Vacant?: string;
  Instructions?: string;
  Latitude?: string;
  Longitude?: string;
  QCUser?: string;
  Source?: string;
}

// Cache for client/inspector lookups within a single request
const clientCache = new Map<string, string | null>();
const inspectorCache = new Map<string, string | null>();

function parseDate(value: string | undefined): Date | null {
  if (!value || value.trim() === '' || value === 'N/A') return null;
  const trimmed = value.trim();

  // Handle MM/DD/YYYY or M/D/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(d.getTime())) return d;
  }

  // Handle YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

function mapStatus(csvStatus: string | undefined, cancelledDate: string | undefined): string {
  if (cancelledDate && cancelledDate.trim() !== '') return 'Cancelled';
  if (!csvStatus) return 'Open';

  const s = csvStatus.trim();
  // Map Inspectorade statuses to our statuses
  const statusMap: Record<string, string> = {
    'Paid': 'Paid',
    'Open': 'Open',
    'Cancelled': 'Cancelled',
    'Completed': 'Completed Pending Approval',
    'Completed Pending Approval': 'Completed Pending Approval',
    'Completed Approved': 'Completed Approved',
    'Completed Rejected': 'Completed Rejected',
    'Submitted to Client': 'Submitted to Client',
    'Unassigned': 'Unassigned',
  };

  return statusMap[s] || s;
}

async function findOrCreateClient(name: string): Promise<string | null> {
  if (!name || name.trim() === '') return null;
  const trimmed = name.trim();

  if (clientCache.has(trimmed)) return clientCache.get(trimmed)!;

  let client = await prisma.client.findFirst({ where: { name: trimmed } });
  if (!client) {
    // Auto-create client with a generated code
    const code = trimmed
      .split(/\s+/)
      .map(w => w[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 6);

    // Check if code exists, append number if needed
    let finalCode = code;
    let counter = 1;
    while (await prisma.client.findUnique({ where: { code: finalCode } })) {
      finalCode = `${code}${counter}`;
      counter++;
    }

    client = await prisma.client.create({
      data: { name: trimmed, code: finalCode, active: true },
    });
  }

  clientCache.set(trimmed, client.id);
  return client.id;
}

async function findInspector(name: string): Promise<string | null> {
  if (!name || name.trim() === '') return null;
  const trimmed = name.trim();

  if (inspectorCache.has(trimmed)) return inspectorCache.get(trimmed)!;

  const parts = trimmed.split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');

  const user = await prisma.user.findFirst({
    where: {
      firstName: { equals: firstName, mode: 'insensitive' },
      ...(lastName ? { lastName: { equals: lastName, mode: 'insensitive' } } : {}),
    },
  });

  const id = user?.id || null;
  inspectorCache.set(trimmed, id);
  return id;
}

export async function POST(request: NextRequest) {
  try {
    const { rows, batchIndex } = (await request.json()) as {
      rows: ImportRow[];
      batchIndex: number;
    };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
    }

    let inserted = 0;
    let updated = 0;
    const errors: { row: number; id: string; message: string }[] = [];

    // Process in a transaction for consistency
    await prisma.$transaction(
      async (tx) => {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rowIndex = batchIndex * 100 + i;

          try {
            const orderNumber = row.ID?.trim();
            if (!orderNumber) {
              errors.push({ row: rowIndex, id: 'unknown', message: 'Missing ID field' });
              continue;
            }

            // Lookups (use main prisma client for reads, tx for writes)
            const clientId = await findOrCreateClient(row.Client || '');
            const inspectorId = await findInspector(row.Inspector || '');
            const qcUserId = await findInspector(row.QCUser || '');

            const data = {
              workCode: row.WorkCode?.trim() || null,
              address1: row.Address?.trim() || null,
              city: row.City?.trim() || null,
              state: row.State?.trim() || null,
              zip: row.Zip?.trim() || null,
              county: row.CountyName?.trim() || null,
              inspectorPay: row.InspectorPay ? parseFloat(row.InspectorPay) || null : null,
              inspectorDueDate: parseDate(row.InspectorDueDate),
              ecd: parseDate(row.ECD),
              windowStartDate: parseDate(row.WindowStartDate),
              windowEndDate: parseDate(row.WindowEndDate),
              clientId,
              inspectorId,
              qcUserId,
              assignedDate: parseDate(row.Assigned),
              orderedDate: parseDate(row.Ordered),
              completedDate: parseDate(row.Completed),
              submittedDate: parseDate(row.Submitted) || parseDate(row.SubmittedToClient),
              paidDate: parseDate(row.Paid),
              mortgageCompany: row.Lender?.trim() || null,
              loanNumber: row.LoanNumber?.trim() || null,
              status: mapStatus(row.Status, row.Cancelled),
              vacant: row.Vacant?.trim()?.toLowerCase() === 'yes',
              instructions: row.Instructions?.trim() || null,
              latitude: row.Latitude ? parseFloat(row.Latitude) || null : null,
              longitude: row.Longitude ? parseFloat(row.Longitude) || null : null,
              vendor: row.Source?.trim() || null,
            };

            const existing = await tx.workOrder.findUnique({
              where: { orderNumber },
              select: { id: true },
            });

            if (existing) {
              await tx.workOrder.update({
                where: { orderNumber },
                data,
              });
              updated++;
            } else {
              await tx.workOrder.create({
                data: {
                  orderNumber,
                  ...data,
                },
              });
              inserted++;
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            errors.push({ row: rowIndex, id: row.ID || 'unknown', message });
          }
        }
      },
      { timeout: 60000 } // 60s timeout for large batches
    );

    return NextResponse.json({ inserted, updated, errors });
  } catch (error) {
    console.error('Batch import error:', error);
    const message = error instanceof Error ? error.message : 'Batch import failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
