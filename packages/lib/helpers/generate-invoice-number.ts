export async function fetchUniqueInvoiceNumber(): Promise<string> {
  try {
    const response = await fetch('/api/invoice-number');

    if (!response.ok) {
      throw new Error('Failed to fetch invoice number');
    }

    const data = await response.json();
    return data.invoiceNumber;
  } catch (error) {
    console.error('Error fetching invoice number:', error);
    const timestamp = Date.now().toString().slice(-5);
    const randomPart = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');
    return `INV-${timestamp}${randomPart}`;
  }
}

export function generateTemporaryInvoiceNumber(prefix = 'INV-'): string {
  const numberPart = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, '0');
  return `${prefix}${numberPart}`;
}
