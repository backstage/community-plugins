/*
 * Copyright 2025 The Backstage Authors
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
import { MendAuthSevice } from '../service/auth.service';

export type QueryParams = Record<string, string>;

type RequestHeaders = Record<string, string>;

enum ApiHeaders {
  AUTH_TOKEN = 'Authorization',
  CONTENT_TYPE = 'Content-Type',
  AGENT_NAME = 'agent-name',
  AGENT_VERSION = 'agent-version',
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
  headers.set(ApiHeaders.AGENT_NAME, 'pi-backstage');
  headers.set(ApiHeaders.AGENT_VERSION, '24.8.2');

  const authToken = MendAuthSevice.getAuthToken();

  if (authToken) {
    headers.set(ApiHeaders.AUTH_TOKEN, `Bearer ${authToken}`);
  }

  Object.keys(optionHeaders).forEach(header => {
    const headerValue = optionHeaders[header];
    if (headerValue) {
      headers.set(header, headerValue);
    }
  });

  return headers;
}

function fetchRequest(
  method: REQUEST_METHOD,
  path: string,
  opts: RequestOptions,
): Promise<any> {
  return MendAuthSevice.validateAuthToken(path).then(() => {
    const { params, body, headers } = opts;

    const url = `${MendAuthSevice.getBaseUrl()}${path}`;
    const requestURL = params ? assembleUri(url, params) : url;

    const requestParams = {
      headers: buildHeaders(headers || {}),
      method,
      body,
    };

    if (body) {
      requestParams.body =
        typeof body === 'string' ? body : JSON.stringify(body);
    }

    const requestObject: Request = new Request(requestURL, requestParams);

    return fetch(requestObject);
  });
}

function toJson(response: Response): Promise<any> {
  if (response.status === 204 || response.body === null) {
    return Promise.resolve({});
  }

  return response.json().then(json => {
    return response.ok ? json : Promise.reject(response);
  });
}

const defaultOpts: RequestOptions = {
  body: null,
  headers: {},
  params: null,
};

export function get<T>(
  url: string,
  opts: RequestOptions = defaultOpts,
): Promise<T> {
  return fetchRequest(REQUEST_METHOD.GET, url, opts).then(toJson);
}

export function post<T>(
  url: string,
  opts: RequestOptions = defaultOpts,
): Promise<T> {
  return fetchRequest(REQUEST_METHOD.POST, url, opts).then(toJson);
}

export function put<T>(
  url: string,
  opts: RequestOptions = defaultOpts,
): Promise<T> {
  return fetchRequest(REQUEST_METHOD.PUT, url, opts).then(toJson);
}

export function remove<T>(
  url: string,
  opts: RequestOptions = defaultOpts,
): Promise<T> {
  return fetchRequest(REQUEST_METHOD.DELETE, url, opts).then(toJson);
}
