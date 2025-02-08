'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { LayoutDashboard, FolderKanban, Users } from 'lucide-react';
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
import { API_PROJECT_ADD_ROUTE, CLIENTS_ROUTE, DASHBOARD_ROUTE, PROJECTS_ROUTE } from '@/packages/lib/routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UnifiedProjectWorkflow from './project-workflow-dialog';
import { ProjectFormData } from './components/project-step';

export function AppSidebar() {
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
          <Button
            onClick={() => setIsOpen(true)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white border-0 shadow-lg shadow-teal-500/20 transition-all duration-300 group/button"
          >
            <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover/button:rotate-90" />
            New Project
          </Button>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4 h-[calc(100vh-var(--header-height))] overflow-y-auto">
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
                      <LayoutDashboard className="mr-3 h-4 w-4" />
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
                      <FolderKanban className="mr-3 h-4 w-4" />
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
                      <Users className="mr-3 h-4 w-4" />
                      Clients
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <UnifiedProjectWorkflow open={isOpen} onOpenChange={setIsOpen} onComplete={handleComplete} />
    </SidebarProvider>
  );
}
