'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { Button } from '@/packages/lib/components/button';
import { Form } from '@/packages/lib/components/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ProjectStatus, Phase, ProjectPayment, PaymentSchedule } from '@prisma/client';
import { projectFormSchema } from '../(pages)/projects/[id]/_src/types';
import TimelineStep from './components/timeline-step';
import ClientStep from './components/client-step';
import ProjectDetailsStep, { ProjectFormData } from './components/project-step';
import PaymentStep from './components/payment-step';

interface StepIndicatorProps {
  currentStep: number;
}

export interface ProjectPaymentFormData {
  totalAmount: number;
  depositRequired: number | undefined;
  depositDueDate: Date | undefined;
  paymentSchedule: string;
  paymentTerms: string | undefined;
  notes: string | undefined;
}

interface UnifiedProjectWorkflowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: ProjectFormData & { phases: Phase[]; payment: ProjectPaymentFormData }) => void;
  mode?: 'create' | 'edit';
  defaultValues?: {
    project?: ProjectFormData;
    phases?: Phase[];
    payment?: ProjectPayment;
  };
}

const defaultPayment: ProjectPaymentFormData = {
  totalAmount: 0,
  depositRequired: 0,
  depositDueDate: undefined,
  paymentSchedule: PaymentSchedule.CUSTOM,
  paymentTerms: '',
  notes: ''
};

const defaultFormValues: ProjectFormData = {
  name: '',
  description: '',
  type: null,
  status: ProjectStatus.PREPARATION,
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  client: {
    id: '',
    name: '',
    email: '',
    phone: ''
  }
};

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = ['Project', 'Timeline', 'Budget', 'Client'];

  return (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index === currentStep ? 'bg-teal-500 text-white' : index < currentStep ? 'bg-teal-200 text-teal-700' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && <div className={`h-1 w-8 mx-2 ${index < currentStep ? 'bg-teal-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
};

const convertPaymentToFormData = (payment: ProjectPayment | null | undefined): ProjectPaymentFormData => {
  if (!payment) return defaultPayment;

  return {
    totalAmount: Number(payment.totalAmount),
    depositRequired: payment.depositRequired ? Number(payment.depositRequired) : undefined,
    depositDueDate: payment.depositDueDate || undefined,
    paymentSchedule: payment.paymentSchedule,
    paymentTerms: payment.paymentTerms || undefined,
    notes: payment.notes || undefined
  };
};

export const UnifiedProjectWorkflow: React.FC<UnifiedProjectWorkflowProps> = ({ open, onOpenChange, onComplete, mode = 'create', defaultValues }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [phases, setPhases] = useState<Phase[]>(defaultValues?.phases || []);
  const [payment, setPayment] = useState<ProjectPaymentFormData>(convertPaymentToFormData(defaultValues?.payment));

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultValues?.project || defaultFormValues
  });

  const steps = [
    {
      title: `${mode === 'create' ? 'Create' : 'Edit'} Project Details`,
      component: <ProjectDetailsStep form={form} />
    },
    {
      title: 'Timeline Phases',
      description: 'Create checkpoints to build a shareable timeline',
      component: <TimelineStep phases={phases} onPhasesChange={setPhases} />
    },
    {
      title: 'Payment Details',
      component: <PaymentStep payment={payment} onPaymentChange={setPayment} />
    },
    {
      title: 'Client Details',
      component: <ClientStep form={form} mode={mode} />
    }
  ];

  const resetWorkflow = () => {
    if (mode === 'create') {
      form.reset(defaultFormValues);
      setPhases([]);
      setPayment(defaultPayment);
    } else {
      form.reset(defaultValues?.project);
      setPhases(defaultValues?.phases || []);
      setPayment(convertPaymentToFormData(defaultValues?.payment));
    }
    setCurrentStep(0);
  };

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      const formData = form.getValues();
      await onComplete({
        ...formData,
        phases,
        payment
      });
      resetWorkflow();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetWorkflow();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-foreground/10 via-background to-background">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Project' : 'Edit Project'}</DialogTitle>
          <DialogDescription>
            {steps[currentStep].title}
            {steps[currentStep].description ? <span> - {steps[currentStep].description}</span> : ''}
          </DialogDescription>
        </DialogHeader>

        <StepIndicator currentStep={currentStep} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
            {steps[currentStep].component}

            <div className="flex justify-between mt-6">
              <Button type="button" variant="ghost" onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button type="submit">
                {currentStep === steps.length - 1 ? (mode === 'create' ? 'Create' : 'Save') : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedProjectWorkflow;
