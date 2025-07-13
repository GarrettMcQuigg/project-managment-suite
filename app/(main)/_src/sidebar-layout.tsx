'use client';

import { Sheet, SheetContent, SheetTitle, SheetHeader, SheetOverlay } from '@/packages/lib/components/sheet';

export default function SidebarLayout({ children, sidebarOpen, setSidebarOpen }: { children: React.ReactNode; sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  return (
    <>
      {/* Single unified sidebar with different behavior on mobile vs desktop */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetOverlay className="backdrop-blur-sm bg-black/10" />
        <SheetContent side="left" className="w-64 p-0 border-r shadow-lg">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>

          <div className="h-full">{children}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
