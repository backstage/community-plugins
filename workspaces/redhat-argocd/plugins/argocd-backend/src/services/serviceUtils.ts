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
import { Instance } from '../types';
import { Config } from '@backstage/config';
import { AuthenticationError } from '@backstage/errors';

/**
 * Retrieves an instance by it's name from a list of instances
 *
 * @param {Object} params - The parameters
 * @param {Instance[]} params.instances - The list of instances
 * @param {string} params.instanceName - The name of the instance to retrieve.
 * @returns { Instance | undefined } The matched instance or undefined if not found.
 */
export const getInstanceByName = ({
  instances,
  instanceName,
}: {
  instances: Instance[];
  instanceName: string;
}): Instance | undefined => {
  const matchedConfig = instances.find(
    instance => instance.name === instanceName,
  );
  return matchedConfig;
};

/**
 * Converts a Backstage Config object to an Instance object
 *
 * @param {Config} el - The configuration object.
 * @returns {Instance} The converted instance.
 */
export const toInstance = (el: Config): Instance => {
  return {
    name: el.getString('name'),
    url: el.getString('url'),
    token: el.getOptionalString('token'),
    username: el.getOptionalString('username'),
    password: el.getOptionalString('password'),
  } as Instance;
};

/**
 * Processes the response from a fetch request and throws appropriate errors.
 *
 * @param {Response} response - The fetch response object.
 * @param {string} url - The request URL.
 * @returns {Promise<any>} The parsed JSON response
 * @throws {AuthenticationError | Error} If the response status indicates an error.
 */
export const processFetch = async (response: Response, url: string) => {
  if (response.status === 401) {
    throw new AuthenticationError(
      `Unauthorized: Invalid credentials for ArgoCD server ${url}`,
    );
  }

  if (response.status === 403) {
    throw new AuthenticationError(
      `Insufficient permissions for ArgoCD server ${url}`,
    );
  }

  if (response.status === 404) {
    throw new Error(`ArgoCD Resource not found at ${url}`);
  }

  if (!response.ok) {
    throw new Error(
      `Request to ${url} failed with ${response.status ?? 500} ${
        response.statusText
      }`,
    );
  }

  try {
    return response.json();
  } catch (error) {
    throw new Error(`Failed to parse response from ${url}: ${error.message}`);
  }
};

/**
 * Formats a message for an operation
 *
 * @param {string} operation - The operation for this message
 * @param {string} instanceName  - The instance associated with the operation.
 * @param {Record<string, string>} [options] - Additional options to include in the message.
 * @returns {string} The formatted message.
 */
export const formatOperationMessage = (
  operation: string,
  instanceName: string,
  options?: Record<string, string>,
) => {
  const optionStrings = options
    ? Object.entries(options)
        .map(([key, value]) => (value ? ` with ${key} '${value}'` : ''))
        .join('')
    : '';

  return `${operation} from Instance '${instanceName}'${optionStrings}`;
};

/**
 * Builds a URL for an ArgoCD Api request.
 *
 * @param {string} baseUrl  - The base URL of the ArgoCD server.
 * @param {string} path  - The API endpoint path.
 * @param {Record<string, string>} [params={}] - Query parameters to include in the URL.
 * @returns {string} The constructed URL string.
 */
export const buildArgoUrl = (
  baseUrl: string,
  path: string,
  params: Record<string, string> = {},
): string => {
  const url = new URL(`${baseUrl}/api/v1/${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

/**
 * Makes a request to the ArgoCD API with the given URL and token.
 *
 * @param {URL} url - The request URL.
 * @param {string} token - The authentication token.
 * @param {string} [method='GET'] The HTTP method to use.
 * @returns  {Promise<any>} The JSON response of the API.
 */
export const makeArgoRequest = async (
  url: string,
  token: string,
  method: string = 'GET',
) => {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  } as RequestInit);

  return processFetch(response, url);
};
