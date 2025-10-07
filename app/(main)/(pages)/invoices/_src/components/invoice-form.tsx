'use client';

import { useState, useEffect } from 'react';
import { InvoiceWithMetadata } from '@/packages/lib/prisma/types';
import { Label } from '@/packages/lib/components/label';
import { Input } from '@/packages/lib/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Button } from '@/packages/lib/components/button';
import { Textarea } from '@/packages/lib/components/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { InvoiceStatus, InvoiceType } from '@prisma/client';
import { fetchUniqueInvoiceNumber, generateTemporaryInvoiceNumber } from '@/packages/lib/helpers/generate-invoice-number';
import { useStripeAccount } from '@/packages/lib/hooks/use-stripe-account';
import { Loader2, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form } from '@/packages/lib/components/form';
import { ClientFormValues } from '../../../clients/[id]/_src/types';
import InvoiceClientStep from './invoice-client-step';

interface FormDataWithStringAmount extends Omit<Partial<InvoiceWithMetadata>, 'amount'> {
  amount?: string;
}

interface InvoiceWorkflowData {
  invoiceNumber?: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
  dueDate?: Date;
  notes?: string | null;
  amount?: string;
  notifyClient?: boolean;
  projectId?: string;
  client: ClientFormValues;
}

interface InvoiceFormProps {
  invoice?: InvoiceWithMetadata;
  isOpen: boolean;
  onSubmit: (formData: InvoiceWorkflowData) => void;
  onCancel: () => void;
}

const defaultInvoice: FormDataWithStringAmount = {
  invoiceNumber: '',
  type: InvoiceType.STANDARD,
  status: InvoiceStatus.DRAFT,
  dueDate: new Date(),
  notes: '',
  amount: '',
  notifyClient: false
};

export function InvoiceForm({ invoice, isOpen, onSubmit, onCancel }: InvoiceFormProps) {
  const isEditMode = !!invoice;
  const { isLoading, refetch } = useStripeAccount();
  const [currentStep, setCurrentStep] = useState<'invoice' | 'client'>('invoice');
  const [formData, setFormData] = useState<FormDataWithStringAmount>({
    invoiceNumber: '',
    type: InvoiceType.STANDARD,
    amount: '',
    status: InvoiceStatus.DRAFT,
    dueDate: new Date(),
    notes: '',
    notifyClient: false
  });
  const [isLoadingNumber, setIsLoadingNumber] = useState(false);
  const [isClientStepValid, setIsClientStepValid] = useState(false);
  const [clearClientForms, setClearClientForms] = useState(false);

  const clientForm = useForm<InvoiceWorkflowData>({
    defaultValues: {
      client: {
        name: '',
        email: '',
        phone: ''
      }
    }
  });

  const handleGenerateInvoiceNumber = () => {
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
  };

  useEffect(() => {
    if (isOpen) {
      // Automatically fetch Stripe account status when dialog opens
      refetch();

      setCurrentStep('invoice');
      if (isEditMode && invoice) {
        setFormData({
          ...invoice,
          amount: invoice.amount ? invoice.amount.toString() : ''
        });
        // Set client data in the form
        if (invoice.client) {
          clientForm.setValue('client', {
            id: invoice.client.id,
            name: invoice.client.name,
            email: invoice.client.email,
            phone: invoice.client.phone
          });
        }
      } else {
        setFormData({
          ...defaultInvoice,
          invoiceNumber: generateTemporaryInvoiceNumber()
        });
        // Reset client form
        clientForm.reset({
          client: {
            name: '',
            email: '',
            phone: ''
          }
        });

        // Auto-generate invoice number for new invoices
        handleGenerateInvoiceNumber();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditMode, invoice, clientForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      // Remove any non-numeric characters except decimal point
      const numericValue = value.replace(/[^0-9.]/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else if (name === 'dueDate') {
      setFormData((prev) => ({ ...prev, [name]: new Date(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('client');
  };

  const handleBack = () => {
    setCurrentStep('invoice');
    setClearClientForms(true);
    setTimeout(() => setClearClientForms(false), 0);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const clientData = clientForm.getValues('client');

    const submitData: InvoiceWorkflowData = {
      ...formData,
      notifyClient: formData.notifyClient || false,
      projectId: undefined,
      client: clientData
    };

    onSubmit(submitData);
  };

  const getDialogTitle = () => {
    if (isEditMode) return 'Edit Invoice';
    if (currentStep === 'invoice') return 'Create New Invoice';
    return 'Select Client';
  };

  const dialogTitle = getDialogTitle();
  const isFormDisabled = false; // Removed Stripe verification requirement

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
        ) : null}
        {/* Stripe connection card - temporarily disabled */}
        {/* {stripeAccount.status !== 'VERIFIED' ? (
          <Card className="p-4 bg-yellow-50 border-yellow-200 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link2 className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {stripeAccount.status === 'NOT_CONNECTED' ? 'Connect your Stripe account to create invoices' : 'Complete your Stripe account setup'}
                  </p>
                  <p className="text-xs text-yellow-700">
                    {stripeAccount.status === 'NOT_CONNECTED' ? 'You need to link a Stripe account to generate invoices' : 'Your account is currently pending verification'}
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
        ) : null} */}
        {currentStep === 'invoice' && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <div className="flex gap-2">
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  placeholder="Enter or generate invoice number"
                  className="flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateInvoiceNumber}
                  className="shrink-0"
                  disabled={isLoadingNumber}
                >
                  <RefreshCw className={isLoadingNumber ? 'animate-spin' : ''} />
                  Generate
                </Button>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="type">Type</Label>
                <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange('type', value)} disabled={isFormDisabled}>
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
              <div className="flex-1">
                <Label htmlFor="status">Status</Label>
                <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)} disabled={isFormDisabled}>
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
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    name="amount"
                    type="text"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={handleChange}
                    className="pl-7"
                    disabled={isFormDisabled}
                    required
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} disabled={isFormDisabled} />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="notifyClient">Notify Client</Label>
              <div className="flex items-center cursor-pointer" onClick={() => setFormData((prev) => ({ ...prev, notifyClient: !prev.notifyClient }))}>
                <input
                  id="notifyClient"
                  name="notifyClient"
                  type="checkbox"
                  className="cursor-pointer"
                  checked={formData.notifyClient || false}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notifyClient: e.target.checked }))}
                />
                <span className="ml-2 text-sm text-muted-foreground">Send email notification when invoice is created</span>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="ghost" disabled={!isEditMode && isLoadingNumber}>
                {isEditMode ? 'Save Changes' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        )}

        {currentStep === 'client' && (
          <Form {...clientForm}>
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <InvoiceClientStep form={clientForm} onValidationChange={setIsClientStepValid} clearForms={clearClientForms} />
              <div className="flex justify-between mt-6">
                <Button type="button" variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  variant={isClientStepValid ? 'default' : 'ghost'}
                  className={isClientStepValid ? 'bg-teal-500 hover:bg-teal-600 text-white transition-colors' : ''}
                  disabled={!isClientStepValid}
                >
                  Create Invoice
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
