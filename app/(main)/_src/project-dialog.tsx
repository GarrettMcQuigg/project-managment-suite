'use client';

import { ArrowRight, CalendarIcon } from 'lucide-react';
import { Calendar } from '@/packages/lib/components/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { Input } from '@/packages/lib/components/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/packages/lib/components/popover';
import { Button } from '@/packages/lib/components/button';
import { cn } from '@/packages/lib/utils';
import { ProjectStatus, ProjectType } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/packages/lib/components/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '@/packages/lib/components/textarea';

const projectFormSchema = z
  .object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(1, 'Project description is required'),
    type: z.nativeEnum(ProjectType, {
      required_error: 'Please select a project type'
    }),
    status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PREPARATION),
    startDate: z.date({
      required_error: 'Start date is required'
    }),
    endDate: z
      .date({
        required_error: 'End date is required'
      })
      .min(new Date(), 'End date must be in the future')
    // phases: z
    //   .array(
    //     z.object({
    //       type: z.nativeEnum(PhaseType),
    //       name: z.string().min(1, 'Phase name is required'),
    //       description: z.string().optional(),
    //       startDate: z.date(),
    //       endDate: z.date()
    //     })
    //   )
    //   .min(1, 'At least one phase is required')
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate']
  });
// .refine(
//   (data) => {
//     return data.phases.every((phase, index) => {
//       if (index === 0) return phase.startDate >= data.startDate;
//       return phase.startDate >= data.phases[index - 1].endDate;
//     });
//   },
//   {
//     message: 'Phase dates must be sequential',
//     path: ['phases']
// }
// );

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

const projectTypes = {
  Branding: {
    key: ProjectType.BRANDING,
    name: 'Branding',
    description: 'Logo design, brand identity, style guides'
  },
  Photography: {
    key: ProjectType.PHOTOGRAPHY,
    name: 'Photography',
    description: 'Photo shoots, image editing, photo collections'
  },
  Illustration: {
    key: ProjectType.ILLUSTRATION,
    name: 'Illustration',
    description: 'Custom illustrations, art commissions'
  },
  WebDesign: {
    key: ProjectType.WEB_DESIGN,
    name: 'Web Design',
    description: 'Websites, landing pages, digital experiences'
  },
  Video: {
    key: ProjectType.VIDEO,
    name: 'Video',
    description: 'Video production, editing, animation'
  },
  SocialMedia: {
    key: ProjectType.SOCIAL_MEDIA,
    name: 'Social Media',
    description: 'Content creation, campaign management'
  },
  Print: {
    key: ProjectType.PRINT,
    name: 'Print',
    description: 'Physical materials, packaging, editorial'
  },
  Exhibition: {
    key: ProjectType.EXHIBITION,
    name: 'Exhibition',
    description: 'Art shows, installations, gallery work'
  },
  Campaign: {
    key: ProjectType.CAMPAIGN,
    name: 'Campaign',
    description: 'Multi-channel creative campaigns'
  },
  Collaboration: {
    key: ProjectType.COLLABORATION,
    name: 'Collaboration',
    description: 'Joint creative projects'
  }
};

type ProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext: (data: ProjectFormValues) => void;
};

export function ProjectDialog({ open, onOpenChange, onNext }: ProjectDialogProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      status: ProjectStatus.PREPARATION,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  // const [phases, setPhases] = useState([{
  //   type: PhaseType.PREPARATION,
  //   name: "Project Preparation",
  //   description: "",
  //   startDate: new Date(),
  //   endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  // }]);

  function onSubmit(values: ProjectFormValues) {
    onNext(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-purple-500/10 via-background to-background">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Launch your next creative masterpiece. Fill in the project details to get started.</DialogDescription>
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
                      <SelectTrigger className="border-purple-500/20">
                        <SelectValue placeholder="Select project type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(projectTypes).map((type) => (
                        <SelectItem key={type.key} value={type.key}>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{type.name}</span>
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
                    <Input placeholder="Enter project name" className="border-purple-500/20" {...field} />
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
                    <Textarea placeholder="Describe your project" className="border-purple-500/20 resize-none" {...field} />
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
                    <FormLabel>Start date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={'outline'} className={cn('justify-start text-left font-normal border-purple-500/20', !field.value && 'text-muted-foreground')}>
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
                    <FormLabel>End date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={'outline'} className={cn('justify-start text-left font-normal border-purple-500/20', !field.value && 'text-muted-foreground')}>
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
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white ml-auto flex items-center gap-2">
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
