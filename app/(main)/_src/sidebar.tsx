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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from '@/packages/lib/components/sidebar';
import { Button } from '@/packages/lib/components/button';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { toast } from 'react-toastify';
import { AddProjectRequestBody } from '@/app/api/project/add/types';
import { API_PROJECT_ADD_ROUTE, CLIENTS_ROUTE, DASHBOARD_ROUTE, PROJECTS_ROUTE } from '@/packages/lib/routes';
import { ClientDialog } from './client-dialog';
import { ProjectDialog } from './project-dialog';
import Link from 'next/link';
import { ClientFormValues } from './components/client/types';
import { ProjectFormValues } from './components/project/types';

export type AddAddProjectRequestBody = {
  name: string;
  description: string;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date;
};

export type AddAddClientRequestBody = {
  name: string;
  email: string;
  phone: string;
};

export function AppSidebar() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'project' | 'client'>('project');
  const [isOpen, setIsOpen] = useState(false);
  const [projectData, setProjectData] = useState<ProjectFormValues | null>(null);

  const handleProjectNext = (data: ProjectFormValues) => {
    setProjectData(data);
    setStep('client');
  };

  const handleClientSubmit = async (clientData: ClientFormValues) => {
    setLoading(true);
    try {
      const requestBody: AddProjectRequestBody = {
        client: {
          ...clientData!
        },
        project: {
          ...projectData!
        }
      };

      const response = await fetcher({ url: API_PROJECT_ADD_ROUTE, requestBody });

      if (response.err) {
        toast.error('Failed to create project');
        return;
      }

      setIsOpen(false);
      setStep('project');
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
      <Sidebar className="border-r border-foreground/20 bg-gradient-to-br from-foreground/10 via-background to-background">
        <SidebarHeader className="border-b border-foreground/20 p-4 h-header">
          <Button
            onClick={() => setIsOpen(true)}
            disabled={loading}
            className="w-full backdrop-blur-sm  border border-white/[0.08] shadow-xl shadow-black/10 transition-all duration-200 group/button"
          >
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover/button:scale-110 group-hover/button:rotate-90" />
            New Project
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>MAIN</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Link href={DASHBOARD_ROUTE}>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="hover:bg-foreground/20 hover:text-foreground">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
                <Link href={PROJECTS_ROUTE}>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="hover:bg-foreground/20 hover:text-foreground">
                      <FolderKanban className="mr-2 h-4 w-4" />
                      Projects
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
                <Link href={CLIENTS_ROUTE}>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="hover:bg-foreground/20 hover:text-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      Clients
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {/* <SidebarGroup>
            <SidebarGroupLabel>TOOLS</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="hover:bg-foreground/10 hover:text-foreground">
                    <BarChart className="mr-2 h-4 w-4" />
                    Analytics
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="hover:bg-foreground/10 hover:text-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    Time Tracking
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="hover:bg-foreground/10 hover:text-foreground">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="hover:bg-foreground/10 hover:text-foreground">
                    <FileText className="mr-2 h-4 w-4" />
                    Documents
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup> */}
        </SidebarContent>
      </Sidebar>
      <ProjectDialog open={isOpen && step === 'project'} onOpenChange={setIsOpen} onNext={handleProjectNext} />
      <ClientDialog open={isOpen && step === 'client'} onOpenChange={setIsOpen} onSubmit={handleClientSubmit} onBack={() => setStep('project')} />
    </SidebarProvider>
  );
}
