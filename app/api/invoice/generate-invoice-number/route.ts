import { NextResponse } from 'next/server';
import { db } from '@/packages/lib/prisma/client';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { handleError, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';

async function generateUniqueInvoiceNumber(prefix = 'INV-'): Promise<string> {
  const generateSevenDigitNumber = (): string => {
    const randomNum = Math.floor(Math.random() * 10000000);
    return randomNum.toString().padStart(7, '0');
  };

  let isUnique = false;
  let newInvoiceNumber = '';
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    attempts++;
    const numberPart = generateSevenDigitNumber();
    newInvoiceNumber = `${prefix}${numberPart}`;

    const existingInvoice = await db.invoice.findFirst({
      where: {
        invoiceNumber: newInvoiceNumber
      }
    });

    isUnique = !existingInvoice;
  }

  if (!isUnique) {
    const timestamp = Date.now().toString().slice(-4);
    const randomPart = generateSevenDigitNumber().slice(0, 3);
    newInvoiceNumber = `${prefix}${timestamp}${randomPart}`;
  }

  return newInvoiceNumber;
}

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return handleUnauthorized();
  }

  try {
    const invoiceNumber = await generateUniqueInvoiceNumber();
    return NextResponse.json({ invoiceNumber });
  } catch (error) {
    console.error('Error generating invoice number:', error);
    return handleError({ message: 'Failed to generate invoice number', err: error });
  }
}
