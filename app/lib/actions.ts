'use server';
import { z } from 'zod'
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {LatestInvoice} from "@/app/lib/definitions";


const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
})
const CreateInvoice = FormSchema.omit({id: true, date: true})
const UpdateInvoice = FormSchema.omit({id: true, date: true})

// Create Invoices
export async function createInvoice(formData:FormData) {
  try {
    const {customerId, amount, status} = CreateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    })
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    await sql `
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`

  } catch (error) {
    return{
      message: 'Something went wrong. Failed to create the invoice. Please check again'
  }
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

//Update invoices
export async function updateInvoice (id: string, formData:FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;

 try {
   await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}`;
 } catch (error) {
   return {
     message: 'Something went wrong. Failed to update the invoice. Please try again',
   }
 }

  revalidatePath('/dashboard/invoices');
  redirect(`/dashboard/invoices/`);
}

//delete invoices

export async function deleteInvoice (id: string) {
  try {
    await sql`
  DELETE FROM invoices
  WHERE id = ${id}`

  } catch (error) {
    return{
      message: 'Something went wrong. Failed to delete the invoice. Please try again.'
    }
  }
  revalidatePath('/dashboard/invoices');
}

