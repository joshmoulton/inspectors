'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createContact(formData: FormData) {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string || null;
    const phone = formData.get('phone') as string || null;
    const title = formData.get('title') as string || null;
    const company = formData.get('company') as string || null;
    const notes = formData.get('notes') as string || null;

    try {
        await prisma.contact.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                title,
                company,
                notes,
            }
        });
        revalidatePath('/contacts');
        return { success: true };
    } catch (error) {
        console.error('Failed to create contact:', error);
        return { error: 'Failed to create contact' };
    }
}

export async function updateContact(id: string, formData: FormData) {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string || null;
    const phone = formData.get('phone') as string || null;
    const title = formData.get('title') as string || null;
    const company = formData.get('company') as string || null;
    const notes = formData.get('notes') as string || null;

    try {
        await prisma.contact.update({
            where: { id },
            data: {
                firstName,
                lastName,
                email,
                phone,
                title,
                company,
                notes,
            }
        });
        revalidatePath('/contacts');
        return { success: true };
    } catch (error) {
        console.error('Failed to update contact:', error);
        return { error: 'Failed to update contact' };
    }
}

export async function deleteContact(id: string) {
    try {
        await prisma.contact.delete({
            where: { id }
        });
        revalidatePath('/contacts');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete contact:', error);
        return { error: 'Failed to delete contact' };
    }
}
