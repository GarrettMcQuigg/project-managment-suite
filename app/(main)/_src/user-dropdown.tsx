'use client';

import * as React from 'react';
import type { user } from '@prisma/client';
import { useLoading } from '@packages/lib/providers/loading';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@packages/lib/components/dropdown-menu';
import { useTheme } from 'next-themes';
import { fetcher } from '@packages/lib/helpers/fetcher';
import Link from 'next/link';
import { useState } from 'react';
import { API_AUTH_SIGNOUT_ROUTE } from '@/packages/lib/routes';
import { MoonIcon, SunIcon } from 'lucide-react';
import { UserInfo } from '@/packages/lib/components/user-info';

type Utility = {
  name: string;
  shortcut?: string;
  route?: string;
};

export default function UserDropdown({ currentUser }: { currentUser: user }) {
  const { setLoading } = useLoading();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const utilities: Utility[] = [];

  const signout = async () => {
    setLoading(true);

    await fetcher({ url: API_AUTH_SIGNOUT_ROUTE });

    setLoading(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="h-13 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 active:bg-gray-100 dark:active:bg-gray-900 border border-transparent hover:border-gray-200 active:border-gray-200 dark:hover:border-gray-800 dark:active:border-gray-800">
          <UserInfo user={currentUser} responsive />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56">
        {utilities.length > 0 && (
          <>
            <DropdownMenuGroup>
              {utilities.map((utility, index) => (
                <DropdownMenuItem key={index}>
                  {utility.route ? (
                    <Link href={utility.route} onClick={() => setOpen(false)}>
                      <span className="mr-4">{utility.name}</span>
                      {utility.shortcut && <DropdownMenuShortcut>{utility.shortcut}</DropdownMenuShortcut>}
                    </Link>
                  ) : (
                    <>
                      <span className="mr-4">{utility.name}</span>
                      {utility.shortcut && <DropdownMenuShortcut>{utility.shortcut}</DropdownMenuShortcut>}
                    </>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Theme */}
        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          Toggle theme
          <DropdownMenuShortcut>{theme === 'dark' ? <MoonIcon className="h-4 w-4" aria-hidden="true" /> : <SunIcon className="h-4 w-4" aria-hidden="true" />}</DropdownMenuShortcut>
        </DropdownMenuItem>

        {/* Sign out */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signout}>
          Sign out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
