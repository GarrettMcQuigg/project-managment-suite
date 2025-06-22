'use client';

import { swrFetcher } from '@/packages/lib/helpers/fetcher';
import type { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_PROJECT_GET_BY_ID_ROUTE, PROJECTS_ROUTE } from '@/packages/lib/routes';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { Calendar, Clock, Users, Pencil, Eye, EyeOff, KeyRound, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import { DeleteProjectButton } from './delete-project';
import { Card } from '@/packages/lib/components/card';

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
    return <div>Project not found or access denied.</div>;
  }

  const handleCopyToClipboard = (text: string, message: string = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="bg-white dark:bg-[#0F1A1C] p-6 min-w-full">
      <div className="mb-6 flex items-start justify-between">
        <div className="w-full">
          <div className="md:flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h2>
            <div className="flex gap-4">
              <Pencil className="h-5 w-5 cursor-pointer" onClick={onEditClick} />
              <DeleteProjectButton projectId={project.id} />
            </div>
          </div>
          <div className="mt-2 inline-flex items-center rounded-full bg-gray-100 dark:bg-[#1A2729] px-3 py-1">
            <span className="text-sm font-medium text-emerald-600 dark:text-[#00b894]">{project.status}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">Project Details</h3>
            <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
          </div>

          <div className="sm:flex justify-between md:max-w-[86%]">
            <div>
              <h3 className="mb-3 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">Client Information</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1A2729] text-emerald-600 dark:text-[#00b894]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{project.client.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{project.client.email}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">Portal Password</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1A2729] text-emerald-600 dark:text-[#00b894]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div className="relative">
                  <div className="bg-gray-200 dark:bg-[#0A1214] rounded px-3 py-2 pr-10 font-mono min-w-32">
                    {showPassword ? project.portalPassEncryption : <span className="tracking-[0.2em]">••••••••</span>}
                  </div>
                  <div
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-100 dark:bg-[#1A2729] p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-[#00b894]" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Timeline</p>
                <p className="text-gray-900 dark:text-white">
                  {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-100 dark:bg-[#1A2729] p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-[#00b894]" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Project Duration</p>
                <p className="text-gray-900 dark:text-white">
                  {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {project.invoices && project.invoices.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Invoices</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment Link
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#0F1A1C] divide-y divide-gray-200 dark:divide-gray-700">
                {project.invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ${invoice.amount ? Number(invoice.amount).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'PAID' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : invoice.status === 'SENT' || invoice.status === 'DRAFT'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {invoice.stripeCheckoutUrl ? (
                        <div className="flex items-center space-x-2">
                          <a 
                            href={invoice.stripeCheckoutUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open
                          </a>
                          <button
                            onClick={() => handleCopyToClipboard(invoice.stripeCheckoutUrl!, 'Payment link copied to clipboard!')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title="Copy payment link"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">No payment link</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
