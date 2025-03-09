'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import SidebarLayout from './sidebar-layout';
import { AppSidebar } from './sidebar';
import { Header } from './header';

export default function HUD({ children, currentUser }: { children: React.ReactNode; currentUser: User }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <SidebarLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <AppSidebar setSidebarOpen={setSidebarOpen} />
      </SidebarLayout>

      <div className="flex flex-col flex-1">
        <Header currentUser={currentUser} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 min-h-0 lg:ml-64 transition-all duration-300">{children}</main>
      </div>
    </div>
  );
}
