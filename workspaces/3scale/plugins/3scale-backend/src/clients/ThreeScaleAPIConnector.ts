import { APIDocs, Proxy, Services } from './types';

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
