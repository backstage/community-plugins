/*
 * Copyright 2026 The Backstage Authors
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
import { OpenAPI } from '../../../../../generated/now/table';

export const LOCAL_ADDR = 'https://example.service-now.com' as const;

export const SERVICENOW_CONFIG = {
  baseUrl: LOCAL_ADDR,
  username: 'test-user',
  password: 'test-password',
} as const;

/** Body shaped like a ServiceNow error without `error.message`. */
export const ERROR_BODY_WITHOUT_MESSAGE = {
  error: {},
  status: 'failure',
} as const;

export function basicAuthHeader(
  username: string = SERVICENOW_CONFIG.username,
  password: string = SERVICENOW_CONFIG.password,
): string {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

const openApiDefaults = {
  BASE: OpenAPI.BASE,
  USERNAME: OpenAPI.USERNAME,
  PASSWORD: OpenAPI.PASSWORD,
};

/** Restore the generated OpenAPI singleton after tests mutate it. */
export function resetOpenAPIConfig(): void {
  OpenAPI.BASE = openApiDefaults.BASE;
  OpenAPI.USERNAME = openApiDefaults.USERNAME;
  OpenAPI.PASSWORD = openApiDefaults.PASSWORD;
}
