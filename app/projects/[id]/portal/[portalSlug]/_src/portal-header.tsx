'use client';

import { ProjectStatus } from '@prisma/client';
import { motion } from 'framer-motion';

interface PortalHeaderProps {
  projectName: string;
  projectStatus: ProjectStatus;
  isOwner: boolean;
  visitorName: string;
}

// Status colors mapping - adjusted for dark mode
const statusColors: Record<ProjectStatus, string> = {
  DRAFT: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  PREPARATION: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800/40 dark:text-yellow-300',
  ACTIVE: 'bg-blue-200 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300',
  PAUSED: 'bg-orange-200 text-orange-800 dark:bg-orange-800/40 dark:text-orange-300',
  COMPLETED: 'bg-green-200 text-green-800 dark:bg-green-800/40 dark:text-green-300',
  ARCHIVED: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  DELETED: 'bg-red-200 text-red-800 dark:bg-red-800/40 dark:text-red-300'
};

export default function PortalHeader({ projectName, projectStatus, isOwner, visitorName }: PortalHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#0B1416]/50 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">CreativeSuite Portal</h1>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[projectStatus]}`}>{projectStatus.replace('_', ' ')}</div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-[#00b894]" />
              <span className="text-sm text-gray-500 dark:text-gray-400">{isOwner ? 'Owner View' : 'Client Portal'}</span>
            </div>

            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400 mr-2">Viewing as:</span>
              <span className="font-medium">{visitorName}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-medium">{projectName}</h2>
        </div>
      </div>
    </motion.header>
  );
}
