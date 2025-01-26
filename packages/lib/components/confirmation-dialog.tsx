'use client';

import * as React from 'react';
import { Button } from './button';
import { DialogTitle, DialogContent, DialogDescription, DialogHeader, Dialog, DialogClose } from './dialog';

export type ConfirmationDialogProps = {
  children: React.ReactNode;
  onConfirm: () => void;
  title: string;
  description: string;
};

export default function ConfirmationDialog({ children, onConfirm, title, description }: ConfirmationDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Children = Dialog Trigger */}
      {children}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-2">
          <Button variant="destructive" onClick={handleConfirm}>
            Confirm
          </Button>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
