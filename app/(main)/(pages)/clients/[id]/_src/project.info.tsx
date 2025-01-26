import { Card, CardHeader, CardTitle, CardContent } from '@/packages/lib/components/card';
import { Project } from '@prisma/client';
import { Badge } from 'lucide-react';
import Link from 'next/link';

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Projects</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.length === 0 && <p>No projects found</p>}
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">{project.description}</p>
              <div className="flex justify-between items-center">
                <Badge>{project.status}</Badge>
                <Link href={`/projects/${project.id}`} className="text-blue-500 hover:underline">
                  View Details
                </Link>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <p>Start: {new Date(project.startDate).toLocaleDateString()}</p>
                <p>End: {new Date(project.endDate).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
