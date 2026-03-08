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
    try {
        contacts = await prisma.contact.findMany({
            orderBy: [
                { lastName: 'asc' },
                { firstName: 'asc' }
            ]
        });
    } catch {
        // Fallback to empty contacts on DB error
    }

    return <ContactsClient initialContacts={contacts} />;
}
