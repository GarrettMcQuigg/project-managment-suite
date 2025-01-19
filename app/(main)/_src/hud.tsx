'use client';

// import { useState } from 'react';
// import CommandPalette from './command-palette';
import { User } from '@prisma/client';
import { Header } from './header';

export default function HUD({ children, currentUser }: { children: React.ReactNode; currentUser: User }) {
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <>
      {/* <SidebarLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <Sidebar currentEmployee={currentEmployee} setSidebarOpen={setSidebarOpen} />
      </SidebarLayout> */}

      <div className="lg:pl-72">
        {/* <Header currentUser={currentUser} setCommandPaletteOpen={setCommandPaletteOpen} setSidebarOpen={setSidebarOpen} /> */}
        <Header currentUser={currentUser} />

        <main className="bg-gray-100/30 dark:bg-gray-700/30 min-h-screen-minus-header">{children}</main>
      </div>

      {/* <CommandPalette commandPaletteOpen={commandPaletteOpen} setCommandPaletteOpen={setCommandPaletteOpen} /> */}
    </>
  );
}
