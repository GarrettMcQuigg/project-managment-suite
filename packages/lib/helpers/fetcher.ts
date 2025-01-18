import { HttpMethods } from '../constants/http-methods';
import { ResponseOptions } from './api-response-handlers';
import { StatusCodes } from '../constants/status-codes';

type FetcherOptions = {
  url: string;
  requestBody?: any;
  formData?: FormData;
  method?: HttpMethods;
  headers?: Record<string, string>;
};

export async function fetcher(opts: FetcherOptions): Promise<ResponseOptions> {
  try {
    const defaultHeaders = opts.formData ? undefined : { 'Content-Type': 'application/json' };

    const response = await fetch(opts.url, {
      method: opts.method ?? HttpMethods.POST,
      body: opts.formData ?? (opts.requestBody ? JSON.stringify(opts.requestBody) : undefined),
      headers: {
        ...defaultHeaders,
        ...opts.headers
      }
    });

    if (response.status === StatusCodes.UNAUTHORIZED) {
      localStorage.clear();
      window.location.href = '/';
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        return { content: null, message: data.message, err: data.err || 'API Error' };
      }

      return { content: data.content, message: data.message, err: null };
    } else {
      const text = await response.text();
      console.error('Received non-JSON response:', text);
      throw new Error('Received non-JSON response from server');
    }
  } catch (err: unknown) {
    console.error('Fetch Error:', err);
    return { content: null, message: 'API Error; Check console logs for more information.', err: err instanceof Error ? err : new Error(String(err)) };
  }
}

export const swrFetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'An error occurred');
  }

  return response.json();
};
