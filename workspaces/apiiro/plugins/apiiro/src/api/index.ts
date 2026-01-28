/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { QueryClient } from '@tanstack/react-query';
import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
} from '@backstage/core-plugin-api';

/**
 * Plugin API
 */
export type ApiiroApi = {
  discoveryApi: DiscoveryApi;
  getDefaultAllowMetricsView: () => boolean;
};

export const apiiroApiRef = createApiRef<ApiiroApi>({
  id: 'plugin.apiiro.service',
});

export class ApiiroClient implements ApiiroApi {
  discoveryApi: DiscoveryApi;
  private readonly configApi: ConfigApi;

  constructor(options: { discoveryApi: DiscoveryApi; configApi: ConfigApi }) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
  }

  getDefaultAllowMetricsView(): boolean {
    return (
      this.configApi.getOptionalBoolean('apiiro.defaultAllowMetricsView') ??
      true
    );
  }
}

/**
 * React Query Client
 */
export const queryClient = new QueryClient();

/**
 * Fetch: GET, POST
 */
type QueryParams = Record<string, string>;

type RequestHeaders = Record<string, string>;

enum ApiHeaders {
  CONTENT_TYPE = 'Content-Type',
}

enum REQUEST_METHOD {
  GET = 'GET',
  POST = 'POST',
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
