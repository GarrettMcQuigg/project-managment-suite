'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, X, Clock, CreditCard, CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { Input } from '@/packages/lib/components/input';
import { Button } from '@/packages/lib/components/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/packages/lib/components/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Calendar } from '@/packages/lib/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/packages/lib/components/popover';
import { Textarea } from '@/packages/lib/components/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/packages/lib/components/tabs';
import { Card } from '@/packages/lib/components/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ProjectType, PhaseType, PaymentType, ProjectStatus, Phase } from '@prisma/client';
import { UseFormReturn } from 'react-hook-form';
import { projectFormSchema, projectTypes } from './components/project/types';
import { cn } from '@/packages/lib/utils';
import { ExistingClientSelect } from './components/client/existing-client-select';
import { ClientFormValues, clients } from './components/client/types';
import TimelineStep from './components/timeline-step';
import BudgetStep from './components/budget-step';
import { UpdateClientRequestBody } from '@/app/api/client/update/types';

// Interfaces
interface Budget {
  totalAmount: number;
  depositRequired: number;
  paymentSchedule: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  type: ProjectType | null;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  client: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface StepIndicatorProps {
  currentStep: number;
}

interface ProjectDetailsStepProps {
  form: UseFormReturn<ProjectFormData>;
}

interface TimelineStepProps {
  phases: Phase[];
  onPhasesChange: (phases: Phase[]) => void;
}

interface BudgetStepProps {
  budget: Budget;
  onBudgetChange: (budget: Budget) => void;
}

interface ClientStepProps {
  form: UseFormReturn<ProjectFormData & { id?: string }>;
}

interface UnifiedProjectWorkflowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: ProjectFormData & { phases: Phase[]; budget: Budget }) => void;
}

// Step Indicator Component
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

// Project Details Step
const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({ form }) => (
  <div className="space-y-4">
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Project Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
            <FormControl>
              <SelectTrigger className="border-foreground/20 py-7">
                <SelectValue placeholder="Select project type..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.values(projectTypes).map((type) => (
                <SelectItem key={type.key} value={type.key}>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-left">{type.name}</span>
                    <span className="text-xs text-muted-foreground">{type.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Project Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter project name" className="border-foreground/20" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Project Description</FormLabel>
          <FormControl>
            <Textarea placeholder="Describe your project" className="border-foreground/20 resize-none" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Start date: </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant={'outline'} className={cn('justify-start text-left font-normal border-foreground/20', !field.value && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 size-4" />
                    {field.value ? field.value.toLocaleDateString() : 'Pick a date'}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="endDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>End date: </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant={'outline'} className={cn('justify-start text-left font-normal border-foreground/20', !field.value && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 size-4" />
                    {field.value ? field.value.toLocaleDateString() : 'Pick a date'}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={(date) => date < new Date()} />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </div>
);

const ClientStep: React.FC<ClientStepProps> = ({ form }) => {
  const clientForm = useForm<ClientFormValues>();

  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find((c) => c.id.toString() === clientId);
    if (selectedClient) {
      form.setValue('client.name', selectedClient.name);
      form.setValue('client.email', selectedClient.email);
      form.setValue('client.phone', selectedClient.phone);
    }

    // const requestBody: UpdateClientRequestBody = {
    //   id: defaultValues!.id,
    //   name,
    //   email,
    //   phone
    // };
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Client</TabsTrigger>
          <TabsTrigger value="existing">Existing Client</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <FormField
            control={form.control}
            name="client.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter client name" className="border-foreground/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter client email" className="border-foreground/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter client phone" className="border-foreground/20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>

        <TabsContent value="existing">
          <div className="py-4">
            <ExistingClientSelect form={clientForm} onSelect={handleClientSelect} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main Workflow Component
export const UnifiedProjectWorkflow: React.FC<UnifiedProjectWorkflowProps> = ({ open, onOpenChange, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [budget, setBudget] = useState<Budget>({
    totalAmount: 0,
    depositRequired: 0,
    paymentSchedule: 'CUSTOM'
  });

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

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      const formData = form.getValues();
      onComplete({
        ...formData,
        phases,
        budget
      });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
