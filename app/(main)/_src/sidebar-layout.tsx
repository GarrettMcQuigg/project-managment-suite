'use client';

import { Sheet, SheetContent, SheetOverlay, SheetTitle, SheetDescription } from '@/packages/lib/components/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/packages/lib/components/button';

export default function SidebarLayout({ children, sidebarOpen, setSidebarOpen }: { children: React.ReactNode; sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  return (
    <>
      {/* Custom sidebar implementation */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetOverlay className="backdrop-blur-sm bg-black/10" />
        <SheetContent 
          side="left" 
          className="w-64 p-0 border-r shadow-lg [&>button]:!hidden"
        >
          {/* Hidden but accessible title and description for screen readers */}
          <div className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Application navigation sidebar with main menu items and utilities</SheetDescription>
          </div>
          {/* Custom close button with hamburger icon */}
          <div className="absolute right-4 top-4 z-50">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
          
          <div className="h-full">{children}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
