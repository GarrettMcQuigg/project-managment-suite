'use client';

import { MessageSquare, Search } from 'lucide-react';
import { CommandPalette } from './command-palette';
import React from 'react';
import { Button } from '@/packages/lib/components/button';
import { User } from '@prisma/client';
import UserDropdown from '@/app/(main)/_src/user-dropdown';

export function Header({ currentUser }: { currentUser: User }) {
  return (
    <header className="flex h-header lg:ml-64 items-center justify-between border-b border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-background to-background bg-background/95 px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="w-72 justify-start text-muted-foreground hover:bg-purple-500/10 hover:text-purple-400">
          <Search className="mr-2 h-4 w-4" />
          Search your creative universe...
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-purple-500/20 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      <CommandPalette />
      <div className="flex items-center gap-6">
        <Button variant="ghost" className="relative size-9 rounded-full bg-purple-500/10 p-0 hover:bg-purple-500/20">
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">4</span>
          <MessageSquare className="size-4 text-purple-400" />
        </Button>
        <UserDropdown currentUser={currentUser} />
      </div>
    </header>
  );
}
