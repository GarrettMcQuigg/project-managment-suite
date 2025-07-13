'use client';

import { MessageSquare, Search, Menu } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/packages/lib/components/button';
import { User } from '@prisma/client';
import UserDropdown from '@/app/(main)/_src/user-dropdown';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from '@/packages/lib/components/command';
import { useRouter } from 'next/navigation';
import { FileText, Users, Receipt, Settings, Calendar, Clock, Star, Briefcase, AlertCircle, BarChart3, LayoutDashboard, Plus } from 'lucide-react';
import { DialogTitle } from '@/packages/lib/components/dialog';
import { DASHBOARD_ROUTE } from '@/packages/lib/routes';

export function Header({ currentUser, setSidebarOpen, sidebarOpen }: { currentUser: User; setSidebarOpen: (open: boolean) => void; sidebarOpen: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  // Toggle the command palette with keyboard shortcut
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
    <header className="flex h-header items-center justify-between border-b border-border/40 dark:border-white/[0.08] bg-white dark:bg-[#0a1a1a] px-4 sm:px-6 transition-all duration-300">
      <div className="flex items-center gap-2">
        {/* Mobile hamburger menu */}
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">{sidebarOpen ? 'Close' : 'Open'} sidebar</span>
        </Button>

        <Button variant="ghost" className="w-48 xs:w-64 justify-start text-muted-foreground hover:bg-foreground/5 hover:text-foreground" onClick={() => setOpen(true)}>
          <Search className="mr-2 h-4 w-4" />
          Search <span className="xs:block hidden">your universe...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-foreground/20 bg-muted px-1.5 text-[10px] font-medium text-muted-foreground opacity-100 xs:ml-auto xs:flex hidden">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Command Dialog - Enhanced with wider layout and dynamic styling */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search Commands</DialogTitle>
        <CommandInput placeholder="Search your universe..." className="text-lg py-4" />
        <CommandList className="px-3 py-2">
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Suggestions" className="pb-2">
            <div className="grid grid-cols-2 gap-2">
              <CommandItem onSelect={() => runCommand(() => router.push(DASHBOARD_ROUTE))} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-primary/10">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mr-3">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium">Dashboard</span>
                  <p className="text-xs text-muted-foreground">Your central workspace</p>
                </div>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/projects/recent'))} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-primary/10">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mr-3">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium">Recent Projects</span>
                  <p className="text-xs text-muted-foreground">Projects you're working on</p>
                </div>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/clients/starred'))} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-primary/10">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mr-3">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium">Starred Clients</span>
                  <p className="text-xs text-muted-foreground">Your priority clients</p>
                </div>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/invoices/overdue'))} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-primary/10">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mr-3">
                  <AlertCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium">Overdue Invoices</span>
                  <p className="text-xs text-muted-foreground">Pending payments</p>
                </div>
              </CommandItem>
            </div>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Main Navigation" className="py-2">
            <div className="grid grid-cols-4 gap-1">
              <CommandItem
                onSelect={() => runCommand(() => router.push('/projects'))}
                className="flex flex-col items-center justify-center cursor-pointer p-3 rounded-lg hover:bg-foreground/5"
              >
                <Briefcase className="h-5 w-5 mb-1" />
                <span className="text-sm">Projects</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/clients'))}
                className="flex flex-col items-center justify-center cursor-pointer p-3 rounded-lg hover:bg-foreground/5"
              >
                <Users className="h-5 w-5 mb-1" />
                <span className="text-sm">Clients</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/invoices'))}
                className="flex flex-col items-center justify-center cursor-pointer p-3 rounded-lg hover:bg-foreground/5"
              >
                <Receipt className="h-5 w-5 mb-1" />
                <span className="text-sm">Invoices</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/analytics'))}
                className="flex flex-col items-center justify-center cursor-pointer p-3 rounded-lg hover:bg-foreground/5"
              >
                <BarChart3 className="h-5 w-5 mb-1" />
                <span className="text-sm">Analytics</span>
              </CommandItem>
            </div>
          </CommandGroup>

          <CommandSeparator />

          <div className="flex gap-4 py-2">
            <div className="flex-1">
              <CommandGroup heading="Create New">
                <div className="space-y-1">
                  <CommandItem
                    onSelect={() => runCommand(() => router.push('/projects/new'))}
                    className="flex items-center cursor-pointer py-2 px-3 rounded-md hover:bg-success/10"
                  >
                    <Plus className="mr-2 h-4 w-4 text-success" />
                    <span>New Project</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push('/clients/new'))} className="flex items-center cursor-pointer py-2 px-3 rounded-md hover:bg-success/10">
                    <Plus className="mr-2 h-4 w-4 text-success" />
                    <span>New Client</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => runCommand(() => router.push('/invoices/new'))}
                    className="flex items-center cursor-pointer py-2 px-3 rounded-md hover:bg-success/10"
                  >
                    <Plus className="mr-2 h-4 w-4 text-success" />
                    <span>New Invoice</span>
                  </CommandItem>
                </div>
              </CommandGroup>
            </div>

            <div className="flex-1">
              <CommandGroup heading="Utilities">
                <div className="space-y-1">
                  <CommandItem onSelect={() => runCommand(() => router.push('/calendar'))} className="flex items-center cursor-pointer py-2 px-3 rounded-md hover:bg-foreground/5">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Calendar</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push('/documents'))} className="flex items-center cursor-pointer py-2 px-3 rounded-md hover:bg-foreground/5">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Documents</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => router.push('/settings'))} className="flex items-center cursor-pointer py-2 px-3 rounded-md hover:bg-foreground/5">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </CommandItem>
                </div>
              </CommandGroup>
            </div>
          </div>
        </CommandList>
      </CommandDialog>

      <div className="flex items-center gap-6">
        <Button variant="ghost" className="relative size-9 rounded-full bg-foreground/10 p-0 hover:bg-foreground/20">
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-white">4</span>
          <MessageSquare className="size-4 text-foreground" />
        </Button>
        <div className="mr-2 sm:mr-0">
          <UserDropdown currentUser={currentUser} />
        </div>
      </div>
    </header>
  );
}
