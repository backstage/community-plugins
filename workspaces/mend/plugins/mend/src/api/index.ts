import { QueryClient } from '@tanstack/react-query';
import { createApiRef, DiscoveryApi } from '@backstage/core-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';

/**
 * Plugin API
 */
export type MendApi = {
  discoveryApi: DiscoveryApi;
};

export const mendApiRef = createApiRef<MendApi>({
  id: 'plugin.mend.service',
});

export class MendClient {
  discoveryApi: DiscoveryApi;

  constructor(options: { discoveryApi: DiscoveryApi }) {
    this.discoveryApi = options.discoveryApi;
  }
}

/**
 * Catalog API Ref
 */
export const catalogApiRef = createApiRef<CatalogApi>({
  id: 'plugin.catalog.service',
});

/**
 * React Query Client
 */
export const queryClient = new QueryClient();

/**
 * Fetch: GET, POST, PUT, REMOVE
 */
type QueryParams = Record<string, string>;

type RequestHeaders = Record<string, string>;

enum ApiHeaders {
  CONTENT_TYPE = 'Content-Type',
}

enum REQUEST_METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

interface RequestOptions {
  body?: any;
  headers?: RequestHeaders;
  params?: Record<string, any> | null;
  signal?: AbortSignal;
}

function assembleUri(uri: string, params?: QueryParams): string {
  if (!params) {
    return uri;
  }

  const queryString = new URLSearchParams(params).toString();
  return `${uri}?${queryString}`;
}

function buildHeaders(optionHeaders: RequestHeaders): Headers {
  const headers = new Headers();
  headers.set(ApiHeaders.CONTENT_TYPE, 'application/json');

  Object.keys(optionHeaders).forEach(header => {
    const headerValue = optionHeaders[header];
    if (headerValue) {
      headers.set(header, headerValue);
    }
  });

  return headers;
}

function fetchRequest(
  fetchApi: typeof fetch,
  method: REQUEST_METHOD,
  url: string,
  opts: RequestOptions,
): Promise<any> {
  const { params, body, headers, signal } = opts;

  const requestURL = params ? assembleUri(url, params) : url;

  const requestParams: RequestInit = {
    headers: buildHeaders(headers || {}),
    method,
    signal,
  };

  if (body) {
    requestParams.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return fetchApi(requestURL, requestParams);
}

function toJson(response: Response): Promise<any> {
  if (response.status === 204 || response.body === null) {
    return Promise.resolve({});
  }

  return response.json().then(json => {
    return response.ok ? json : Promise.reject(json);
  });
}

const defaultOpts: RequestOptions = {
  body: null,
  headers: {},
  params: null,
};

export function get<T>(
  fetchApi: typeof fetch,
  url: string,
  opts: RequestOptions = defaultOpts,
): Promise<T> {
  return fetchRequest(fetchApi, REQUEST_METHOD.GET, url, opts).then(toJson);
}

export function post<T>(
  fetchApi: typeof fetch,
  url: string,
  opts: RequestOptions = defaultOpts,
): Promise<T> {
  return fetchRequest(fetchApi, REQUEST_METHOD.POST, url, opts).then(toJson);
}

export function put<T>(
  fetchApi: typeof fetch,
  url: string,
  opts: RequestOptions = defaultOpts,
): Promise<T> {
  return fetchRequest(fetchApi, REQUEST_METHOD.PUT, url, opts).then(toJson);
}

export function remove<T>(
  fetchApi: typeof fetch,
  url: string,
  opts: RequestOptions = defaultOpts,
): Promise<T> {
  return fetchRequest(fetchApi, REQUEST_METHOD.DELETE, url, opts).then(toJson);
}
