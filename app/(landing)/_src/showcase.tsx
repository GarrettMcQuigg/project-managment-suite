import { Card, CardContent } from '@/packages/lib/components/card';
import { Zap, Users, Calendar } from 'lucide-react';

export function ShowcaseSection() {
  return (
    <section id="features" className="w-full py-12 md:py-16 lg:py-24">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Designed for Creatives</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col items-center space-y-2 p-6">
              <Zap className="h-12 w-12 text-foreground" />
              <h3 className="text-xl font-bold">Intuitive Interface</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">Designed with creatives in mind, our interface is as beautiful as it is functional.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center space-y-2 p-6">
              <Users className="h-12 w-12 text-foreground" />
              <h3 className="text-xl font-bold">Client Management</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">Keep track of clients, projects, and communications all in one place.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center space-y-2 p-6">
              <Calendar className="h-12 w-12 text-foreground" />
              <h3 className="text-xl font-bold">Project Timelines</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">Visualize project timelines and never miss a deadline again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
