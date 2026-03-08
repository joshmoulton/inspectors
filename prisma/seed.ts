import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
    console.log('🌱 Starting seed with Postgres...');

    const hashedPassword = await bcrypt.hash('changeme', 10);

    // Clear existing data
    await prisma.historyEntry.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.event.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.workOrder.deleteMany();
    await prisma.clientLogin.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Data cleared');

    // Create Users
    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            password: hashedPassword,
            email: 'admin@powerade.com',
            firstName: 'System',
            lastName: 'Admin',
            role: 'admin',
            phone: '555-0100',
        },
    });

    const inspector1 = await prisma.user.create({
        data: {
            username: 'rafael.felleto',
            password: hashedPassword,
            email: 'rafael@powerade.com',
            firstName: 'Rafael',
            lastName: 'Felleto',
            role: 'inspector',
            phone: '555-0101',
        },
    });

    const inspector2 = await prisma.user.create({
        data: {
            username: 'sarah.chen',
            password: hashedPassword,
            email: 'sarah@powerade.com',
            firstName: 'Sarah',
            lastName: 'Chen',
            role: 'inspector',
            phone: '555-0102',
        },
    });

    const inspector3 = await prisma.user.create({
        data: {
            username: 'marcus.johnson',
            password: hashedPassword,
            email: 'marcus@powerade.com',
            firstName: 'Marcus',
            lastName: 'Johnson',
            role: 'inspector',
            phone: '555-0103',
        },
    });

    const manager = await prisma.user.create({
        data: {
            username: 'lisa.wang',
            password: hashedPassword,
            email: 'lisa@powerade.com',
            firstName: 'Lisa',
            lastName: 'Wang',
            role: 'manager',
            phone: '555-0104',
        },
    });

    // Create Clients
    const client1 = await prisma.client.create({
        data: {
            name: 'Altisource-PPW',
            code: 'ALT-PPW',
            logins: { create: { name: 'Altisource Portal' } },
        },
    });

    const client2 = await prisma.client.create({
        data: {
            name: 'SingleSource',
            code: 'SS',
            logins: { create: { name: 'SingleSource Login' } },
        },
    });

    const client3 = await prisma.client.create({
        data: {
            name: 'Safeguard Properties',
            code: 'SGP',
            logins: { create: { name: 'Safeguard Portal' } },
        },
    });

    const client4 = await prisma.client.create({
        data: {
            name: 'MCS Industries',
            code: 'MCS',
            logins: { create: { name: 'MCS Main' } },
        },
    });

    // Create Work Orders
    const ordersData = [
        {
            orderNumber: '109642801',
            type: 'Standard',
            status: 'Completed Approved',
            workCode: 'J100/INSP: Exterior Inspection',
            clientId: client1.id,
            inspectorId: inspector1.id,
            qcUserId: admin.id,
            address1: 'Lot 47 Black Rock Acres',
            city: 'Fort Defiance',
            state: 'AZ',
            zip: '86504',
            county: 'Apache',
            latitude: 35.7323,
            longitude: -109.0602,
            dueDate: new Date('2026-03-10'),
            orderedDate: new Date('2026-02-28'),
            completedDate: new Date('2026-03-05'),
            inspectorPay: 35.00,
            clientPay: 55.00,
            clientPaid: true,
            vacant: true,
            photoRequired: true,
            loanNumber: '8010019019',
            mortgageCompany: 'Wells Fargo',
            instructions: 'Complete exterior photo inspection. Document all four sides plus street view. Check for vacancy indicators.',
            tags: 'Vacant,FTV',
        },
        {
            orderNumber: '109643215',
            type: 'Interior',
            status: 'Open',
            workCode: 'J200/INSP: Interior Inspection',
            clientId: client2.id,
            inspectorId: inspector2.id,
            address1: '1234 Oak Valley Dr',
            city: 'Springfield',
            state: 'MO',
            zip: '65802',
            latitude: 37.2153,
            longitude: -93.2982,
            dueDate: new Date('2026-03-12'),
            orderedDate: new Date('2026-03-01'),
            inspectorPay: 55.00,
            clientPay: 85.00,
            photoRequired: true,
            loanNumber: '7720034501',
            mortgageCompany: 'Chase Bank',
            instructions: 'Interior property inspection required. Document all rooms, appliances, and any damage. Lockbox code: 4523.',
        },
        {
            orderNumber: '109643890',
            type: 'Contact',
            status: 'Unassigned',
            workCode: 'J300/INSP: Contact Inspection',
            clientId: client3.id,
            address1: '5678 Maple Ln',
            city: 'Austin',
            state: 'TX',
            zip: '78701',
            dueDate: new Date('2026-03-15'),
            orderedDate: new Date('2026-03-03'),
            inspectorPay: 25.00,
            clientPay: 40.00,
            rushFlag: true,
            instructions: 'Attempt contact with borrower. Leave door card if no answer.',
            tags: 'Rush',
        },
    ];

    for (const order of ordersData) {
        await prisma.workOrder.create({ data: order });
    }

    const allOrders = await prisma.workOrder.findMany();

    await prisma.comment.createMany({
        data: [
            { text: 'Order received and assigned.', showInspector: true, authorId: admin.id, orderId: allOrders[0].id },
            { text: 'Photos uploaded successfully.', showInspector: false, authorId: inspector1.id, orderId: allOrders[0].id },
            { text: 'Inspection approved. Good quality photos.', showInspector: true, authorId: admin.id, orderId: allOrders[0].id },
        ],
    });

    console.log('✅ Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
