import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/packages/lib/components/card';
import { Progress } from '@/packages/lib/components/progress';
import { Analytics } from '@prisma/client';

const projects = [
  {
    name: 'Brand Identity Redesign',
    progress: 75,
    category: 'Branding',
    dueDate: 'Mar 25'
  },
  {
    name: 'Product Photography',
    progress: 60,
    category: 'Photography',
    dueDate: 'Mar 28'
  },
  {
    name: 'Website Redesign',
    progress: 90,
    category: 'Web Design',
    dueDate: 'Apr 2'
  },
  {
    name: 'Social Media Campaign',
    progress: 45,
    category: 'Marketing',
    dueDate: 'Apr 5'
  }
];

export function ProjectStats({ userAnalytics }: { userAnalytics: Analytics }) {
  return (
    <Card className="border-foreground/20 bg-gradient-to-r from-foreground/4 via-background to-background">
      <CardHeader>
        <CardTitle>Active Projects</CardTitle>
        <CardDescription>Track your ongoing project progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {projects.map((project) => (
            <div key={project.name} className="space-y-2">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{project.name}</h4>
                    <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs text-foreground">{project.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">Due {project.dueDate}</p>
                    <p className="text-sm text-foreground">{project.progress}% Complete</p>
                  </div>
                </div>
              </div>
              <Progress value={project.progress} className="h-2 bg-foreground" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
