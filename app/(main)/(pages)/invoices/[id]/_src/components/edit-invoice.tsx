import { useState } from 'react';
import { InvoiceWithMetadata } from '@/packages/lib/prisma/types';
import { Label } from '@/packages/lib/components/label';
import { Input } from '@/packages/lib/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Button } from '@/packages/lib/components/button';
import { Textarea } from '@/packages/lib/components/textarea';

interface EditInvoiceFormProps {
  invoice: InvoiceWithMetadata;
  onSubmit: (formData: Partial<InvoiceWithMetadata>) => void;
  onCancel: () => void;
}

export function EditInvoiceForm({ invoice, onSubmit, onCancel }: EditInvoiceFormProps) {
  const [formData, setFormData] = useState<Partial<InvoiceWithMetadata>>({
    invoiceNumber: invoice.invoiceNumber,
    type: invoice.type,
    amount: invoice.amount,
    status: invoice.status,
    dueDate: invoice.dueDate,
    notes: invoice.notes || '',
    paymentMethod: invoice.paymentMethod || undefined
  });

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="invoiceNumber">Invoice Number</Label>
        <Input id="invoiceNumber" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select invoice type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STANDARD">Standard</SelectItem>
            <SelectItem value="MILESTONE">Milestone</SelectItem>
            <SelectItem value="RECURRING">Recurring</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" value={Number(formData.amount)} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select invoice status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Input id="paymentMethod" name="paymentMethod" value={formData.paymentMethod || ''} onChange={handleChange} />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
