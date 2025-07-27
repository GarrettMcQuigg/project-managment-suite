import { db } from '../prisma/client';
import { getCurrentUser } from './get-current-user';

export async function getInvoiceList() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  try {
    const invoices = await db.invoice.findMany({
      where: {
        userId: currentUser.id
      },
      include: {
        project: true,
        checkpoint: true,
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
