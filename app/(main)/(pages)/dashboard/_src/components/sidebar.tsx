'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ProjectDialog } from './project-dialog';
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
  SidebarMenuItem
} from '@/packages/lib/components/sidebar';
import { Button } from '@/packages/lib/components/button';

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Sidebar className="border-r border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-background to-background">
        <SidebarHeader className="border-b border-purple-500/20 p-4 h-header">
          <Button onClick={() => setOpen(true)} className="w-full backdrop-blur-sm  border border-white/[0.08] shadow-xl shadow-black/10 transition-all duration-200 group/button">
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover/button:scale-110 group-hover/button:rotate-90" />
            New Project
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>MAIN</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="hover:bg-purple-500/10 hover:text-purple-400">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="hover:bg-purple-500/10 hover:text-purple-400">
                    <FolderKanban className="mr-2 h-4 w-4" />
                    Projects
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="hover:bg-purple-500/10 hover:text-purple-400">
                    <Users className="mr-2 h-4 w-4" />
                    Clients
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
      <ProjectDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
