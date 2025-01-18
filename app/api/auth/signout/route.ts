import { handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';

export async function POST() {
  return handleUnauthorized({ message: 'You have been signed out.' });
}
