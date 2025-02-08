'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import SidebarLayout from './sidebar-layout';
import { AppSidebar } from './sidebar';
import { Header } from './header';

export default function HUD({ children, currentUser }: { children: React.ReactNode; currentUser: User }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <SidebarLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <AppSidebar />
      </SidebarLayout>

      <div>
        <Header currentUser={currentUser} />

        <main className="min-h-screen-minus-header">{children}</main>
      </div>
    </>
  );
}
