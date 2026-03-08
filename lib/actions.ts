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
    const inspectorPay = parseFloat(formData.get('inspectorPay') as string) || 0;
    const clientPay = parseFloat(formData.get('clientPay') as string) || 0;
    const instructions = formData.get('instructions') as string;

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
    const inspectorPay = parseFloat(formData.get('inspectorPay') as string) || 0;
    const clientPay = parseFloat(formData.get('clientPay') as string) || 0;
    const instructions = formData.get('instructions') as string;

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
                status: inspectorId ? 'Open' : 'Unassigned',
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

import { parse } from 'csv-parse/sync';

interface CSVRecord {
    OrderNumber?: string;
    Type?: string;
    Address1: string;
    City: string;
    State: string;
    Zip: string;
    ClientCode?: string;
    DueDate?: string;
    Instructions?: string;
    ClientPay?: string;
    InspectorPay?: string;
    County?: string;
    MortgageCompany?: string;
    LoanNumber?: string;
    Vacant?: string;
    PhotoRequired?: string;
}

export async function importOrdersCSV(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file || file.size === 0) return { error: 'No file provided' };

    try {
        const text = await file.text();
        const records = parse(text, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        }) as CSVRecord[];

        if (records.length === 0) return { error: 'CSV file is empty or invalid' };

        let successCount = 0;
        let errorCount = 0;

        // In a real production app, we would batch this with Prisma transactions.
        for (const record of records) {
            try {
                // Determine client if provided, otherwise leave null or use default
                let clientId = null;
                if (record.ClientCode) {
                    const client = await prisma.client.findUnique({ where: { code: record.ClientCode } });
                    if (client) clientId = client.id;
                }

                // Generate a unique order number if not provided
                const orderNumber = record.OrderNumber || `IMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                await prisma.workOrder.create({
                    data: {
                        orderNumber,
                        type: record.Type || 'Standard',
                        status: 'Open',
                        address1: record.Address1,
                        city: record.City,
                        state: record.State,
                        zip: record.Zip,
                        clientId: clientId,
                        dueDate: record.DueDate ? new Date(record.DueDate) : null,
                        instructions: record.Instructions || '',
                        clientPay: record.ClientPay ? parseFloat(record.ClientPay) : null,
                        inspectorPay: record.InspectorPay ? parseFloat(record.InspectorPay) : null,
                        county: record.County || null,
                        mortgageCompany: record.MortgageCompany || null,
                        loanNumber: record.LoanNumber || null,
                        vacant: record.Vacant?.toLowerCase() === 'true' || record.Vacant === '1',
                        photoRequired: record.PhotoRequired?.toLowerCase() !== 'false' && record.PhotoRequired !== '0',
                    }
                });

                await prisma.historyEntry.create({
                    data: {
                        action: 'Order Imported',
                        details: 'Imported via CSV bulk upload',
                        orderId: (await prisma.workOrder.findUnique({ where: { orderNumber } }))!.id
                    }
                });

                successCount++;
            } catch (err) {
                console.error(`Error importing record ${record.OrderNumber || 'unknown'}:`, err);
                errorCount++;
            }
        }

        revalidatePath('/orders');
        return { success: true, imported: successCount, failed: errorCount };
    } catch (error) {
        console.error('CSV import failed:', error);
        return { error: 'Failed to process CSV file. Ensure it is formatted correctly.' };
    }
}
