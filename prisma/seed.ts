import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data (in order to respect foreign keys)
    await prisma.historyEntry.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.event.deleteMany();
    await prisma.workOrder.deleteMany();
    await prisma.clientLogin.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 10);

    // ── Users (Admin + Inspectors + QC) ──────────────────────────────
    console.log('  Creating users...');

    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            password: hashedPassword,
            email: 'admin@powerade.com',
            firstName: 'Josh',
            lastName: 'Moulton',
            role: 'admin',
            phone: '555-100-0001',
        },
    });

    const inspectors = await Promise.all([
        prisma.user.create({
            data: {
                username: 'mthompson',
                password: hashedPassword,
                email: 'mike.thompson@powerade.com',
                firstName: 'Mike',
                lastName: 'Thompson',
                role: 'inspector',
                phone: '555-200-0001',
            },
        }),
        prisma.user.create({
            data: {
                username: 'sgarcia',
                password: hashedPassword,
                email: 'sarah.garcia@powerade.com',
                firstName: 'Sarah',
                lastName: 'Garcia',
                role: 'inspector',
                phone: '555-200-0002',
            },
        }),
        prisma.user.create({
            data: {
                username: 'jcarter',
                password: hashedPassword,
                email: 'james.carter@powerade.com',
                firstName: 'James',
                lastName: 'Carter',
                role: 'inspector',
                phone: '555-200-0003',
            },
        }),
        prisma.user.create({
            data: {
                username: 'arodriguez',
                password: hashedPassword,
                email: 'ana.rodriguez@powerade.com',
                firstName: 'Ana',
                lastName: 'Rodriguez',
                role: 'inspector',
                phone: '555-200-0004',
            },
        }),
        prisma.user.create({
            data: {
                username: 'dwilson',
                password: hashedPassword,
                email: 'david.wilson@powerade.com',
                firstName: 'David',
                lastName: 'Wilson',
                role: 'inspector',
                phone: '555-200-0005',
            },
        }),
        prisma.user.create({
            data: {
                username: 'kpatel',
                password: hashedPassword,
                email: 'kevin.patel@powerade.com',
                firstName: 'Kevin',
                lastName: 'Patel',
                role: 'inspector',
                phone: '555-200-0006',
            },
        }),
        prisma.user.create({
            data: {
                username: 'ljohnson',
                password: hashedPassword,
                email: 'lisa.johnson@powerade.com',
                firstName: 'Lisa',
                lastName: 'Johnson',
                role: 'inspector',
                phone: '555-200-0007',
            },
        }),
        prisma.user.create({
            data: {
                username: 'rbrown',
                password: hashedPassword,
                email: 'robert.brown@powerade.com',
                firstName: 'Robert',
                lastName: 'Brown',
                role: 'inspector',
                phone: '555-200-0008',
            },
        }),
    ]);

    const qcManager = await prisma.user.create({
        data: {
            username: 'emartinez',
            password: hashedPassword,
            email: 'elena.martinez@powerade.com',
            firstName: 'Elena',
            lastName: 'Martinez',
            role: 'qc',
            phone: '555-300-0001',
        },
    });

    console.log(`  ✓ Created ${inspectors.length} inspectors, 1 admin, 1 QC manager`);

    // ── Clients ──────────────────────────────────────────────────────
    console.log('  Creating clients...');

    const clients = await Promise.all([
        prisma.client.create({
            data: {
                name: 'First National Mortgage',
                code: 'FNM',
                logins: { create: [{ name: 'FNM Portal' }] },
            },
        }),
        prisma.client.create({
            data: {
                name: 'Safeguard Properties',
                code: 'SGP',
                logins: { create: [{ name: 'Safeguard Login' }] },
            },
        }),
        prisma.client.create({
            data: {
                name: 'Five Brothers Asset Mgmt',
                code: 'FBAM',
                logins: { create: [{ name: 'Five Brothers Portal' }] },
            },
        }),
        prisma.client.create({
            data: {
                name: 'Mortgage Contracting Svcs',
                code: 'MCS',
                logins: { create: [{ name: 'MCS Login' }] },
            },
        }),
        prisma.client.create({
            data: {
                name: 'ServiceLink Field Services',
                code: 'SLFS',
                logins: { create: [{ name: 'ServiceLink Portal' }] },
            },
        }),
        prisma.client.create({
            data: {
                name: 'US Best Repairs',
                code: 'USBR',
                logins: { create: [{ name: 'US Best Login' }] },
            },
        }),
    ]);

    console.log(`  ✓ Created ${clients.length} clients`);

    // ── Contacts ─────────────────────────────────────────────────────
    console.log('  Creating contacts...');

    await Promise.all([
        prisma.contact.create({ data: { firstName: 'Patricia', lastName: 'Hayes', email: 'phayes@fnm.com', phone: '555-400-0001', title: 'Account Manager', company: 'First National Mortgage', clientId: clients[0].id } }),
        prisma.contact.create({ data: { firstName: 'Marcus', lastName: 'Allen', email: 'mallen@sgp.com', phone: '555-400-0002', title: 'Regional Director', company: 'Safeguard Properties', clientId: clients[1].id } }),
        prisma.contact.create({ data: { firstName: 'Diane', lastName: 'Foster', email: 'dfoster@fbam.com', phone: '555-400-0003', title: 'Operations Lead', company: 'Five Brothers', clientId: clients[2].id } }),
        prisma.contact.create({ data: { firstName: 'Tom', lastName: 'Bradley', email: 'tbradley@mcs.com', phone: '555-400-0004', title: 'Dispatch Manager', company: 'MCS', clientId: clients[3].id } }),
    ]);

    console.log('  ✓ Created 4 contacts');

    // ── Work Orders ──────────────────────────────────────────────────
    console.log('  Creating work orders...');

    const statuses = ['Open', 'Unassigned', 'Completed Pending Approval', 'Completed Approved', 'Submitted to Client', 'Paid', 'Cancelled'];
    const types = ['Standard', 'Interior', 'Contact', 'Occupancy Verification', 'Disaster', 'Insurance Loss'];
    const cities = [
        { city: 'Dallas', state: 'TX', zip: '75201', county: 'Dallas', lat: 32.7767, lng: -96.7970 },
        { city: 'Houston', state: 'TX', zip: '77001', county: 'Harris', lat: 29.7604, lng: -95.3698 },
        { city: 'Austin', state: 'TX', zip: '73301', county: 'Travis', lat: 30.2672, lng: -97.7431 },
        { city: 'San Antonio', state: 'TX', zip: '78201', county: 'Bexar', lat: 29.4241, lng: -98.4936 },
        { city: 'Fort Worth', state: 'TX', zip: '76101', county: 'Tarrant', lat: 32.7555, lng: -97.3308 },
        { city: 'Plano', state: 'TX', zip: '75023', county: 'Collin', lat: 33.0198, lng: -96.6989 },
        { city: 'Arlington', state: 'TX', zip: '76001', county: 'Tarrant', lat: 32.7357, lng: -97.1081 },
        { city: 'Frisco', state: 'TX', zip: '75034', county: 'Collin', lat: 33.1507, lng: -96.8236 },
        { city: 'McKinney', state: 'TX', zip: '75069', county: 'Collin', lat: 33.1972, lng: -96.6397 },
        { city: 'Irving', state: 'TX', zip: '75014', county: 'Dallas', lat: 32.8140, lng: -96.9489 },
        { city: 'Denton', state: 'TX', zip: '76201', county: 'Denton', lat: 33.2148, lng: -97.1331 },
        { city: 'Round Rock', state: 'TX', zip: '78664', county: 'Williamson', lat: 30.5083, lng: -97.6789 },
    ];

    const streetNames = [
        'Main St', 'Oak Ave', 'Elm St', 'Cedar Ln', 'Maple Dr', 'Pine Rd',
        'Birch Ct', 'Walnut Blvd', 'Willow Way', 'Peach Tree Ln', 'Cherry St',
        'Magnolia Ave', 'Hickory Rd', 'Sycamore Dr', 'Ash Ct', 'Poplar Blvd',
    ];

    const mortgageCompanies = ['Wells Fargo', 'Chase Home Lending', 'Bank of America', 'US Bank', 'Nationstar', 'PHH Mortgage', 'Ocwen Financial', 'Carrington Mortgage'];

    const now = new Date();
    const orders = [];

    for (let i = 1; i <= 150; i++) {
        const statusIdx = i <= 15 ? 0 : // 15 Open
            i <= 25 ? 1 :               // 10 Unassigned
            i <= 45 ? 2 :               // 20 Completed Pending
            i <= 80 ? 3 :               // 35 Completed Approved
            i <= 110 ? 4 :              // 30 Submitted
            i <= 140 ? 5 :              // 30 Paid
            6;                           // 10 Cancelled
        const status = statuses[statusIdx];
        const isAssigned = status !== 'Unassigned' && status !== 'Cancelled';
        const inspector = isAssigned ? inspectors[i % inspectors.length] : null;
        const client = clients[i % clients.length];
        const loc = cities[i % cities.length];
        const type = types[i % types.length];
        const streetNum = 100 + (i * 37) % 9900;
        const street = streetNames[i % streetNames.length];

        // Dates
        const createdDaysAgo = Math.floor(Math.random() * 180) + 5;
        const createdAt = new Date(now.getTime() - createdDaysAgo * 86400000);
        const orderedDate = new Date(createdAt.getTime() + Math.random() * 86400000);
        const dueDate = new Date(orderedDate.getTime() + (7 + Math.floor(Math.random() * 14)) * 86400000);

        // Make some orders overdue (open orders with past due dates)
        const isOverdue = status === 'Open' && i <= 8;
        const adjustedDueDate = isOverdue
            ? new Date(now.getTime() - (1 + Math.floor(Math.random() * 10)) * 86400000)
            : dueDate;

        // Make some due today
        const isDueToday = status === 'Open' && i >= 9 && i <= 12;
        const todayDueDate = isDueToday ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0) : adjustedDueDate;

        const assignedDate = isAssigned ? new Date(orderedDate.getTime() + Math.random() * 2 * 86400000) : null;
        const completedDate = status.includes('Completed') || status === 'Submitted to Client' || status === 'Paid'
            ? new Date((assignedDate || orderedDate).getTime() + (2 + Math.floor(Math.random() * 5)) * 86400000)
            : null;
        const submittedDate = status === 'Submitted to Client' || status === 'Paid'
            ? new Date(completedDate!.getTime() + Math.random() * 2 * 86400000)
            : null;
        const paidDate = status === 'Paid'
            ? new Date(submittedDate!.getTime() + (5 + Math.floor(Math.random() * 20)) * 86400000)
            : null;

        const clientPay = 35 + Math.floor(Math.random() * 80);
        const inspectorPay = Math.floor(clientPay * (0.5 + Math.random() * 0.25));

        orders.push({
            orderNumber: `WO-${String(10000 + i).slice(1)}`,
            type,
            status,
            clientId: client.id,
            inspectorId: inspector?.id || null,
            qcUserId: status === 'Completed Pending Approval' ? qcManager.id : null,
            address1: `${streetNum} ${street}`,
            city: loc.city,
            state: loc.state,
            zip: loc.zip,
            county: loc.county,
            latitude: loc.lat + (Math.random() - 0.5) * 0.1,
            longitude: loc.lng + (Math.random() - 0.5) * 0.1,
            dueDate: todayDueDate,
            orderedDate,
            assignedDate,
            completedDate,
            submittedDate,
            paidDate,
            clientPay,
            inspectorPay,
            vacant: Math.random() > 0.7,
            photoRequired: Math.random() > 0.2,
            rushFlag: Math.random() > 0.85,
            mortgageCompany: mortgageCompanies[i % mortgageCompanies.length],
            loanNumber: `LN-${100000 + i}`,
            vendor: client.name,
            clientOrderNum: `${client.code}-${20000 + i}`,
            instructions: i % 3 === 0 ? 'Photograph all four sides of the property. Note any visible damage or maintenance issues.' : null,
            doorCardMessage: i % 5 === 0 ? 'Please contact borrower before visit.' : null,
            tags: i % 4 === 0 ? 'Priority,Follow-up' : i % 7 === 0 ? 'Review' : null,
            createdAt,
        });
    }

    // Use createMany for efficiency
    await prisma.workOrder.createMany({ data: orders as any });

    console.log(`  ✓ Created ${orders.length} work orders`);

    // ── History Entries ───────────────────────────────────────────────
    console.log('  Creating history entries...');

    const allOrders = await prisma.workOrder.findMany({
        select: { id: true, orderNumber: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });

    const historyActions = ['Order Created', 'Inspector Assigned', 'Status Updated', 'Photo Uploaded', 'Comment Added', 'Order Completed', 'QC Approved', 'Submitted to Client'];

    const historyEntries = [];
    for (const order of allOrders) {
        const numEntries = 1 + Math.floor(Math.random() * 4);
        for (let j = 0; j < numEntries; j++) {
            historyEntries.push({
                action: historyActions[j % historyActions.length],
                details: j === 0 ? `Order ${order.orderNumber} created` : null,
                user: j === 0 ? 'admin' : inspectors[j % inspectors.length].firstName + ' ' + inspectors[j % inspectors.length].lastName,
                orderId: order.id,
                createdAt: new Date(order.createdAt.getTime() + j * 3600000),
            });
        }
    }

    await prisma.historyEntry.createMany({ data: historyEntries });

    console.log(`  ✓ Created ${historyEntries.length} history entries`);

    // ── Comments ─────────────────────────────────────────────────────
    console.log('  Creating comments...');

    const sampleComments = [
        'Property appears occupied, vehicle in driveway.',
        'Unable to access backyard due to locked gate.',
        'Photos uploaded, awaiting QC review.',
        'Borrower was not home. Left door card.',
        'Roof damage noted on south side.',
        'Grass overgrown, possible vacancy indicators.',
        'All inspection requirements completed.',
        'Second attempt scheduled for next week.',
    ];

    const commentData = [];
    for (let i = 0; i < 30; i++) {
        const order = allOrders[i % allOrders.length];
        commentData.push({
            text: sampleComments[i % sampleComments.length],
            orderId: order.id,
            authorId: inspectors[i % inspectors.length].id,
            showInspector: i % 3 === 0,
            createdAt: new Date(order.createdAt.getTime() + (i + 1) * 7200000),
        });
    }

    await prisma.comment.createMany({ data: commentData });

    console.log(`  ✓ Created ${commentData.length} comments`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Admin:     admin / password123');
    console.log('  Inspector: mthompson / password123');
    console.log('  QC:        emartinez / password123');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
