'use client';

import { useState } from 'react';
import { Calendar, CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { Input } from '@/packages/lib/components/input';
import { Label } from '@/packages/lib/components/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/packages/lib/components/popover';
import { Button } from '@/packages/lib/components/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/packages/lib/components/command';
import { cn } from '@/packages/lib/utils';

const projectTypes = [
  { label: 'Photography', value: 'photography' },
  { label: 'Web Design', value: 'web-design' },
  { label: 'Graphic Design', value: 'graphic-design' },
  { label: 'Video Production', value: 'video-production' },
  { label: 'Illustration', value: 'illustration' },
  { label: 'Branding', value: 'branding' }
];

export function ProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [date, setDate] = useState<Date>();
  const [projectType, setProjectType] = useState('');
  const [openCombobox, setOpenCombobox] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-purple-500/10 via-background to-background">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Launch your next creative masterpiece. Fill in the project details to get started.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input id="project-name" placeholder="Enter project name" className="border-purple-500/20" />
          </div>
          <div className="grid gap-2">
            <Label>Project type</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="justify-between border-purple-500/20">
                  {projectType ? projectTypes.find((type) => type.value === projectType)?.label : 'Select project type...'}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search project type..." />
                  <CommandEmpty>No project type found.</CommandEmpty>
                  <CommandGroup>
                    {projectTypes.map((type) => (
                      <CommandItem
                        key={type.value}
                        value={type.value}
                        onSelect={(currentValue: any) => {
                          setProjectType(currentValue === projectType ? '' : currentValue);
                          setOpenCombobox(false);
                        }}
                      >
                        <Check className={cn('mr-2 h-4 w-4', projectType === type.value ? 'opacity-100' : 'opacity-0')} />
                        {type.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label>Due date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={'outline'} className={cn('justify-start text-left font-normal border-purple-500/20', !date && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 size-4" />
                  {date ? date.toLocaleDateString() : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                {/* <Calendar mode="single" selected={date} onSelect={setDate} initialFocus /> */}
                <Calendar mode="single" />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
