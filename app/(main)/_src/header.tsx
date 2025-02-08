'use client';

import { MessageSquare, Search } from 'lucide-react';
import React from 'react';
import { Button } from '@/packages/lib/components/button';
import { User } from '@prisma/client';
import UserDropdown from '@/app/(main)/_src/user-dropdown';
import { CommandPalette } from './components/command-palette';

export function Header({ currentUser }: { currentUser: User }) {
  return (
    <header className="flex h-header lg:ml-64 items-center justify-between border-b border-white/[0.08] bg-gradient-to-r from-[#e8f7f7] to-white dark:from-[#021111] dark:to-black px-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="w-72 justify-start text-muted-foreground hover:bg-foreground/10 hover:text-foreground">
          <Search className="mr-2 h-4 w-4" />
          Search your creative universe...
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-foreground/20 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      <CommandPalette />
      <div className="flex items-center gap-6">
        <Button variant="ghost" className="relative size-9 rounded-full bg-foreground/10 p-0 hover:bg-foreground/20">
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-white">4</span>
          <MessageSquare className="size-4 text-foreground" />
        </Button>
        <UserDropdown currentUser={currentUser} />
      </div>
    </header>
  );
}
