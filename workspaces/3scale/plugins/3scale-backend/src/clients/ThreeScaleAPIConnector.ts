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
import type { APIDocs, Proxy, Services } from './types';

/**
 * @public
 */
export function listServices(
  baseUrl: string,
  access_token: string,
  page: number,
  size: number,
): Promise<Services> {
  return fetch(
    `${baseUrl}/admin/api/services.json?access_token=${access_token}&page=${page}&size=${size}`,
  ).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json() as Promise<Services>;
  });
}

/**
 * @public
 */
export function listApiDocs(
  baseUrl: string,
  access_token: string,
): Promise<APIDocs> {
  return fetch(
    `${baseUrl}/admin/api/active_docs.json?access_token=${access_token}`,
  ).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json() as Promise<APIDocs>;
  });
}

/**
 * @public
 */
export function getProxyConfig(
  baseUrl: string,
  access_token: string,
  service_id: number,
): Promise<Proxy> {
  return fetch(
    `${baseUrl}/admin/api/services/${service_id}/proxy.json?access_token=${access_token}`,
  ).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json() as Promise<Proxy>;
  });
}
