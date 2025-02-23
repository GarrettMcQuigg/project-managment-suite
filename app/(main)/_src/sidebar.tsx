'use client';

import { Calendar, Plus, LayoutDashboard, FolderKanban, Users, Settings, Receipt, Trello } from 'lucide-react';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from '@/packages/lib/components/sidebar';
import { Button } from '@/packages/lib/components/button';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { toast } from 'react-toastify';
import {
  API_PROJECT_ADD_ROUTE,
  CLIENTS_ROUTE,
  DASHBOARD_ROUTE,
  PROJECTS_ROUTE,
  CALENDAR_ROUTE,
  SETTINGS_ROUTE,
  SUPPORT_ROUTE,
  PROJECT_BOARD_ROUTE,
  INVOICES_ROUTE
} from '@/packages/lib/routes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import UnifiedProjectWorkflow from './project-workflow-dialog';
import { ProjectFormData } from './components/project-step';

export function AppSidebar() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleComplete = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      const response = await fetcher({
        url: API_PROJECT_ADD_ROUTE,
        requestBody: data
      });

      if (response.err) {
        toast.error('Failed to create project');
        return;
      }

      setIsOpen(false);
      toast.success('Project created successfully');
      router.push(PROJECTS_ROUTE);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-white/[0.08] bg-gradient-to-b from-[#e8f7f7] to-white dark:from-[#021111] dark:to-black [&::-webkit-scrollbar]:!hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SidebarHeader className="border-b border-white/[0.08] p-4 h-header">
          <Button onClick={() => setIsOpen(true)} disabled={loading} className="transition-all duration-300 group/button">
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover/button:rotate-90" />
            New Project
          </Button>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4 h-[calc(100vh-var(--header-height))] overflow-y-auto flex flex-col">
          <div className="flex-grow">
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 text-xs font-medium text-foreground">MAIN</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <Link href={DASHBOARD_ROUTE}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={`w-full rounded-lg transition-all duration-200 ${
                          pathname === DASHBOARD_ROUTE ? 'dark:bg-white/10 dark:text-white' : 'dark:text-foreground/60 dark:hover:bg-white/[0.06] dark:hover:text-white'
                        }`}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                  <Link href={PROJECTS_ROUTE}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={`w-full rounded-lg transition-all duration-200 ${
                          pathname === PROJECTS_ROUTE ? 'dark:bg-white/10 dark:text-white' : 'dark:text-foreground/60 dark:hover:bg-white/[0.06] dark:hover:text-white'
                        }`}
                      >
                        <FolderKanban className="mr-2 h-4 w-4" />
                        Projects
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                  <Link href={CLIENTS_ROUTE}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={`w-full rounded-lg transition-all duration-200 ${
                          pathname === CLIENTS_ROUTE ? 'dark:bg-white/10 dark:text-white' : 'dark:text-foreground/60 dark:hover:bg-white/[0.06] dark:hover:text-white'
                        }`}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Clients
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                  <Link href={INVOICES_ROUTE}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={`w-full rounded-lg transition-all duration-200 ${
                          pathname === INVOICES_ROUTE ? 'dark:bg-white/10 dark:text-white' : 'dark:text-foreground/60 dark:hover:bg-white/[0.06] dark:hover:text-white'
                        }`}
                      >
                        <Receipt className="mr-2 h-4 w-4" />
                        Invoices
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 text-xs font-medium text-foreground">UTILITIES</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <Link href={CALENDAR_ROUTE}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={`w-full rounded-lg transition-all duration-200 ${
                          pathname === CALENDAR_ROUTE ? 'dark:bg-white/10 dark:text-white' : 'dark:text-foreground/60 dark:hover:bg-white/[0.06] dark:hover:text-white'
                        }`}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendar
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                  <Link href={PROJECT_BOARD_ROUTE}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={`w-full rounded-lg transition-all duration-200 ${
                          pathname === PROJECT_BOARD_ROUTE ? 'dark:bg-white/10 dark:text-white' : 'dark:text-foreground/60 dark:hover:bg-white/[0.06] dark:hover:text-white'
                        }`}
                      >
                        <Trello className="mr-2 h-4 w-4" />
                        Project Board
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          <div className="mt-auto pt-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <Link href={SUPPORT_ROUTE}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={`w-full rounded-lg transition-all duration-200 ${
                          pathname === SUPPORT_ROUTE ? 'dark:bg-white/10 dark:text-white' : 'dark:text-foreground/60 dark:hover:bg-white/[0.06] dark:hover:text-white'
                        }`}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Support
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                  <Link href={SETTINGS_ROUTE}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={`w-full rounded-lg transition-all duration-200 ${
                          pathname === SETTINGS_ROUTE ? 'dark:bg-white/10 dark:text-white' : 'dark:text-foreground/60 dark:hover:bg-white/[0.06] dark:hover:text-white'
                        }`}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </SidebarContent>
      </Sidebar>
      <UnifiedProjectWorkflow open={isOpen} onOpenChange={setIsOpen} onComplete={handleComplete} />
    </SidebarProvider>
  );
}
