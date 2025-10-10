'use client';

import { useState } from 'react';
import type { Client } from '@prisma/client';
import { Mail, Phone, Calendar, User, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

export default function PortalClientInfo({ client }: { client: Client }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg">
      {/* Trigger Button */}
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">{client.name}</h3>
            <p className="text-sm text-muted-foreground">Client Information</p>
          </div>
        </div>
        <div
          className={`
            p-1 rounded-full transition-all duration-300
            ${isExpanded ? 'rotate-180 bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}
          `}
        >
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>

      {/* Expandable Content */}
      <div
        className={`
          transition-all duration-300 overflow-hidden
          ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 pb-4 space-y-4 border-t border-border/50">
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground text-sm truncate">{client.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground text-sm">{client.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Client Since</p>
                <p className="font-medium text-foreground text-sm">{format(new Date(client.createdAt), 'MMMM d, yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
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
      </div>
    </div>
  );
}
