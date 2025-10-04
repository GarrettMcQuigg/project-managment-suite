import React, { useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel } from '@/packages/lib/components/form';
import { Textarea } from '@/packages/lib/components/textarea';
import { cn } from '@/packages/lib/utils';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { projectTypes } from '../../(pages)/projects/[id]/_src/types';
import { Input } from '@/packages/lib/components/input';
import { Button } from '@/packages/lib/components/button';
import { Calendar } from '@/packages/lib/components/calendar';
import { UseFormReturn } from 'react-hook-form';
import { ProjectStatus, ProjectType } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/packages/lib/components/popover';
import { generateSecurePassword } from '@/packages/lib/helpers/portal/password-generator';

interface ProjectDetailsStepProps {
  form: UseFormReturn<ProjectFormData>;
}

export interface ProjectFormData {
  name: string;
  description: string;
  type: ProjectType | null;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  portalPassword: string;
  client: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
}

const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({ form }) => {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleGeneratePassword = () => {
    const password = generateSecurePassword();
    form.setValue('portalPassword', password);
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger className="border-foreground/20 py-7">
                  <SelectValue placeholder="Select project type..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(projectTypes).map(([, type]) => (
                  <SelectItem key={type.key} value={type.key}>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-left">{type.name}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="portalPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Portal Password</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Input placeholder="Enter or generate password" className="border-foreground/20 flex-1" {...field} />
                <Button type="button" variant="outline" onClick={handleGeneratePassword} className="shrink-0 border-foreground/20">
                  <RefreshCw />
                  Generate
                </Button>
              </div>
            </FormControl>
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
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={'outline'} className={cn('justify-start text-left font-normal border-foreground/20', !field.value && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 size-4" />
                      {field.value ? field.value.toLocaleDateString() : 'Pick a date'}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End date: </FormLabel>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={'outline'} className={cn('justify-start text-left font-normal border-foreground/20', !field.value && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 size-4" />
                      {field.value ? field.value.toLocaleDateString() : 'Pick a date'}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ProjectDetailsStep;
