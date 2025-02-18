import { Card, CardContent } from '@/packages/lib/components/card';
import { Clock, DollarSign, FolderKanban, MessageSquare, Star, Users } from 'lucide-react';

export function OverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-foreground/20 bg-gradient-to-br from-foreground/8 to-background">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/10">
              <DollarSign className="size-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <h3 className="text-2xl font-semibold">$45,231.89</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
              <Star className="size-4 text-emerald-500" />
            </div>
            <p className="text-sm text-emerald-500">+20.1% from last month</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-foreground/20 bg-gradient-to-br from-background to-foreground/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/10">
              <Users className="size-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
              <h3 className="text-2xl font-semibold">24</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
              <Star className="size-4 text-emerald-500" />
            </div>
            <p className="text-sm text-emerald-500">+4 new this month</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-foreground/20 bg-gradient-to-br from-background to-foreground/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/10">
              <FolderKanban className="size-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
              <h3 className="text-2xl font-semibold">12</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
              <Star className="size-4 text-emerald-500" />
            </div>
            <p className="text-sm text-emerald-500">85% on track</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-foreground/20 bg-gradient-to-br from-background to-foreground/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/10">
              <MessageSquare className="size-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client Messages</p>
              <h3 className="text-2xl font-semibold">182</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
              <Star className="size-4 text-emerald-500" />
            </div>
            <p className="text-sm text-emerald-500">98% response rate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
