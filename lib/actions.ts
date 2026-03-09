'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createOrder(formData: FormData) {
    const orderNumber = formData.get('orderNumber') as string;
    const clientId = formData.get('clientId') as string;
    const type = formData.get('type') as string;
    const workCode = formData.get('workCode') as string;
    const address1 = formData.get('address1') as string;
    const address2 = formData.get('address2') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const zip = formData.get('zip') as string;
    const inspectorId = formData.get('inspectorId') as string || null;
    const dueDate = formData.get('dueDate') as string;
    const inspectorPay = Math.max(0, parseFloat(formData.get('inspectorPay') as string) || 0);
    const clientPay = Math.max(0, parseFloat(formData.get('clientPay') as string) || 0);
    const instructions = formData.get('instructions') as string;

    if (!orderNumber?.trim() || !clientId?.trim() || !address1?.trim() || !city?.trim() || !state?.trim() || !zip?.trim()) {
        throw new Error('Missing required fields');
    }

    try {
        const order = await prisma.workOrder.create({
            data: {
                orderNumber,
                clientId,
                type,
                workCode,
                address1,
                address2,
                city,
                state,
                zip,
                inspectorId: inspectorId === "" ? null : inspectorId,
                dueDate: dueDate ? new Date(dueDate) : null,
                inspectorPay,
                clientPay,
                instructions,
                status: inspectorId ? 'Open' : 'Unassigned',
            },
        });

        await prisma.historyEntry.create({
            data: {
                action: 'Order Created',
                details: `Order created by system`,
                orderId: order.id,
            },
        });

        revalidatePath('/orders');
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to create order:', error);
        throw new Error('Failed to create order');
    }

    redirect('/orders');
}

export async function updateOrder(id: string, formData: FormData) {
    const orderNumber = formData.get('orderNumber') as string;
    const clientId = formData.get('clientId') as string;
    const type = formData.get('type') as string;
    const workCode = formData.get('workCode') as string;
    const address1 = formData.get('address1') as string;
    const address2 = formData.get('address2') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const zip = formData.get('zip') as string;
    const inspectorId = formData.get('inspectorId') as string || null;
    const dueDate = formData.get('dueDate') as string;
    const inspectorPay = Math.max(0, parseFloat(formData.get('inspectorPay') as string) || 0);
    const clientPay = Math.max(0, parseFloat(formData.get('clientPay') as string) || 0);
    const instructions = formData.get('instructions') as string;
    const status = formData.get('status') as string;

    if (!orderNumber?.trim() || !clientId?.trim() || !address1?.trim() || !city?.trim() || !state?.trim() || !zip?.trim()) {
        throw new Error('Missing required fields');
    }

    try {
        await prisma.workOrder.update({
            where: { id },
            data: {
                orderNumber,
                clientId,
                type,
                workCode,
                address1,
                address2,
                city,
                state,
                zip,
                inspectorId: inspectorId === "" ? null : inspectorId,
                dueDate: dueDate ? new Date(dueDate) : null,
                inspectorPay,
                clientPay,
                instructions,
                status: status || (inspectorId ? 'Open' : 'Unassigned'),
            },
        });

        await prisma.historyEntry.create({
            data: {
                action: 'Order Updated',
                details: `Order updated via web interface`,
                orderId: id,
            },
        });

        revalidatePath(`/orders/${id}`);
        revalidatePath('/orders');
    } catch (error) {
        console.error('Failed to update order:', error);
        throw new Error('Failed to update order');
    }

    redirect(`/orders/${id}`);
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
        await prisma.workOrder.update({
            where: { id: orderId },
            data: { status: newStatus },
        });

        await prisma.historyEntry.create({
            data: {
                action: `Status Changed to ${newStatus}`,
                details: `Order status updated via web interface`,
                orderId,
            },
        });

        revalidatePath(`/orders/${orderId}`);
        revalidatePath('/orders');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update order status:', error);
        return { error: 'Failed to update order status' };
    }
}

import { auth } from '@/auth';

