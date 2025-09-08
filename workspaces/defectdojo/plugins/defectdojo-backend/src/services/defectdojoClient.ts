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
import { RootConfigService } from '@backstage/backend-plugin-api';
import { URL } from 'url';
import { Finding, DefectDojoProduct, DefectDojoEngagement } from './types';

type Page<T> = { next: string | null; results: T[] };

export class DefectDojoClient {
  private readonly baseApi: string;
  private readonly baseUrl: string;
  private readonly token: string;

  private readonly REQUEST_TIMEOUT_MS: number;
  private readonly MAX_PAGES: number;

  constructor(cfg: RootConfigService) {
    this.baseUrl = cfg.getString('defectdojo.baseUrl'); // e.g. https://defectdojo.company.com
    this.baseApi = new URL('/api/v2/', this.baseUrl).toString();
    this.token = cfg.getString('defectdojo.token');

    this.REQUEST_TIMEOUT_MS =
      cfg.getOptionalNumber('defectdojo.requestTimeoutMs') ?? 20000;
    this.MAX_PAGES = cfg.getOptionalNumber('defectdojo.maxPages') ?? 100;
  }

  private async ddFetch<T>(pathOrUrl: string | URL): Promise<T> {
    const url =
      typeof pathOrUrl === 'string'
        ? new URL(pathOrUrl, this.baseApi).toString()
        : pathOrUrl.toString();

    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), this.REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Token ${this.token}`,
          Accept: 'application/json',
        },
        signal: ac.signal,
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`DefectDojo ${res.status}: ${body}`);
      }
      return (await res.json()) as T;
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        throw new Error(
          `DefectDojo timeout after ${this.REQUEST_TIMEOUT_MS}ms: ${url}`,
        );
      }
      throw e;
    } finally {
      clearTimeout(to);
    }
  }

  async getProduct(identifier: string | number): Promise<DefectDojoProduct> {
    if (typeof identifier === 'number') {
      return this.ddFetch(`products/${identifier}/`);
    }
    const params = new URLSearchParams({
      name: identifier,
      limit: '1',
    });
    const response = await this.ddFetch<any>(`products/?${params.toString()}`);
    if (!response.results?.length) {
      throw new Error(`No product found with name: ${identifier}`);
    }
    return response.results[0];
  }

  async getEngagements(productId: number): Promise<DefectDojoEngagement[]> {
    const params = new URLSearchParams({
      product: String(productId),
      limit: '200',
    });
    const response = await this.ddFetch<any>(
      `engagements/?${params.toString()}`,
    );
    return response.results || [];
  }

  async listFindingsByProduct(
    productId: number,
    engagementId?: number,
  ): Promise<Finding[]> {
    const params = new URLSearchParams({
      active: 'true',
      limit: '200',
    });

    if (engagementId) {
      // Filter by specific engagement
      params.set('test__engagement', String(engagementId));
    } else {
      // Filter by product
      params.set('test__engagement__product', String(productId));
    }

    let next: string | null = `findings/?${params.toString()}`;
    const seen = new Set<string>();
    const all: Finding[] = [];
    let pages = 0;

    while (next && pages < this.MAX_PAGES) {
      if (seen.has(next)) {
        // Avoid loops if the server returns the same "next" repeatedly
        throw new Error(`Pagination loop detected: ${next}`);
      }
      seen.add(next);
      pages++;

      const page: any = await this.ddFetch<Page<Finding>>(next);
      all.push(
        ...page.results.map((f: Finding) => ({
          ...f,
          url: new URL(`finding/${f.id}`, this.baseUrl).toString(),
        })),
      );
      next = page.next;
    }

    if (pages === this.MAX_PAGES) {
      throw new Error(
        `Reached MAX_PAGES=${this.MAX_PAGES} without completing pagination. There may be more findings.`,
      );
    }

    return all;
  }
}
