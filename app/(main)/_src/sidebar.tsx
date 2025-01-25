'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { LayoutDashboard, FolderKanban, Users, BarChart, Clock, MessageSquare, FileText } from 'lucide-react';
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
import { ProjectCreateRequestBody } from '@/app/api/project/add/types';
import { API_PROJECT_ADD_ROUTE, CLIENTS_ROUTE, DASHBOARD_ROUTE, PROJECTS_ROUTE } from '@/packages/lib/routes';
import { ClientDialog, ClientFormValues } from './client-dialog';
import { ProjectFormValues, ProjectDialog } from './project-dialog';
import Link from 'next/link';

export type AddProjectRequestBody = {
  name: string;
  description: string;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date;
};

export type AddClientRequestBody = {
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
      const requestBody: ProjectCreateRequestBody = {
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
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-background to-background">
        <SidebarHeader className="border-b border-purple-500/20 p-4 h-header">
          <Button
            onClick={() => setIsOpen(true)}
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
                    <SidebarMenuButton className="hover:bg-purple-500/10 hover:text-purple-400">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
                <Link href={PROJECTS_ROUTE}>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="hover:bg-purple-500/10 hover:text-purple-400">
                      <FolderKanban className="mr-2 h-4 w-4" />
                      Projects
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
                <Link href={CLIENTS_ROUTE}>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="hover:bg-purple-500/10 hover:text-purple-400">
                      <Users className="mr-2 h-4 w-4" />
                      Clients
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>TOOLS</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="hover:bg-purple-500/10 hover:text-purple-400">
                    <BarChart className="mr-2 h-4 w-4" />
                    Analytics
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="hover:bg-purple-500/10 hover:text-purple-400">
                    <Clock className="mr-2 h-4 w-4" />
                    Time Tracking
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="hover:bg-purple-500/10 hover:text-purple-400">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="hover:bg-purple-500/10 hover:text-purple-400">
                    <FileText className="mr-2 h-4 w-4" />
                    Documents
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <ProjectDialog open={isOpen && step === 'project'} onOpenChange={setIsOpen} onNext={handleProjectNext} />
      <ClientDialog open={isOpen && step === 'client'} onOpenChange={setIsOpen} onSubmit={handleClientSubmit} onBack={() => setStep('project')} />
    </SidebarProvider>
  );
}
