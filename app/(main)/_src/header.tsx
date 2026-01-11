'use client';

import { MessageSquare, Search, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/packages/lib/components/button';
import type { User } from '@prisma/client';
import UserDropdown from '@/app/(main)/_src/user-dropdown';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from '@/packages/lib/components/command';
import { useRouter } from 'next/navigation';
import { FileText, Users, Receipt, Settings, Calendar, Clock, Star, Briefcase, AlertCircle, BarChart3, LayoutDashboard, Plus, Sparkles } from 'lucide-react';
import { DialogTitle } from '@/packages/lib/components/dialog';
import { DASHBOARD_ROUTE } from '@/packages/lib/routes';

export function Header({ currentUser, setSidebarOpen, sidebarOpen }: { currentUser: User; setSidebarOpen: (open: boolean) => void; sidebarOpen: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  useEffect(() => {
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
    <header className="sticky top-0 z-50 flex gap-2 h-16 items-center justify-between border-b border-border/40 dark:border-white/[0.08] bg-white/80 dark:bg-[#0a1a1a]/80 backdrop-blur-xl px-2 sm:px-6 transition-all duration-300">
      <div className="flex items-center gap-6">
        {/* Mobile hamburger menu */}
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent/50 transition-colors duration-200" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">{sidebarOpen ? 'Close' : 'Open'} sidebar</span>
        </Button>

        <div
          className="hidden sm:flex items-center gap-2 text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={() => router.push(DASHBOARD_ROUTE)}
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Flow Folder</span>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="flex-1 max-w-2xl sm:mx-8">
        <Button
          variant="ghost"
          className="w-full h-10 justify-start text-muted-foreground bg-gradient-to-r from-muted/50 to-muted/30 dark:from-gray-800/50 dark:to-gray-700/30 hover:from-muted/70 hover:to-muted/50 dark:hover:from-gray-800/70 dark:hover:to-gray-700/50 border border-border/50 hover:border-border/80 hover:text-foreground rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group"
          onClick={() => setOpen(true)}
        >
          <Search className="mr-3 h-4 w-4 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors duration-200" />
          <span className="flex-1 text-left">
            Search <span className="hidden xs:inline text-muted-foreground/60">your universe...</span>
          </span>
          <kbd className="pointer-events-none ml-auto hidden xs:inline-flex h-6 select-none items-center gap-1 rounded-md border border-border/60 bg-background/80 px-2 text-[11px] font-medium text-muted-foreground/80 shadow-sm">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Enhanced Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search Commands</DialogTitle>
        <div className="border-b border-border/50">
          <CommandInput placeholder="Search your universe..." className="text-base py-4 border-0 focus:ring-0 bg-transparent" />
        </div>
        <CommandList className="px-4 py-3 max-h-[70vh]">
          <CommandEmpty className="py-8 text-center text-muted-foreground">
            <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No results found.</p>
          </CommandEmpty>

          <CommandGroup heading="Quick Actions" className="pb-3">
            <div className="grid grid-cols-2 gap-2">
              <CommandItem
                onSelect={() => runCommand(() => router.push(DASHBOARD_ROUTE))}
                className="flex items-center cursor-pointer p-4 rounded-xl hover:bg-accent/50 border border-transparent hover:border-border/50 transition-all duration-200"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 mr-3 group-hover:bg-blue-500/20 transition-colors duration-200">
                  <LayoutDashboard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">Dashboard</span>
                  <p className="text-xs text-muted-foreground truncate">Your central workspace</p>
                </div>
              </CommandItem>

              <CommandItem
                onSelect={() => runCommand(() => router.push('/projects/recent'))}
                className="flex items-center cursor-pointer p-4 rounded-xl hover:bg-accent/50 border border-transparent hover:border-border/50 transition-all duration-200"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 mr-3">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">Recent Projects</span>
                  <p className="text-xs text-muted-foreground truncate">Projects you're working on</p>
                </div>
              </CommandItem>

              <CommandItem
                onSelect={() => runCommand(() => router.push('/clients/starred'))}
                className="flex items-center cursor-pointer p-4 rounded-xl hover:bg-accent/50 border border-transparent hover:border-border/50 transition-all duration-200"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-500/10 mr-3">
                  <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">Starred Clients</span>
                  <p className="text-xs text-muted-foreground truncate">Your priority clients</p>
                </div>
              </CommandItem>

              <CommandItem
                onSelect={() => runCommand(() => router.push('/invoices/overdue'))}
                className="flex items-center cursor-pointer p-4 rounded-xl hover:bg-accent/50 border border-transparent hover:border-border/50 transition-all duration-200"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 mr-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">Overdue Invoices</span>
                  <p className="text-xs text-muted-foreground truncate">Pending payments</p>
                </div>
              </CommandItem>
            </div>
          </CommandGroup>

          <CommandSeparator className="my-3" />

          <CommandGroup heading="Navigation" className="py-2">
            <div className="grid grid-cols-4 gap-2">
              <CommandItem
                onSelect={() => runCommand(() => router.push('/projects'))}
                className="flex flex-col items-center justify-center cursor-pointer p-4 rounded-xl hover:bg-accent/50 transition-all duration-200 min-h-[80px]"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 mb-2">
                  <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium">Projects</span>
              </CommandItem>

              <CommandItem
                onSelect={() => runCommand(() => router.push('/clients'))}
                className="flex flex-col items-center justify-center cursor-pointer p-4 rounded-xl hover:bg-accent/50 transition-all duration-200 min-h-[80px]"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 mb-2">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium">Clients</span>
              </CommandItem>

              <CommandItem
                onSelect={() => runCommand(() => router.push('/invoices'))}
                className="flex flex-col items-center justify-center cursor-pointer p-4 rounded-xl hover:bg-accent/50 transition-all duration-200 min-h-[80px]"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 mb-2">
                  <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium">Invoices</span>
              </CommandItem>

              <CommandItem
                onSelect={() => runCommand(() => router.push('/analytics'))}
                className="flex flex-col items-center justify-center cursor-pointer p-4 rounded-xl hover:bg-accent/50 transition-all duration-200 min-h-[80px]"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 mb-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm font-medium">Analytics</span>
              </CommandItem>
            </div>
          </CommandGroup>

          <CommandSeparator className="my-3" />

          <div className="grid grid-cols-2 gap-4 py-2">
            <CommandGroup heading="Create New">
              <div className="space-y-1">
                <CommandItem
                  onSelect={() => runCommand(() => router.push('/projects/new'))}
                  className="flex items-center cursor-pointer py-3 px-3 rounded-lg hover:bg-green-500/10 border border-transparent hover:border-green-500/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 mr-3">
                    <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">New Project</span>
                </CommandItem>

                <CommandItem
                  onSelect={() => runCommand(() => router.push('/clients/new'))}
                  className="flex items-center cursor-pointer py-3 px-3 rounded-lg hover:bg-green-500/10 border border-transparent hover:border-green-500/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 mr-3">
                    <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">New Client</span>
                </CommandItem>

                <CommandItem
                  onSelect={() => runCommand(() => router.push('/invoices/new'))}
                  className="flex items-center cursor-pointer py-3 px-3 rounded-lg hover:bg-green-500/10 border border-transparent hover:border-green-500/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 mr-3">
                    <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">New Invoice</span>
                </CommandItem>
              </div>
            </CommandGroup>

            <CommandGroup heading="Utilities">
              <div className="space-y-1">
                <CommandItem
                  onSelect={() => runCommand(() => router.push('/calendar'))}
                  className="flex items-center cursor-pointer py-3 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 mr-3">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Calendar</span>
                </CommandItem>

                <CommandItem
                  onSelect={() => runCommand(() => router.push('/documents'))}
                  className="flex items-center cursor-pointer py-3 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 mr-3">
                    <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="font-medium">Documents</span>
                </CommandItem>

                <CommandItem
                  onSelect={() => runCommand(() => router.push('/settings'))}
                  className="flex items-center cursor-pointer py-3 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-500/10 mr-3">
                    <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="font-medium">Settings</span>
                </CommandItem>
              </div>
            </CommandGroup>
          </div>
        </CommandList>
      </CommandDialog>

      <div className="flex items-center sm:gap-4 gap-2">
        {/* Enhanced Notification Button */}
        <div className="relative">
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-xl bg-muted/50 hover:bg-muted/80 border border-border/50 hover:border-border/80 transition-all duration-200 group"
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
              4
            </span>
          </Button>
        </div>

        <div>
          <UserDropdown currentUser={currentUser} />
        </div>
      </div>
    </header>
  );
}
