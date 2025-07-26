'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/packages/lib/components/button';
import { ClientFormDialog } from '../[id]/_src/client-form-dialog';
import { API_CLIENT_ADD_ROUTE } from '@/packages/lib/routes';

export function ClientPageHeader() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-foreground">Clients</h2>
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <Plus className="h-4 w-4" />
        New Client
      </Button>
      <ClientFormDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} mode="create" endpoint={API_CLIENT_ADD_ROUTE} />
    </div>
  );
}
