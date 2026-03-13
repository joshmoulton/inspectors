'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createUser(_prev: { errors?: Record<string, string> }, formData: FormData) {
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const role = formData.get('role') as string;
    const phone = formData.get('phone') as string;
    const password = 'changeme';

    const errors: Record<string, string> = {};
    if (!firstName?.trim()) errors.firstName = 'First name is required';
    if (!lastName?.trim()) errors.lastName = 'Last name is required';
    if (!username?.trim()) errors.username = 'Username is required';
    if (!email?.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address';
    if (Object.keys(errors).length > 0) return { errors };

    try {
        await prisma.user.create({
            data: { username, email, firstName, lastName, role, phone, password },
        });
        revalidatePath('/users');
    } catch (error) {
        console.error('Failed to create user:', error);
        return { errors: { _form: 'Failed to create user. Username may already exist.' } };
    }
    redirect('/users?saved=1');
}

export async function updateUser(id: string, _prev: { errors?: Record<string, string> }, formData: FormData) {
    const email = formData.get('email') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const role = formData.get('role') as string;
    const phone = formData.get('phone') as string;
    const active = formData.get('active') === 'true';

    const errors: Record<string, string> = {};
    if (!firstName?.trim()) errors.firstName = 'First name is required';
    if (!lastName?.trim()) errors.lastName = 'Last name is required';
    if (Object.keys(errors).length > 0) return { errors };

    try {
        await prisma.user.update({
            where: { id },
            data: { email, firstName, lastName, role, phone, active },
        });
        revalidatePath('/users');
        revalidatePath(`/users/${id}`);
    } catch (error) {
        console.error('Failed to update user:', error);
        return { errors: { _form: 'Failed to update user.' } };
    }
    redirect(`/users/${id}?saved=1`);
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
