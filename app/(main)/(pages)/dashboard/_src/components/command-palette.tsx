'use client';

import * as React from 'react';
import { Brush, Camera, Clock, Code, FileText, ImageIcon, Layout, MessageSquare, Music, Palette, PenTool, Users, Video } from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/packages/lib/components/command';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search your creative universe..." />
      {/* <CommandInput /> */}
      <CommandList className="border-purple-500/20">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Creative Projects">
          <CommandItem>
            <PenTool className="mr-2 h-4 w-4 text-purple-400" />
            <span>Illustration Projects</span>
          </CommandItem>
          <CommandItem>
            <Camera className="mr-2 h-4 w-4 text-purple-400" />
            <span>Photography Sessions</span>
          </CommandItem>
          <CommandItem>
            <Video className="mr-2 h-4 w-4 text-purple-400" />
            <span>Video Productions</span>
          </CommandItem>
          <CommandItem>
            <Code className="mr-2 h-4 w-4 text-purple-400" />
            <span>Web Development</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem>
            <Layout className="mr-2 h-4 w-4 text-purple-400" />
            <span>New Project Board</span>
          </CommandItem>
          <CommandItem>
            <MessageSquare className="mr-2 h-4 w-4 text-purple-400" />
            <span>Client Messages</span>
          </CommandItem>
          <CommandItem>
            <Clock className="mr-2 h-4 w-4 text-purple-400" />
            <span>Time Tracking</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Resources">
          <CommandItem>
            <ImageIcon className="mr-2 h-4 w-4 text-purple-400" />
            <span>Asset Library</span>
          </CommandItem>
          <CommandItem>
            <Users className="mr-2 h-4 w-4 text-purple-400" />
            <span>Client Portal</span>
          </CommandItem>
          <CommandItem>
            <FileText className="mr-2 h-4 w-4 text-purple-400" />
            <span>Contracts</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
