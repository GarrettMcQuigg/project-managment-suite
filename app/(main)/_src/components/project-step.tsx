import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/packages/lib/components/form';
import { Textarea } from '@/packages/lib/components/textarea';
import { cn } from '@/packages/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { projectTypes } from './project/types';
import { Input } from '@/packages/lib/components/input';
import { Button } from '@/packages/lib/components/button';
import { Calendar } from '@/packages/lib/components/calendar';
import { UseFormReturn } from 'react-hook-form';
import { ProjectStatus, ProjectType } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/packages/lib/components/popover';

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
  client: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
}

const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({ form }) => (
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
              {Object.entries(projectTypes).map(([_, type]) => (
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

export default ProjectDetailsStep;
