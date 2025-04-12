// InvoiceStep.tsx
import React, { useState, useEffect } from 'react';
import { Trash2, Pencil, CalendarIcon } from 'lucide-react';
import { Button } from '@/packages/lib/components/button';
import { Input } from '@/packages/lib/components/input';
import { FormLabel } from '@/packages/lib/components/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Textarea } from '@/packages/lib/components/textarea';
import { Card } from '@/packages/lib/components/card';
import { InvoiceType, InvoiceStatus, Invoice } from '@prisma/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/packages/lib/components/popover';
import { Calendar } from '@/packages/lib/components/calendar';
import { fetchUniqueInvoiceNumber, generateTemporaryInvoiceNumber } from '@/packages/lib/helpers/generate-invoice-number';

type NewInvoice = {
  id: string;
  projectId: string;
  invoiceNumber: string;
  type: InvoiceType;
  amount: string;
  status: InvoiceStatus;
  dueDate: Date;
  notifyClient: boolean;
  notes: string | null;
  phaseId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface InvoiceStepProps {
  invoices: Invoice[];
  onInvoicesChange: (invoices: Invoice[]) => void;
  phases: Array<{ id: string; name: string }>;
}

interface InvoiceCardProps {
  invoice: Invoice;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onEdit, onDelete }) => {
  return (
    <Card className="relative group bg-background/50 border border-foreground/20 rounded-lg p-4">
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onEdit(invoice)}
          className="h-6 w-6 bg-background rounded-medium text-muted-foreground hover:text-foreground shadow-sm"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(invoice.id)}
          className="h-6 w-6 bg-background rounded-medium text-red-500 hover:text-red-600 shadow-sm"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <span className="font-medium">{invoice.invoiceNumber}</span>
          <span className="text-sm text-muted-foreground">${Number(invoice.amount).toFixed(2)}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {invoice.type.replace('_', ' ')} - Due: {new Date(invoice.dueDate).toLocaleDateString()}
        </div>
        {invoice.notes && <div className="text-xs text-muted-foreground mt-1">{invoice.notes}</div>}
      </div>
    </Card>
  );
};

const InvoiceStep: React.FC<InvoiceStepProps> = ({ invoices, onInvoicesChange, phases }) => {
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<NewInvoice>(createEmptyInvoice());
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);

  function createEmptyInvoice(): NewInvoice {
    return {
      id: Date.now().toString(),
      projectId: '',
      invoiceNumber: generateTemporaryInvoiceNumber(),
      type: InvoiceType.STANDARD,
      amount: '',
      status: InvoiceStatus.DRAFT,
      dueDate: new Date(),
      notifyClient: false,
      notes: '',
      phaseId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  useEffect(() => {
    if (!editingInvoiceId && !isGeneratingNumber) {
      setIsGeneratingNumber(true);
      fetchUniqueInvoiceNumber()
        .then((uniqueNumber) => {
          setActiveInvoice((prev) => ({
            ...prev,
            invoiceNumber: uniqueNumber
          }));
        })
        .catch((error) => {
          console.error('Error fetching invoice number:', error);
        })
        .finally(() => {
          setIsGeneratingNumber(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingInvoiceId]);

  const handleInvoicePublish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let updatedInvoices: Invoice[];
    if (editingInvoiceId) {
      updatedInvoices = invoices.map((inv) => (inv.id === editingInvoiceId ? (activeInvoice as Invoice) : inv));
    } else {
      updatedInvoices = [...invoices, activeInvoice as Invoice];
    }

    onInvoicesChange(updatedInvoices);

    setEditingInvoiceId(null);
    const newEmptyInvoice = createEmptyInvoice();
    setActiveInvoice(newEmptyInvoice);

    setIsGeneratingNumber(true);
    fetchUniqueInvoiceNumber()
      .then((uniqueNumber) => {
        setActiveInvoice((prev) => ({
          ...prev,
          invoiceNumber: uniqueNumber
        }));
      })
      .catch((error) => {
        console.error('Error fetching invoice number:', error);
      })
      .finally(() => {
        setIsGeneratingNumber(false);
      });
  };

  const handleEdit = (invoice: Invoice) => {
    setActiveInvoice({
      ...invoice,
      projectId: invoice.projectId || '',
      amount: invoice.amount || '',
      notifyClient: invoice.notifyClient ?? false
    });
    setEditingInvoiceId(invoice.id);
  };

  const handleDelete = (id: string) => {
    onInvoicesChange(invoices.filter((inv) => inv.id !== id));
  };

  const toggleNotify = (invoice: NewInvoice) => {
    setActiveInvoice((prev) => ({
      ...prev,
      notifyClient: !prev.notifyClient
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium">Project Invoices</h3>
          {invoices.length > 0 && <div className="text-xs opacity-55">Hover over an invoice to edit or delete it.</div>}
        </div>

        {invoices.length > 0 && (
          <div className="grid gap-3">
            {invoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <Card className="p-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Invoice Type</FormLabel>
              <Select value={activeInvoice.type} onValueChange={(value: InvoiceType) => setActiveInvoice({ ...activeInvoice, type: value })}>
                <SelectTrigger className="border-foreground/20">
                  <SelectValue placeholder="Select invoice type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={InvoiceType.STANDARD}>Standard</SelectItem>
                  <SelectItem value={InvoiceType.MILESTONE}>Milestone</SelectItem>
                  <SelectItem value={InvoiceType.ADDITIONAL}>Additional Work</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <FormLabel>Amount</FormLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">$</span>
                <Input
                  type="number"
                  value={Number(activeInvoice.amount)}
                  onChange={(e) => setActiveInvoice({ ...activeInvoice, amount: e.target.value || '' })}
                  className="pl-8 border-foreground/20"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start text-left font-normal border-foreground/20">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {new Date(activeInvoice.dueDate).toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={activeInvoice.dueDate} onSelect={(date) => date && setActiveInvoice({ ...activeInvoice, dueDate: date })} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <FormLabel>Related Phase</FormLabel>
              <Select value={activeInvoice.phaseId || '_none'} onValueChange={(value) => setActiveInvoice({ ...activeInvoice, phaseId: value === '_none' ? null : value })}>
                <SelectTrigger className="border-foreground/20">
                  <SelectValue placeholder="Select related phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {phases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-w-fit cursor-pointer" onClick={() => toggleNotify(activeInvoice)}>
            <FormLabel htmlFor="notifyClient">Notify Client</FormLabel>
            <div className="flex items-center">
              <input
                id="notifyClient"
                type="checkbox"
                checked={activeInvoice.notifyClient}
                onChange={(e) => setActiveInvoice({ ...activeInvoice, notifyClient: e.target.checked })}
                className="h-4 w-4 rounded border-foreground/20 text-primary focus:ring-primary"
                disabled={isGeneratingNumber}
              />
              <span className="ml-2 text-sm text-muted-foreground">Send email notification when invoice is created</span>
            </div>
          </div>

          <div>
            <FormLabel>Notes</FormLabel>
            <Textarea
              value={activeInvoice.notes || ''}
              onChange={(e) => setActiveInvoice({ ...activeInvoice, notes: e.target.value })}
              className="border-foreground/20"
              placeholder="Add any invoice-related notes here..."
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button type="button" variant="outlinePrimary" onClick={handleInvoicePublish} className="w-full sm:w-auto" disabled={isGeneratingNumber}>
              {editingInvoiceId ? 'Update' : 'Add'} Invoice
              {isGeneratingNumber && !editingInvoiceId && ' (Generating Number...)'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceStep;
