'use client';

import { ClientProjectList } from './client-project-list';
import { Project } from '@prisma/client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import { API_CLIENT_GET_BY_ID_ROUTE, API_CLIENT_UPDATE_ROUTE, CLIENTS_ROUTE } from '@/packages/lib/routes';
import { Skeleton } from '@/packages/lib/components/skeleton';
import { ClientWithMetadata } from '@/packages/lib/prisma/types';
import { redirect } from 'next/navigation';
import { Pencil, Users, Mail, Phone, Calendar, Clock } from 'lucide-react';
import { DeleteClientButton } from './delete-client';
import { ClientFormDialog } from './client-form-dialog';
import { format } from 'date-fns';

export function ClientInfo({ clientId }: { clientId: string }) {
  const endpoint = API_CLIENT_GET_BY_ID_ROUTE + clientId;
  const { data, error, isLoading } = useSWR(endpoint, swrFetcher);
  const [client, setClient] = useState<ClientWithMetadata | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setClient(data.content);
      setProjects(data.content.projects);
    }

    if (error) {
      console.error('Error fetching client:', error.message);
      redirect(CLIENTS_ROUTE);
    }
  }, [data, error]);

  if (error) return redirect(CLIENTS_ROUTE);

  if (isLoading || !client) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-primary/5 via-card to-secondary/10 dark:from-primary/10 dark:via-card/80 dark:to-secondary/20 rounded-xl shadow-lg p-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-6" />
        </div>
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <Skeleton className="h-16 w-16 rounded-full mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative group">
          <div className="relative bg-gradient-to-br from-primary/5 via-card to-secondary/10 dark:from-primary/10 dark:via-card/80 dark:to-secondary/20 rounded-xl shadow-lg shadow-primary/10 group-hover:shadow-primary/20 transition-all duration-500 overflow-hidden border border-border">
            {/* Floating Status Badge */}
            <div className="absolute z-20">
              <div
                className={`px-3 py-2 rounded-br-lg shadow-xl text-sm font-semibold backdrop-blur-sm transform transition-transform duration-300 ${
                  client.isArchived ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                }`}
              >
                {client.isArchived ? 'Archived' : 'Active'}
              </div>
            </div>

            {/* Floating Edit Actions */}
            <div className="absolute top-6 right-6 z-10 flex gap-6">
              <div className="cursor-pointer transform hover:scale-110 transition-all duration-300" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="h-5 w-5 text-primary" />
              </div>
              <div className="cursor-pointer transform hover:scale-110 transition-all duration-300">
                <DeleteClientButton clientId={client.id} />
              </div>
            </div>

            <div className="p-8 pt-12">
              <div className="space-y-6">
                {/* Client Title */}
                <div>
                  <h1 className="text-md sm:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{client.name}</h1>
                  <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mt-2">Client information and project overview</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
          {/* Contact Card */}
          <div className="relative group">
            <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Contact</h3>
                  <p className="text-sm text-muted-foreground">Email & Phone</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-foreground break-all">{client.email}</p>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-foreground">{client.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Projects Card */}
          <div className="relative group">
            <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-400/10 border border-blue-500/20">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Projects</h3>
                  <p className="text-sm text-muted-foreground">Total Count</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{projects.length}</div>
                  <div className="text-sm text-muted-foreground">Active Projects</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="relative group mb-8">
            <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-500/20">
                  <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Timeline</h3>
                  <p className="text-sm text-muted-foreground">Client History</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-foreground ml-1">{format(new Date(client.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="text-foreground ml-1">{format(new Date(client.updatedAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <ClientProjectList projects={projects} />
      </div>

      <ClientFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        defaultValues={
          client
            ? {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone
              }
            : undefined
        }
        mode="edit"
        endpoint={API_CLIENT_UPDATE_ROUTE}
      />
    </>
  );
}
