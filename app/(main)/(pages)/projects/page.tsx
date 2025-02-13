import { getProjects } from '@/packages/lib/helpers/get-project-list';
import ProjectCard from './_src/project-card';
import Link from 'next/link';
import { PROJECT_DETAILS_ROUTE, routeWithParam } from '@/packages/lib/routes';
import { AddProjectButton } from './_src/add-project';

export default async function ProjectsPage() {
  const projects = await getProjects();

  if (!projects) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-500">Failed to fetch projects</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <AddProjectButton />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div className="transition-transform hover:scale-[1.02]">
            <ProjectCard
              project={{
                id: project.id,
                name: project.name,
                description: project.description || '',
                status: project.status,
                startDate: project.startDate,
                endDate: project.endDate
              }}
            />
          </div>
          // <Link key={project.id} href={routeWithParam(PROJECT_DETAILS_ROUTE, { id: project.id })} className="transition-transform hover:scale-[1.02]">
          // </Link>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full text-center">
            <p className="text-lg text-gray-500">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}
