import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import PersonalSettings from './_src/components/personal-settings';
import { handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/packages/lib/components/tabs';
import { Suspense } from 'react';
import { SubscriptionSkeleton } from './_src/components/subscription-skeleton';
import SubscriptionDetails from './_src/components/subscription-details';

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return handleUnauthorized();
  }

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <PersonalSettings currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <div className="container max-w-4xl py-10">
            <Suspense fallback={<SubscriptionSkeleton />}>
              <SubscriptionDetails />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
