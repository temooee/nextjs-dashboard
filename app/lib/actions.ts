'use server';
import { z } from 'zod'
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {LatestInvoice} from "@/app/lib/definitions";


const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer'
  }),
  amount: z.coerce.number().gt(0,{message: 'Please enter an amount greater than $0'}),
  status: z.enum(['pending', 'paid'], {invalid_type_error: 'Please select an invoice status'}),
  date: z.string(),
})
const CreateInvoice = FormSchema.omit({id: true, date: true})
const UpdateInvoice = FormSchema.omit({id: true, date: true})

//Create Invoice State Type
export type State = {
  errors?: {
    customerId?: string[],
    amount?: string[],
    status?: string[],
  }
  message?: string | null
}


// Create Invoices
export async function createInvoice(prevState: State, formData:FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  if(!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create invoice'
    }
  }

  const {customerId, amount, status} = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  try {
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

