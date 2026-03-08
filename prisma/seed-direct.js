const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('🌱 Starting direct seed for root db:', dbPath);

db.pragma('foreign_keys = ON');

function seed() {
    db.prepare('DELETE FROM HistoryEntry').run();
    db.prepare('DELETE FROM Attachment').run();
    db.prepare('DELETE FROM Event').run();
    db.prepare('DELETE FROM Comment').run();
    db.prepare('DELETE FROM WorkOrder').run();
    db.prepare('DELETE FROM ClientLogin').run();
    db.prepare('DELETE FROM Client').run();
    db.prepare('DELETE FROM User').run();

    console.log('✅ Data cleared');

    // Insert Users
    const insertUser = db.prepare(`
        INSERT INTO User (id, username, password, email, firstName, lastName, role, phone, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const adminId = 'user_admin_1';
    insertUser.run(adminId, 'admin', 'changeme', 'admin@powerade.com', 'System', 'Admin', 'admin', '555-0100');

    const userId = 'user_josh_1';
    insertUser.run(userId, 'joshmoulton', 'hashed_password', 'josh@powerade.com', 'Josh', 'Moulton', 'admin', '555-0100');

    const inspector1Id = 'user_insp_1';
    insertUser.run(inspector1Id, 'rafael.felleto', 'hashed_password', 'rafael@powerade.com', 'Rafael', 'Felleto', 'inspector', '555-0101');

    const inspector2Id = 'user_insp_2';
    insertUser.run(inspector2Id, 'sarah.chen', 'hashed_password', 'sarah@powerade.com', 'Sarah', 'Chen', 'inspector', '555-0102');

    // Insert Clients
    const insertClient = db.prepare(`
        INSERT INTO Client (id, name, code, createdAt, updatedAt)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `);
    const insertClientLogin = db.prepare(`
        INSERT INTO ClientLogin (id, name, clientId)
        VALUES (?, ?, ?)
    `);

    const client1Id = 'client_1';
    insertClient.run(client1Id, 'Altisource-PPW', 'ALT-PPW');
    insertClientLogin.run('login_1', 'Altisource Portal', client1Id);

    const client2Id = 'client_2';
    insertClient.run(client2Id, 'SingleSource', 'SS');
    insertClientLogin.run('login_2', 'SingleSource Login', client2Id);

    // Insert Work Orders
    const insertOrder = db.prepare(`
        INSERT INTO WorkOrder (
            id, orderNumber, type, status, workCode, clientId, inspectorId, qcUserId,
            address1, city, state, zip, latitude, longitude,
            dueDate, orderedDate,
            inspectorPay, clientPay, clientPaid, vacant, photoRequired,
            loanNumber, mortgageCompany, instructions, tags,
            createdAt, updatedAt
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            datetime('now'), datetime('now')
        )
    `);

    insertOrder.run(
        'order_1', '109642801', 'Standard', 'Completed Approved', 'J100/INSP', client1Id, inspector1Id, adminId,
        'Lot 47 Black Rock Acres', 'Fort Defiance', 'AZ', '86504', 35.7323, -109.0602,
        '2026-03-10', '2026-02-28',
        35.00, 55.00, 1, 1, 1,
        '8010019019', 'Wells Fargo', 'Complete exterior photo inspection.', 'Vacant,FTV'
    );

    insertOrder.run(
        'order_2', '109643215', 'Interior', 'Open', 'J200/INSP', client2Id, inspector2Id, null,
        '1234 Oak Valley Dr', 'Springfield', 'MO', '65802', 37.2153, -93.2982,
        '2026-03-12', '2026-03-01',
        55.00, 85.00, 0, 0, 1,
        '7720034501', 'Chase Bank', 'Interior property inspection required.', 'Interior'
    );

    insertOrder.run(
        'order_3', '109643890', 'Contact', 'Unassigned', 'J300/INSP', client1Id, null, null,
        '5678 Maple Ln', 'Austin', 'TX', '78701', null, null,
        '2026-03-15', '2026-03-03',
        25.00, 40.00, 0, 0, 0,
        null, null, 'Attempt contact with borrower.', 'Rush'
    );

    console.log('✅ Direct seed completed successfully!');
}

try {
    seed();
} catch (err) {
    console.error('❌ Seed failed:', err);
} finally {
    db.close();
}
