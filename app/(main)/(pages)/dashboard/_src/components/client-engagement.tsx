import { Avatar, AvatarFallback, AvatarImage } from '@/packages/lib/components/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/packages/lib/components/card';

const engagements = [
  {
    client: 'Acme Corp',
    avatar: '/acme-logo.png',
    project: 'Website Redesign',
    lastContact: '2 days ago',
    status: 'In Progress'
  },
  {
    client: 'TechStart',
    avatar: '/techstart-logo.png',
    project: 'Mobile App Development',
    lastContact: '1 day ago',
    status: 'Feedback'
  },
  {
    client: 'GreenEco',
    avatar: '/greeneco-logo.png',
    project: 'Branding Package',
    lastContact: '5 days ago',
    status: 'Completed'
  },
  {
    client: 'FashionForward',
    avatar: '/fashionforward-logo.png',
    project: 'Spring Collection Photoshoot',
    lastContact: '3 days ago',
    status: 'In Progress'
  }
];

export function ClientEngagement({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card className={`border-purple-500/20 bg-gradient-to-tl from-purple-500/4 via-background to-background ${className}`}>
      <CardHeader>
        <CardTitle>Client Engagement</CardTitle>
        <CardDescription>Recent client interactions and project status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {engagements.map((item) => (
            <div key={item.client} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={item.avatar} alt={item.client} />
                <AvatarFallback>{item.client[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{item.client}</p>
                <p className="text-sm text-muted-foreground">{item.project}</p>
              </div>
              <div className="ml-auto font-medium">
                <p className="text-sm text-muted-foreground">Last Contact: {item.lastContact}</p>
                <p className={`text-sm ${item.status === 'Completed' ? 'text-green-500' : 'text-purple-400'}`}>{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
