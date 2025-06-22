'use client';

import { useState, useEffect } from 'react';
import { InvoiceWithMetadata } from '@/packages/lib/prisma/types';
import { Label } from '@/packages/lib/components/label';
import { Input } from '@/packages/lib/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Button } from '@/packages/lib/components/button';
import { Textarea } from '@/packages/lib/components/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/packages/lib/components/dialog';
import { Card } from '@/packages/lib/components/card';
import { InvoiceStatus, InvoiceType } from '@prisma/client';
import { fetchUniqueInvoiceNumber, generateTemporaryInvoiceNumber } from '@/packages/lib/helpers/generate-invoice-number';
import { useStripeAccount } from '@/packages/lib/hooks/use-stripe-account';
import { Loader2, Link2 } from 'lucide-react';

interface FormDataWithStringAmount extends Omit<Partial<InvoiceWithMetadata>, 'amount'> {
  amount?: string;
}

interface InvoiceFormProps {
  invoice?: InvoiceWithMetadata;
  isOpen: boolean;
  onSubmit: (formData: FormDataWithStringAmount) => void;
  onCancel: () => void;
}

const defaultInvoice: FormDataWithStringAmount = {
  invoiceNumber: '',
  type: InvoiceType.STANDARD,
  status: InvoiceStatus.DRAFT,
  dueDate: new Date(),
  notes: '',
  paymentMethod: null
};

export function InvoiceForm({ invoice, isOpen, onSubmit, onCancel }: InvoiceFormProps) {
  const isEditMode = !!invoice;
  const { stripeAccount, isLoading, connectStripeAccount } = useStripeAccount();
  const [formData, setFormData] = useState<FormDataWithStringAmount>({
    invoiceNumber: '',
    type: InvoiceType.STANDARD,
    amount: '',
    status: InvoiceStatus.DRAFT,
    dueDate: new Date(),
    notes: '',
    paymentMethod: null
  });
  const [isLoadingNumber, setIsLoadingNumber] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && invoice) {
        setFormData({
          ...invoice,
          amount: invoice.amount ? invoice.amount.toString() : ''
        });
      } else {
        setFormData({
          ...defaultInvoice,
          invoiceNumber: generateTemporaryInvoiceNumber()
        });

        setIsLoadingNumber(true);
        fetchUniqueInvoiceNumber()
          .then((uniqueNumber: string) => {
            setFormData((prev) => ({
              ...prev,
              invoiceNumber: uniqueNumber
            }));
          })
          .catch((error: unknown) => {
            console.error('Error fetching unique invoice number:', error);
          })
          .finally(() => {
            setIsLoadingNumber(false);
          });
      }
    }
  }, [isOpen, isEditMode, invoice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const dialogTitle = isEditMode ? 'Edit Invoice' : 'Create New Invoice';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : stripeAccount.status !== 'VERIFIED' ? (
          <Card className="p-4 bg-yellow-50 border-yellow-200 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link2 className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {stripeAccount.status === 'NOT_CONNECTED'
                      ? 'Connect your Stripe account to create invoices'
                      : 'Complete your Stripe account setup'}
                  </p>
                  <p className="text-xs text-yellow-700">
                    {stripeAccount.status === 'NOT_CONNECTED'
                      ? 'You need to link a Stripe account to generate invoices'
                      : 'Your account is currently pending verification'}
                  </p>
                </div>
              </div>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  connectStripeAccount();
                }}
                disabled={isLoading}
                variant="outline"
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Stripe'
                )}
              </Button>
            </div>
          </Card>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              disabled
              placeholder={isLoadingNumber ? 'Generating unique invoice number...' : ''}
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select invoice type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InvoiceType.STANDARD}>Standard</SelectItem>
                <SelectItem value={InvoiceType.MILESTONE}>Milestone</SelectItem>
                <SelectItem value="RECURRING">Recurring</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select invoice status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InvoiceStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={InvoiceStatus.SENT}>Sent</SelectItem>
                <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
                <SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Input id="paymentMethod" name="paymentMethod" value={formData.paymentMethod || ''} onChange={handleChange} />
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isEditMode && isLoadingNumber}>
              {isEditMode ? 'Save Changes' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
