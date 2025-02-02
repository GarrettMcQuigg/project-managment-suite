'use client';

import { Separator } from '@/packages/lib/components/separator';
import { User } from '@prisma/client';
import { Menu, Search } from 'lucide-react';
import UserDropdown from './user-dropdown';

export function Header({ currentUser }: { currentUser: User }) {
  return (
    <div className="sticky top-0 z-40">
      <div className="flex h-header shrink-0 items-center gap-x-4 border-b bg-background px-4 sm:gap-x-6 sm:px-6 lg:px-8">
        {/* <button className="lg:hidden text-muted-foreground hover:text-primary active:text-primary" onClick={() => setSidebarOpen(true)}> */}
        <button className="lg:hidden text-muted-foreground hover:text-primary active:text-primary">
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        <Separator className="h-6 lg:hidden" orientation="vertical" />

        <div className="flex flex-1 gap-x-2 self-stretch">
          {/* Search */}
          {/* <div
            className="relative flex flex-1 items-center cursor-pointer text-muted-foreground hover:text-primary active:text-primary mx-1 px-2 py-1"
            onClick={() => setCommandPaletteOpen(true)}
          > */}
          <div className="relative flex flex-1 items-center cursor-pointer text-muted-foreground hover:text-primary active:text-primary mx-1 px-2 py-1">
            <Search className="h-5 w-5" />
            <span className="px-2">Search</span>
          </div>

          {/* Utilities */}
          <div className="flex items-center gap-x-2 lg:gap-x-4">
            {/* <Messages /> */}
            {/* <Notifications /> */}
            <Separator className="h-6" orientation="vertical" />
            <UserDropdown currentUser={currentUser} />
          </div>
        </div>
      </div>
    </div>
  );
}
