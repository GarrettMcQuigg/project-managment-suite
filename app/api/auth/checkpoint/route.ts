import { handleBadRequest, handleError, handleSuccess } from '@/packages/lib/helpers/api-response-handlers';
import { AuthCheckpointRequestBody, AuthCheckpointRequestBodySchema } from './types';
import { checkEmailExists } from '@/packages/lib/helpers/check-email-exists';
import { AUTH_SIGNIN_ROUTE, AUTH_SIGNUP_ROUTE } from '@/packages/lib/routes';

export async function POST(request: Request) {
  try {
    const requestBody: AuthCheckpointRequestBody = await request.json();

    const { error } = AuthCheckpointRequestBodySchema.validate(requestBody);
    if (error) {
      return handleBadRequest({ message: error.message, err: error });
    }

    const emailExists = await checkEmailExists(requestBody.email);

    return handleSuccess({
      message: 'Success',
      content: {
        redirect: emailExists ? AUTH_SIGNIN_ROUTE : AUTH_SIGNUP_ROUTE
      }
    });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to check email.', err });
  }
}
