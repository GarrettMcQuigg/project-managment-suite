import { NextResponse } from 'next/server';
import { StatusCodes } from '../constants/status-codes';
import { cookies } from 'next/headers';

export type ResponseOptions = {
  message?: string;
  content?: any;
  err?: any;
};

function createResponseHandler(defaultMessage: string, statusCode: number) {
  return (options?: ResponseOptions) => {
    const { message, content, err } = options || {};

    let response: ResponseOptions = {
      message: message || defaultMessage
    };
    if (message !== undefined) response.message = message;
    if (content !== undefined) response.content = content;
    if (err !== undefined) response.err = err;

    if (Object.keys(response).length === 0) {
      response.message = defaultMessage;
    }

    return NextResponse.json(response, { status: statusCode });
  };
}

export const handleSuccess = createResponseHandler('Success', StatusCodes.OK);

export const handleBadRequest = createResponseHandler('Bad Request', StatusCodes.BAD_REQUEST);
export const handleNotFound = createResponseHandler('Not Found', StatusCodes.NOT_FOUND);
export const handleConflict = createResponseHandler('Conflict', StatusCodes.CONFLICT);
export const handleError = createResponseHandler('Error', StatusCodes.INTERNAL_SERVER_ERROR);

export async function handleUnauthorized(options?: ResponseOptions) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  allCookies.forEach((cookie) => {
    cookieStore.delete(cookie.name);
  });

  return createResponseHandler('Unauthorized', StatusCodes.UNAUTHORIZED)(options);
}
