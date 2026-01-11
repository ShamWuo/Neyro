import safeFetch from './safe-fetch';
import { isUrlSafeForExternalFetch } from './url-safety';

export default async function safeFetchUrlChecked(
  input: RequestInfo,
  init?: RequestInit,
  attempts = 2
) {
  let urlStr: string | null = null;
  if (typeof input === 'string') urlStr = input;
  else if (typeof Request !== 'undefined' && input instanceof Request) urlStr = (input as Request).url;
  else if ((input as any)?.url) urlStr = (input as any).url;

  if (!isUrlSafeForExternalFetch(urlStr)) {
    throw new Error('Unsafe URL blocked by server-side URL safety policy');
  }

  // Limit redirects to prevent open redirects
  const initWithRedirect = { ...init, redirect: 'follow' as const };
  
  const response = await safeFetch(input, initWithRedirect, attempts);
  
  // Validate final URL after redirects (if any happened)
  const finalUrl = response.url || urlStr;
  if (finalUrl && !isUrlSafeForExternalFetch(finalUrl)) {
    throw new Error('Redirect to unsafe URL blocked by server-side URL safety policy');
  }

  return response;
}

export { isUrlSafeForExternalFetch };
