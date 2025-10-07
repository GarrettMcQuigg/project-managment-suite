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

        <div className="flex justify-end gap-4">
          <DialogClose asChild>
            <Button className="bg-foreground/70 hover:bg-foreground/80">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
