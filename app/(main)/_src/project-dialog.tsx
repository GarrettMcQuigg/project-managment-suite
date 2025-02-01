import { ArrowRight, CalendarIcon } from 'lucide-react';
import { Calendar } from '@/packages/lib/components/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { Input } from '@/packages/lib/components/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/packages/lib/components/popover';
import { Button } from '@/packages/lib/components/button';
import { cn } from '@/packages/lib/utils';
import { ProjectStatus } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/packages/lib/components/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/packages/lib/components/textarea';
import { useEffect } from 'react';
import { ProjectDialogProps, projectFormSchema, ProjectFormValues, projectTypes } from './components/project/types';

export function ProjectDialog({ open, onOpenChange, onNext, mode = 'create', defaultValues }: ProjectDialogProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      status: ProjectStatus.PREPARATION,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  useEffect(() => {
    if (!open) {
      form.reset(
        defaultValues || {
          name: '',
          description: '',
          status: ProjectStatus.PREPARATION,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      );
    }
  }, [open, form, defaultValues]);

  function onSubmit(values: ProjectFormValues) {
    onNext(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-foreground/10 via-background to-background">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Update your project details' : 'Launch your next creative masterpiece. Fill in the project details to get started.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <DialogFooter className="flex justify-between">
              <Button type="submit" className="bg-foreground hover:bg-foreground text-white ml-auto flex items-center gap-2">
                Client Details
                <ArrowRight className="w-4 h-4" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
