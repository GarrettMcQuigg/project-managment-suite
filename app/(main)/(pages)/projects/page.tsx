import ProjectsTable from './_src/projects.table';

export default function ProjectsPage() {
  return (
    <div className="space-y-4 p-8">
      <h1 className="text-3xl font-bold">Projects</h1>
      <ProjectsTable />
    </div>
  );
}
