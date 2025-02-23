import { db } from '../prisma/client';
import { getCurrentUser } from './get-current-user';

export async function getInvoiceList() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  try {
    const invoices = await db.invoice.findMany({
      include: {
        project: true,
        phase: true,
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return invoices;
  } catch (error: unknown) {
    console.error('Failed to fetch invoices:', error);
    return null;
  }
}
