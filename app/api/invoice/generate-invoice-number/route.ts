import { NextResponse } from 'next/server';
import { db } from '@/packages/lib/prisma/client';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';

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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const invoiceNumber = await generateUniqueInvoiceNumber();
    return NextResponse.json({ invoiceNumber });
  } catch (error) {
    console.error('Error generating invoice number:', error);
    return NextResponse.json({ error: 'Failed to generate invoice number' }, { status: 500 });
  }
}
