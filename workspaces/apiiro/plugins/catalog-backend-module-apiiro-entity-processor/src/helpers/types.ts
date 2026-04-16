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
export interface RepositoryItem {
  name?: string | null;
  key?: string | null;
  url?: string | null;
  isDefaultBranch?: boolean;
  branchName?: string | null;
  [key: string]: unknown;
}

export interface ApiiroRepositoriesResponse {
  items: RepositoryItem[];
  next?: string | null;
}

export interface ExternalSource {
  id: string;
  server: {
    id: string;
    provider: string;
    tokenExpirationDate: string | null;
    url: string;
  };
}

export interface ApplicationItem {
  name?: string | null;
  key?: string | null;
  externalSources?: ExternalSource[];
  [key: string]: unknown;
}

export interface ApiiroApplicationsResponse {
  items: ApplicationItem[];
  next?: string | null;
}

export interface CachedRepositoryData {
  urlToKeyMap: Record<string, string>;
  lastFetched: number;
  fetchCompleted: boolean;
  [key: string]: any;
}

export interface CachedApplicationData {
  uidToKeyMap: Record<string, string>;
  lastFetched: number;
  fetchCompleted: boolean;
  [key: string]: any;
}

export interface CachedEntityRefData {
  refToUidMap: Record<string, string>;
  lastFetched: number;
  fetchCompleted: boolean;
  [key: string]: any;
}

export const BACKSTAGE_SOURCE_LOCATION_ANNOTATION =
  'backstage.io/source-location';

export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
export const REFRESH_LOCK_TTL_MS = 2 * 60 * 1000; // 2 minutes
export const PAGE_LIMIT = 1000;
export const MAX_PAGES = 1000;
export const AZURE_HOST_NAME = 'dev.azure.com';
