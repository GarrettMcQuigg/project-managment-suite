'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { Button } from '@/packages/lib/components/button';
import { Form } from '@/packages/lib/components/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ProjectStatus, Phase } from '@prisma/client';
import { projectFormSchema } from '../(pages)/projects/[id]/_src/types';
import TimelineStep from './components/timeline-step';
import BudgetStep from './components/budget-step';
import ClientStep from './components/client-step';
import ProjectDetailsStep, { ProjectFormData } from './components/project-step';

interface Budget {
  totalAmount: number;
  depositRequired: number;
  paymentSchedule: string;
}

interface StepIndicatorProps {
  currentStep: number;
}

interface UnifiedProjectWorkflowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: ProjectFormData & { phases: Phase[]; budget: Budget }) => void;
}

const defaultBudget: Budget = {
  totalAmount: 0,
  depositRequired: 0,
  paymentSchedule: 'CUSTOM'
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

export const UnifiedProjectWorkflow: React.FC<UnifiedProjectWorkflowProps> = ({ open, onOpenChange, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [budget, setBudget] = useState<Budget>(defaultBudget);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
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
    }
  });

  const steps = [
    { title: 'Project Details', component: <ProjectDetailsStep form={form} /> },
    {
      title: 'Timeline Phases',
      description: 'Create checkpoints to build a shareable timeline',
      component: <TimelineStep phases={phases} onPhasesChange={setPhases} />
    },
    { title: 'Budget', component: <BudgetStep budget={budget} onBudgetChange={setBudget} /> },
    { title: 'Client Details', component: <ClientStep form={form} /> }
  ];

  const resetWorkflow = () => {
    form.reset(defaultFormValues);
    setPhases([]);
    setBudget(defaultBudget);
    setCurrentStep(0);
  };

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      const formData = form.getValues();
      await onComplete({
        ...formData,
        phases,
        budget
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
          <DialogTitle>Create New Project</DialogTitle>
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
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
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
