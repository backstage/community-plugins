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
import fetch from 'node-fetch';
import { APIIRO_DEFAULT_BASE_URL } from '@backstage-community/plugin-apiiro-common';
import {
  ApiiroRepositoriesResponse,
  ApiiroApplicationsResponse,
  RepositoryItem,
  ApplicationItem,
  PAGE_LIMIT,
  MAX_PAGES,
} from './types';

export class ApiiroApiClient {
  constructor(private readonly accessToken: string | undefined) {}

  private async fetchRepositoriesPage(
    pageCursor?: string,
  ): Promise<ApiiroRepositoriesResponse> {
    const baseUrl = APIIRO_DEFAULT_BASE_URL;

    const params = new URLSearchParams();
    params.append('pageSize', PAGE_LIMIT.toString());
    if (pageCursor) {
      params.append('next', pageCursor);
    }

    const url = `${baseUrl}/rest-api/v2/repositories?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorMessage = `Failed to fetch repositories from Apiiro API. Status: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as ApiiroRepositoriesResponse;
    return {
      items: data.items || [],
      next: data.next || null,
    };
  }

  async fetchAllRepositories(): Promise<{
    items: RepositoryItem[];
    totalCount: number;
  }> {
    const items: RepositoryItem[] = [];
    let nextCursor: string | null | undefined = undefined;
    let pageCount = 0;

    do {
      pageCount++;

      if (pageCount > MAX_PAGES) {
        throw new Error(
          `Pagination limit exceeded: Maximum of ${MAX_PAGES} pages allowed. ` +
            `This may indicate an infinite loop or an unexpectedly large dataset. ` +
            `Fetched ${items.length} repositories so far.`,
        );
      }

      if (!this.accessToken) {
        console.warn(
          '[ApiiroApiClient] Apiiro access token not configured. Please set apiiro.accessToken in your app-config.',
        );
        return {
          items: [],
          totalCount: 0,
        };
      }

      const page = await this.fetchRepositoriesPage(nextCursor ?? undefined);
      items.push(...page.items);
      nextCursor = page.next;
    } while (nextCursor);

    return { items, totalCount: items.length };
  }

  private async fetchApplicationsPage(
    pageCursor?: string,
  ): Promise<ApiiroApplicationsResponse> {
    const baseUrl = APIIRO_DEFAULT_BASE_URL;

    const params = new URLSearchParams();
    params.append('pageSize', PAGE_LIMIT.toString());
    if (pageCursor) {
      params.append('next', pageCursor);
    }

    const url = `${baseUrl}/rest-api/v1/applications/profiles?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorMessage = `Failed to fetch applications from Apiiro API. Status: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as ApiiroApplicationsResponse;
    return {
      items: data.items || [],
      next: data.next || null,
    };
  }

  async fetchAllApplications(): Promise<{
    items: ApplicationItem[];
    totalCount: number;
  }> {
    const items: ApplicationItem[] = [];
    let nextCursor: string | null | undefined = undefined;
    let pageCount = 0;

    do {
      pageCount++;

      if (pageCount > MAX_PAGES) {
        throw new Error(
          `Pagination limit exceeded: Maximum of ${MAX_PAGES} pages allowed. ` +
            `This may indicate an infinite loop or an unexpectedly large dataset. ` +
            `Fetched ${items.length} applications so far.`,
        );
      }

      if (!this.accessToken) {
        console.warn(
          '[ApiiroApiClient] Apiiro access token not configured. Please set apiiro.accessToken in your app-config.',
        );
        return {
          items: [],
          totalCount: 0,
        };
      }
      const page = await this.fetchApplicationsPage(nextCursor ?? undefined);
      items.push(...page.items);
      nextCursor = page.next;
    } while (nextCursor);
    return { items, totalCount: items.length };
  }
}