export async function addComment(orderId: string, text: string, showInspector: boolean) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized: You must be logged in to comment.' };
        }

        const comment = await prisma.comment.create({
            data: {
                text,
                showInspector,
                orderId,
                authorId: session.user.id,
            },
            include: {
                author: true
            }
        });

        revalidatePath(`/orders/${orderId}`);
        return { success: true, comment };
    } catch (error) {
        console.error('Failed to add comment:', error);
        return { error: 'Failed to post comment.' };
    }
}

import { createClient } from '@supabase/supabase-js';

export async function uploadPhotos(orderId: string, formData: FormData) {
    const files = formData.getAll('photos') as File[];

    if (!files || files.length === 0) return { error: 'No files provided' };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const attachments = [];

        for (const file of files) {
            const buffer = await file.arrayBuffer();
            const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const filePath = `orders/${orderId}/${filename}`;

            // Upload directly to Supabase cloud storage bucket
            const { data, error } = await supabase
                .storage
                .from('inspectors')
                .upload(filePath, buffer, {
                    contentType: file.type,
                    upsert: false
                });

            if (error) {
                console.error('Supabase storage upload error:', error);
                throw new Error('Failed to upload file to cloud storage.');
            }

            // Retrieve the public URL for the newly uploaded file
            const { data: publicUrlData } = supabase
                .storage
                .from('inspectors')
                .getPublicUrl(filePath);

            const attachment = await prisma.attachment.create({
                data: {
                    filename: file.name,
                    url: publicUrlData.publicUrl,
                    size: file.size,
                    type: file.type,
                    orderId: orderId,
                },
            });
            attachments.push(attachment);
        }

        await prisma.historyEntry.create({
            data: {
                action: 'Photos Uploaded',
                details: `Uploaded ${files.length} photos to cloud storage`,
                orderId: orderId,
            },
        });

        revalidatePath(`/orders/${orderId}`);
        return { success: true, count: files.length };
    } catch (error) {
        console.error('Photo upload failed:', error);
        return { error: 'Failed to upload photos to cloud storage' };
    }
}

export async function clearTestData() {
    try {
        const session = await auth();
        if (!session?.user || (session.user as any).role !== 'admin') {
            return { error: 'Unauthorized: Admin access required' };
        }

        // Delete in order to respect foreign key constraints
        await prisma.historyEntry.deleteMany({});
        await prisma.comment.deleteMany({});
        await prisma.event.deleteMany({});
        await prisma.attachment.deleteMany({});
        await prisma.workOrder.deleteMany({});

        revalidatePath('/');
        revalidatePath('/orders');
        return { success: true };
    } catch (error) {
        console.error('Clear test data error:', error);
        return { error: 'Failed to clear test data' };
    }
}

export async function bulkUpdateStatus(orderIds: string[], newStatus: string) {
    try {
        await prisma.workOrder.updateMany({
            where: { id: { in: orderIds } },
            data: { status: newStatus },
        });

        await prisma.historyEntry.createMany({
            data: orderIds.map(orderId => ({
                action: `Bulk Status Changed to ${newStatus}`,
                details: 'Updated via bulk action',
                orderId,
            })),
        });

        revalidatePath('/orders');
        revalidatePath('/');
        return { success: true, count: orderIds.length };
    } catch (error) {
        console.error('Bulk status update error:', error);
        return { error: 'Failed to update orders' };
    }
}

export async function bulkAssignInspector(orderIds: string[], inspectorId: string) {
    try {
        await prisma.workOrder.updateMany({
            where: { id: { in: orderIds } },
            data: { inspectorId, status: 'Open' },
        });

        const inspector = await prisma.user.findUnique({
            where: { id: inspectorId },
            select: { firstName: true, lastName: true },
        });

        await prisma.historyEntry.createMany({
            data: orderIds.map(orderId => ({
                action: 'Bulk Inspector Assignment',
                details: `Assigned to ${inspector?.firstName} ${inspector?.lastName}`,
                orderId,
            })),
        });

        revalidatePath('/orders');
        revalidatePath('/');
        return { success: true, count: orderIds.length };
    } catch (error) {
        console.error('Bulk assign error:', error);
        return { error: 'Failed to assign inspector' };
    }
}

