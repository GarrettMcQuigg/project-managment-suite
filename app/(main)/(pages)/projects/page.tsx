import { getProjectList } from '@/packages/lib/helpers/get-project-list';
import ProjectCard from './_src/project-card';
import { NewProjectButton } from './_src/add-project';

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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <NewProjectButton />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div key={project.id} className="transition-transform hover:scale-[1.02]">
            <ProjectCard
              project={{
                id: project.id,
                name: project.name,
                description: project.description || '',
                status: project.status,
                startDate: project.startDate,
                endDate: project.endDate,
                portalSlug: project.portalSlug
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
