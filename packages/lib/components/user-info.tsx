'use client';

import React from 'react';
import { User } from '@prisma/client';
import { cn } from '../utils';
import { PROFILE_IMG_PLACEHOLDER } from '../constants/misc';

export function UserInfo({ user, responsive, className }: { user: User; responsive?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center', className)}>
      <img alt={user.firstname + 's profile picture'} src={user.profileImg ?? PROFILE_IMG_PLACEHOLDER} className="inline-block h-8 w-8 rounded-full" />
      <div className={cn('ml-2 max-w-56', responsive && 'hidden md:block')}>
        <p className="flex text-sm items-center font-medium text-primary">
          <span className="overflow-hidden whitespace-nowrap overflow-ellipsis">
            {user.firstname} {user.lastname}
          </span>
        </p>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 overflow-hidden whitespace-nowrap overflow-ellipsis">{user.email}</p>
      </div>
    </div>
  );
}
