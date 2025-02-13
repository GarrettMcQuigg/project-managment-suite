'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Mail, Phone, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    <motion.div
      key={client.id}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-lg bg-card shadow-md transition-all duration-300 hover:shadow-lg dark:shadow-lg dark:shadow-primary/5 dark:hover:shadow-primary/10"
    >
      <div className="absolute inset-0 rounded-lg border border-border/50" />

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 transition-colors duration-300 group-hover:from-primary/10 group-hover:to-accent/10 dark:from-primary/10 dark:via-transparent dark:to-accent/10 dark:group-hover:from-primary/15 dark:group-hover:to-accent/15"></div>

      <div className="relative z-10 p-6">
        <h2 className="mb-2 text-2xl font-semibold text-card-foreground">{client.name}</h2>

        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="mr-2 h-4 w-4" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="mr-2 h-4 w-4" />
            <span>{client.phone}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Client since {new Date(client.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewDetails}
            className="flex items-center rounded-md border bg-primary dark:bg-transparent border-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors dark:hover:bg-primary/30 hover:bg-primary/90"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </motion.button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/60 via-primary/80 to-accent/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </motion.div>
  );
};

export default ClientCard;
