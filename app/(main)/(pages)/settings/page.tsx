import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import PersonalSettings from './_src/components/personal-settings';
import { handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return handleUnauthorized();
  }

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <PersonalSettings currentUser={currentUser} />
    </div>
  );
}
