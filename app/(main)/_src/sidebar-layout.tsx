'use client';

import { Button } from '@/packages/lib/components/button';
import { Sheet, SheetContent } from '@/packages/lib/components/sheet';
import { X } from 'lucide-react';

export default function SidebarLayout({ children, sidebarOpen, setSidebarOpen }: { children: React.ReactNode; sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 border-r">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>

          <div className="flex h-full flex-col overflow-y-auto bg-background p-4">{children}</div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col border-r bg-background">
        <div className="flex grow flex-col overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}
