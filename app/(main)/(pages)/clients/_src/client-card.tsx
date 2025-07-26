'use client';

import type React from 'react';
import { Calendar, Mail, Phone, Eye, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/packages/lib/components/tooltip';

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: Date;
  };
}

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/clients/${client.id}`);
  };

  return (
    <div className="relative group perspective-1000">
      <div className="relative bg-card dark:bg-card/80 rounded-2xl shadow-lg hover:shadow-2xl shadow-primary/10 group-hover:shadow-primary/40 group-hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-1 group-hover:rotate-[0.5deg] border border-border">
        {/* Floating status badge */}
        <div className="absolute -top-3 -right-3 z-10">
          <div className="px-4 py-2 rounded-full shadow-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 backdrop-blur-sm">
            ACTIVE
          </div>
        </div>

        <div className="p-8">
          {/* Header with gradient background */}
          <div className="relative -m-8 mb-6 p-8 bg-gradient-to-br from-primary/5 to-secondary/10 dark:from-primary/10 dark:to-secondary/20 rounded-t-2xl backdrop-blur-[1px]">
            <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 break-words">{client.name}</h3>
            <div className="flex gap-2 items-center justify-between">
              <p className="text-foreground/70 text-sm line-clamp-1 break-words">{client.email}</p>
              <p className="text-foreground/60 text-sm line-clamp-1 break-words">{client.phone}</p>
            </div>

            {/* Floating client icon */}
            <div className="absolute -bottom-6 right-8">
              <div className="relative w-12 h-12 bg-card dark:bg-card/90 rounded-full shadow-lg dark:shadow-black/30 flex items-center justify-center overflow-hidden group-hover:animate-card-shimmer">
                <User className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex items-center justify-between mt-12">
            {/* Timeline */}
            <div className="flex items-center text-sm text-foreground/70">
              <Calendar className="w-4 h-4 mr-2 text-primary/70" />
              <span>
                Client since <b>{new Date(client.createdAt).toLocaleDateString()}</b>
              </span>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={handleViewDetails}
                      className="p-3 rounded-xl bg-gradient-to-r from-primary to-primary/50 hover:opacity-90 transition-all duration-200 text-primary-foreground shadow-lg hover:shadow-xl cursor-pointer group/details relative"
                    >
                      <Eye className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>View client details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
