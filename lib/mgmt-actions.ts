'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createUser(formData: FormData) {
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const role = formData.get('role') as string;
    const phone = formData.get('phone') as string;
    // Hashed password would go here in real app
    const password = 'changeme';

    try {
        await prisma.user.create({
            data: {
                username,
                email,
                firstName,
                lastName,
                role,
                phone,
                password,
            },
        });
        revalidatePath('/users');
    } catch (error) {
        console.error('Failed to create user:', error);
        throw new Error('Failed to create user');
    }
    redirect('/users');
}

export async function updateUser(id: string, formData: FormData) {
    const email = formData.get('email') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const role = formData.get('role') as string;
    const phone = formData.get('phone') as string;
    const active = formData.get('active') === 'true';

    try {
        await prisma.user.update({
            where: { id },
            data: { email, firstName, lastName, role, phone, active },
        });
        revalidatePath('/users');
        revalidatePath(`/users/${id}`);
    } catch (error) {
        console.error('Failed to update user:', error);
        throw new Error('Failed to update user');
    }
    redirect(`/users/${id}`);
}

export async function createClient(formData: FormData) {
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;

    try {
        await prisma.client.create({
            data: { name, code },
        });
        revalidatePath('/clients');
    } catch (error) {
        console.error('Failed to create client:', error);
        throw new Error('Failed to create client');
    }
    redirect('/clients');
}
