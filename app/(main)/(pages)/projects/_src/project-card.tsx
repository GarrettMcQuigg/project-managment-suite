'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, Eye } from 'lucide-react';
import type { ProjectStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { PROJECT_DETAILS_ROUTE, PROJECT_PORTAL_ROUTE, routeWithParam } from '@/packages/lib/routes';
import Link from 'next/link';
import { Button } from '@/packages/lib/components/button';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    startDate: Date;
    endDate: Date;
    portalSlug: string;
  };
}

const statusColors: Record<ProjectStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PREPARATION: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
  ACTIVE: 'bg-primary text-primary-foreground',
  PAUSED: 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
  COMPLETED: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
  ARCHIVED: 'bg-secondary text-secondary-foreground',
  DELETED: 'bg-destructive text-destructive-foreground'
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(routeWithParam(PROJECT_DETAILS_ROUTE, { id: project.id }));
  };

  const clientPortalUrl = routeWithParam(PROJECT_PORTAL_ROUTE, { id: project.id, portalSlug: project.portalSlug });

  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-lg bg-card shadow-md transition-all duration-300 hover:shadow-lg dark:shadow-lg dark:shadow-primary/5 dark:hover:shadow-primary/10 cursor-default"
    >
      <div className="relative z-10 p-6">
        <h2 className="mb-2 text-2xl font-semibold text-card-foreground">{project.name}</h2>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{project.description}</p>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[project.status]}`}>{project.status.replace('_', ' ')}</span>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Link href={clientPortalUrl} rel="noopener noreferrer">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90">
                <ExternalLink className="h-4 w-4" />
                Client Portal
              </Button>
            </motion.button>
          </Link>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleViewDetails}>
            <Button className="flex items-center rounded-md border bg-primary dark:bg-transparent border-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors dark:hover:bg-primary/30 hover:bg-primary/90">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </motion.button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/60 via-primary/80 to-accent/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </motion.div>
  );
};

export default ProjectCard;
