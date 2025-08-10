'use client';

import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import type { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_PROJECT_GET_BY_ID_ROUTE, INVOICE_DETAILS_ROUTE, PROJECTS_ROUTE, routeWithParam } from '@/packages/lib/routes';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import Link from 'next/link';
import { Calendar, Clock, Users, Pencil, Eye, EyeOff, KeyRound, Copy, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { DeleteProjectButton } from './delete-project';

interface ProjectDetailsProps {
  projectId: string;
  showInteralControls?: boolean;
  onEditClick?: () => void;
}

export default function ProjectDetails({ projectId, onEditClick }: ProjectDetailsProps) {
  const endpoint = API_PROJECT_GET_BY_ID_ROUTE + projectId;
  const { data, error } = useSWR(endpoint, swrFetcher);
  const [project, setProject] = useState<ProjectWithMetadata | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (data) {
      setProject(data.content);
    }

    if (error) {
      console.error('Error fetching project:', error.message);
      redirect(PROJECTS_ROUTE);
    }
  }, [data, error]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Project not found or access denied.</div>
      </div>
    );
  }

  const handleCopyToClipboard = (text: string, message: string = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const daysRemaining = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isPastDue = daysRemaining < 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative group">
        <div className="relative bg-gradient-to-br from-primary/5 via-card to-secondary/10 dark:from-primary/10 dark:via-card/80 dark:to-secondary/20 rounded-xl shadow-lg shadow-primary/10 group-hover:shadow-primary/20 transition-all duration-500 overflow-hidden border border-border">
          {/* Floating Status Badge */}
          <div className="absolute z-20">
            <div className="px-3 py-2 rounded-br-lg shadow-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white backdrop-blur-sm transform transition-transform duration-300">
              {project.status}
            </div>
          </div>

          {/* Floating Edit Actions */}
          <div className="absolute top-6 right-6 z-10 flex gap-6">
            <div className="cursor-pointer transform hover:scale-110 transition-all duration-300" onClick={onEditClick}>
              <Pencil className="h-5 w-5 text-primary" />
            </div>
            <div className="cursor-pointer transform hover:scale-110 transition-all duration-300">
              <DeleteProjectButton projectId={project.id} />
            </div>
          </div>

          <div className="p-8 pt-12">
            <div className="space-y-6">
              {/* Project Title */}
              <div>
                <h1 className="text-md sm:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{project.name}</h1>
                <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mt-2">{project.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
        {/* Client Card */}
        <div className="relative group">
          <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Client</h3>
                <p className="font-medium text-sm text-muted-foreground">{project.client.name}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm">{project.client.email}</p>
              <p className="text-sm">{project.client.phone || ''}</p>
            </div>
          </div>
        </div>

        {/* Portal Password Card */}
        <div className="relative group">
          <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 border border-emerald-500/20">
                <KeyRound className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Portal Access</h3>
                <p className="text-sm text-muted-foreground">Client Password</p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-muted/50 rounded-lg px-3 py-2 pr-10 font-mono text-sm border">
                {showPassword ? project.portalPassEncryption : <span className="tracking-[0.2em]">••••••••</span>}
              </div>
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors" onClick={togglePasswordVisibility}>
                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="relative group">
          <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl px-6 pt-6 pb-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-500/20">
                <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Timeline</h3>
                <p className="text-sm text-muted-foreground">Project Duration</p>
              </div>
            </div>
            {/* Horizontal layout for larger screens */}
            <div className="hidden min-[415px]:flex gap-4 items-center justify-between relative">
              <p className="text-sm font-medium text-foreground">
                <span className="text-sm text-muted-foreground">Start:</span> {format(new Date(project.startDate), 'MMM d, yyyy')}
              </p>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                  className={`relative w-16 h-16 rounded-full shadow-lg dark:shadow-black/30 flex items-center justify-center overflow-hidden group-hover:animate-card-shimmer border-2 ${
                    isPastDue ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-bold ${isPastDue ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}`}>{Math.abs(daysRemaining)}</span>
                    <span className={`text-[10px] ${isPastDue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {isPastDue ? 'overdue' : 'days left'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm font-medium text-foreground">
                <span className="text-sm text-muted-foreground">End:</span> {format(new Date(project.endDate), 'MMM d, yyyy')}
              </p>
            </div>

            {/* Vertical layout for smaller screens */}
            <div className="flex min-[415px]:hidden flex-col space-y-4 relative">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Start:</span>
                  <span className="text-foreground ml-1 font-medium">{format(new Date(project.startDate), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {/* Floating days remaining circle - vertical center */}
              <div className="flex justify-center py-2">
                <div
                  className={`relative w-16 h-16 rounded-full shadow-lg dark:shadow-black/30 flex items-center justify-center overflow-hidden group-hover:animate-card-shimmer border-2 ${
                    isPastDue ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-bold ${isPastDue ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}`}>{Math.abs(daysRemaining)}</span>
                    <span className={`text-[10px] ${isPastDue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {isPastDue ? 'overdue' : 'days left'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <div className="text-sm">
                  <span className="text-muted-foreground">End:</span>
                  <span className="text-foreground ml-1 font-medium">{format(new Date(project.endDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      {project.invoices && project.invoices.length > 0 && (
        <div className="relative group">
          <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-500 border border-border overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Project Invoices</h2>
              </div>

              <div className="overflow-hidden rounded-xl border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-muted/50 to-secondary/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Invoice #</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Payment Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {project.invoices.map((invoice, index) => (
                        <tr key={invoice.id} className={`hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-card/50' : 'bg-transparent'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={routeWithParam(INVOICE_DETAILS_ROUTE, { id: invoice.id })}
                              className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                            >
                              {invoice.invoiceNumber}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-foreground font-semibold">${invoice.amount ? Number(invoice.amount).toFixed(2) : '0.00'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                invoice.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : invoice.status === 'SENT' || invoice.status === 'DRAFT'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {invoice.stripeCheckoutUrl ? (
                              <div className="flex items-center space-x-3">
                                <a
                                  href={invoice.stripeCheckoutUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/20 rounded-lg transition-all duration-200 border border-primary/20"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Open
                                </a>
                                <button
                                  onClick={() => handleCopyToClipboard(invoice.stripeCheckoutUrl!, 'Payment link copied to clipboard!')}
                                  className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                  title="Copy payment link"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">No payment link</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
