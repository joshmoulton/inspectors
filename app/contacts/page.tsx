import prisma from '@/lib/prisma';
import ContactsClient from './ContactsClient';

export default function ContactsPage() {
    return (
        <ContactsLoader />
    );
}

// Server Component handles data fetching
async function ContactsLoader() {
    const contacts = await prisma.contact.findMany({
        orderBy: [
            { lastName: 'asc' },
            { firstName: 'asc' }
        ]
    });

    return <ContactsClient initialContacts={contacts} />;
}
