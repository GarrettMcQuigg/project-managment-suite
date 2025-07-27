import { getProjectList } from '@/packages/lib/helpers/get-project-list';
import ProjectCard from './_src/project-card';
import { NewProjectButton } from './_src/add-project';
import { CheckpointStatus } from '@prisma/client';

export default async function ProjectsPage() {
  const projects = await getProjectList();

  if (!projects) {
    return (
      <div className="col-span-full text-center">
        <p className="text-lg text-gray-500">No projects found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 min-h-screen-minus-header">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Projects</h2>
        <NewProjectButton />
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div key={project.id} className="transition-transform hover:scale-[1.02]">
            <ProjectCard
              project={{
                id: project.id,
                name: project.name,
                description: project.description || '',
                status: project.status,
                startDate: project.startDate,
                progress:
                  project.checkpoints && project.checkpoints.length > 0
                    ? Math.round((project.checkpoints.reduce((acc, checkpoint) => acc + (checkpoint.status === CheckpointStatus.COMPLETED ? 1 : 0), 0) / project.checkpoints.length) * 100)
                    : 0,
                endDate: project.endDate,
                portalSlug: project.portalSlug,
                team: [],
                priority: 'low'
              }}
            />
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full text-center">
            <p className="text-lg text-black dark:text-white">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}
