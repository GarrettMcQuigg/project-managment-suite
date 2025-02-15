'use client';

import { useState } from 'react';
import { Button } from '@/packages/lib/components/button';
import { Plus } from 'lucide-react';
import UnifiedProjectWorkflow from '@/app/(main)/_src/project-workflow-dialog';
import { ProjectFormData } from '@/app/(main)/_src/components/project-step';
import { fetcher } from '@/packages/lib/helpers/fetcher';
import { API_PROJECT_ADD_ROUTE, API_PROJECT_LIST_ROUTE } from '@/packages/lib/routes';
import { toast } from 'react-toastify';
import { mutate } from 'swr';

export function NewProjectButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleComplete = async (data: ProjectFormData) => {
    try {
      const response = await fetcher({
        url: API_PROJECT_ADD_ROUTE,
        requestBody: data
      });

      if (response.err) {
        toast.error('Failed to create project');
        return;
      }

      mutate(API_PROJECT_LIST_ROUTE);
      setIsOpen(false);
      toast.success('Project created successfully');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="transition-all duration-300 group/button">
        <Plus className="h-4 w-4 transition-transform duration-300 group-hover/button:rotate-90" />
        <span className="sm:block hidden">New Project</span>
      </Button>
      <UnifiedProjectWorkflow open={isOpen} onOpenChange={setIsOpen} onComplete={handleComplete} />
    </>
  );
}
