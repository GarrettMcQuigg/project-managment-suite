'use client';

import { Button } from '@/packages/lib/components/button';
import { Plus } from 'lucide-react';

export function AddProjectButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="gap-2">
      <Plus className="h-4 w-4" />
      New Project
    </Button>
  );
}
