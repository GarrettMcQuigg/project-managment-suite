'use client';

import { useState } from 'react';
import { Client } from '@prisma/client';
import { ChevronRight, Mail, Phone, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export default function PortalClientInfo({ client }: { client: Client }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Header - Always visible */}
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">{client.name}</h3>
            <p className="text-sm text-muted-foreground">Client Information</p>
          </div>
        </div>
        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} group-hover:text-foreground`} />
      </button>

      {/* Expandable Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 border-t border-border/50 bg-muted/20">
          <div className="pt-4 space-y-4">
            {/* Contact Information */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground text-sm">{client.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground text-sm">{client.phone}</p>
              </div>
            </div>

            {/* Client Since */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Client Since</p>
                <p className="font-medium text-foreground text-sm">{format(new Date(client.createdAt), 'MMMM d, yyyy')}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">Status</span>
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  client.isArchived ? 'bg-muted text-muted-foreground border-border' : 'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                {client.isArchived ? 'Archived' : 'Active'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
