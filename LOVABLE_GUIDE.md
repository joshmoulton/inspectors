# Lovable Integration Guide — Powerade Inspectors

This codebase manages **28,740+ work orders** imported from Inspectorade. This guide explains how to query the data safely at scale.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Schema:** `prisma/schema.prisma`
- **Connection:** `lib/prisma.ts` — uses `pg` adapter with connection pooling
- **Auth:** NextAuth 5 (credentials provider)
- **Storage:** Supabase (photo uploads)

## Database Connection

The `DATABASE_URL` env var connects to PostgreSQL. The Prisma client is configured in `lib/prisma.ts`:

```typescript
import prisma from '@/lib/prisma';
```

## Querying Orders — Critical Rules

The `WorkOrder` table has **28,740+ rows**. Follow these rules:

### NEVER load all orders at once

```typescript
// BAD — loads 28K+ rows, crashes browser
const orders = await prisma.workOrder.findMany();

// BAD — includes full relations on all rows
const orders = await prisma.workOrder.findMany({ include: { client: true } });
```

### ALWAYS paginate

```typescript
// GOOD — paginated query
const orders = await prisma.workOrder.findMany({
  take: 25,
  skip: (page - 1) * 25,
  where: { status: 'Open' },
  orderBy: { orderNumber: 'desc' },
  select: {
    id: true,
    orderNumber: true,
    status: true,
    address1: true,
    city: true,
    state: true,
    dueDate: true,
    client: { select: { name: true, code: true } },
    inspector: { select: { firstName: true, lastName: true } },
  },
});
```

### Use counts for totals

```typescript
// GOOD — count query, not findMany().length
const total = await prisma.workOrder.count({ where: { status: 'Open' } });
```

### Use groupBy for aggregations

```typescript
// GOOD — database-level aggregation
const statusCounts = await prisma.workOrder.groupBy({
  by: ['status'],
  _count: true,
});
```

### Select only needed fields

```typescript
// GOOD — minimal data transfer
const orders = await prisma.workOrder.findMany({
  take: 25,
  select: { id: true, orderNumber: true, status: true },
});
```

## Paginated Orders API

The orders list is served by a paginated API:

```
GET /api/orders?page=1&pageSize=25&status=Open&search=maple&sortField=orderNumber&sortDir=desc
```

**Response:**
```json
{
  "orders": [...],
  "total": 28740,
  "page": 1,
  "pageSize": 25,
  "totalPages": 1150,
  "statusCounts": {
    "All": 28740,
    "Open": 1234,
    "Completed": 5678,
    "Paid": 15000,
    ...
  }
}
```

**Parameters:**
| Param | Default | Description |
|-------|---------|-------------|
| `page` | 1 | Page number |
| `pageSize` | 25 | Items per page (max 100) |
| `status` | All | Filter: All, Open, Completed, Unassigned, Cancelled, Submitted, Paid |
| `search` | "" | Case-insensitive search across orderNumber, address1, city, state, loanNumber |
| `sortField` | orderNumber | Sort by: orderNumber, client, inspector, dueDate |
| `sortDir` | desc | Sort direction: asc, desc |

## Key Schema: WorkOrder

```
orderNumber  — unique, Inspectorade ID (e.g., "102870063")
status       — Open, Unassigned, Cancelled, Completed Pending Approval,
               Completed Approved, Completed Rejected, Submitted to Client, Paid
type         — Standard (default)
workCode     — e.g., "Exterior Occupancy Verification"

address1, city, state, zip, county
latitude, longitude

clientId     → Client (name, code)
inspectorId  → User (firstName, lastName)
qcUserId     → User

orderedDate, assignedDate, completedDate, submittedDate, paidDate
inspectorDueDate, windowStartDate, windowEndDate, ecd, dueDate

inspectorPay — Float
clientPay    — Float
vacant       — Boolean
instructions — Full text
mortgageCompany, loanNumber
vendor       — Source system
```

## Indexed Fields

These columns have database indexes for fast queries:

- `status` — most common filter
- `orderNumber` — unique lookups + sorting
- `createdAt` — date range queries
- `clientId` — client filtering
- `inspectorId` — inspector filtering
- `city`, `state` — location filtering

## Other Models

- **Client** — `name`, `code` (unique). ~50 clients.
- **User** — `username`, `firstName`, `lastName`, `role` (admin/manager/inspector). Small table.
- **Comment** — linked to WorkOrder. Per-order, typically < 10.
- **HistoryEntry** — audit log. Per-order.
- **Attachment** — photos stored in Supabase. Per-order.

## Import System

Bulk import uses a streaming batch architecture:

1. Client-side: Papa Parse streams CSV in browser
2. Sends batches of 100 rows to `POST /api/import/batch`
3. Server upserts by `orderNumber` (re-import = update, no duplicates)
4. Auto-creates Clients by name if not found
5. Matches Inspectors by firstName + lastName

## Pages That Query Orders

| Page | Query Pattern | Safe? |
|------|--------------|-------|
| `/` (Dashboard) | `count()` + `findMany({ take: 5 })` | Yes |
| `/orders` | Paginated API (`/api/orders?page=...`) | Yes |
| `/orders/[id]` | Single order by ID | Yes |
| `/reports` | `groupBy()` aggregation | Yes |
| `/routes` | Users + open order IDs only | Yes |

## File Structure

```
app/
  api/orders/route.ts      — Paginated orders API
  api/import/batch/route.ts — Batch CSV import
  orders/page.tsx           — Orders list (thin wrapper)
  orders/[id]/page.tsx      — Order detail
components/
  OrderTable.tsx            — Client-side table with API fetch
  Pagination.tsx            — Page navigation
lib/
  prisma.ts                 — Database client
  actions.ts                — Server actions (create, update, etc.)
prisma/
  schema.prisma             — Database schema
```
