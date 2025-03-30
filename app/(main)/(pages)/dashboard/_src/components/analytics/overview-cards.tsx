import { Card, CardContent } from '@/packages/lib/components/card';
import { Analytics } from '@prisma/client';
import { DollarSign, FolderKanban, MessageSquare, Star, Users } from 'lucide-react';

interface CurrentMonthRevenue {
  currentMonthRevenue: number;
  growth: number | null;
  formattedRevenue: string;
  formattedGrowth: string;
}

interface OverviewCardsProps {
  userAnalytics: Analytics;
  totalMessages: number;
  currentMonthRevenue?: CurrentMonthRevenue;
}

export function OverviewCards({ userAnalytics, totalMessages, currentMonthRevenue }: OverviewCardsProps) {
  console.log('currentMonthRevenue', currentMonthRevenue);
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
        {/* <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/10">
              <DollarSign className="size-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <h3 className="text-2xl font-semibold">{currentMonthRevenue?.formattedRevenue}</h3>
            </div>
          </div>
          {currentMonthRevenue?.growth && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
                <Star className="size-4 text-emerald-500" />
              </div>
              <p className="text-sm text-emerald-500">{currentMonthRevenue?.growth ? currentMonthRevenue.growth + 'from last month' : ''}</p>
            </div>
          )}
        </CardContent> */}
      </Card>
      <Card className="border-foreground/20 bg-gradient-to-br from-background to-foreground/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/10">
              <Users className="size-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
              <h3 className="text-2xl font-semibold">{userAnalytics.activeClients}</h3>
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
              <h3 className="text-2xl font-semibold">{userAnalytics.projectsCreated}</h3>
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
              <h3 className="text-2xl font-semibold">{totalMessages}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {userAnalytics.responseRate && (
              <>
                <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
                  <Star className="size-4 text-emerald-500" />
                </div>
                <p className="text-sm text-emerald-500">{userAnalytics.responseRate ? Number(userAnalytics.responseRate) : '0'}% response rate</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
