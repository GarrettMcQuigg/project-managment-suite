'use client';

import { useState } from 'react';
import { Client } from '@prisma/client';
import { Mail, Phone, Calendar, User, X } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/packages/lib/components/dialog';
import { Button } from '@/packages/lib/components/button';

export default function PortalClientInfo({ client }: { client: Client }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors group bg-card/80 backdrop-blur-md border border-border border-primary/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">{client.name}</h3>
            <p className="text-sm text-muted-foreground">View Client Details</p>
          </div>
        </div>
        <div className="text-primary">
          <span className="text-sm font-medium">Details</span>
        </div>
      </button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-lg font-semibold">{client.name}</span>
                <p className="text-sm text-muted-foreground font-normal">Client Information</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{client.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{client.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Client Since</p>
                  <p className="font-medium text-foreground">{format(new Date(client.createdAt), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Status</span>
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  client.isArchived ? 'bg-muted text-muted-foreground border-border' : 'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                {client.isArchived ? 'Archived' : 'Active'}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
