import prisma from '@/lib/prisma';
import ContactsClient from './ContactsClient';

export default function ContactsPage() {
    return (
        <ContactsLoader />
    );
}

// Server Component handles data fetching
async function ContactsLoader() {
    let contacts: any[] = [];
    let clients: { id: string; name: string }[] = [];
    try {
        [contacts, clients] = await Promise.all([
            prisma.contact.findMany({
                include: { client: { select: { id: true, name: true } } },
                orderBy: [
                    { lastName: 'asc' },
                    { firstName: 'asc' }
                ],
            }),
            prisma.client.findMany({
                select: { id: true, name: true },
                orderBy: { name: 'asc' },
            }),
        ]);
    } catch {
        // Fallback to empty on DB error
    }

    return <ContactsClient initialContacts={contacts} clients={clients} />;
}
