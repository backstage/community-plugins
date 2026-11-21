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
import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import type {
  MdxCardTemplate,
  MdxCardTemplateInput,
  MdxCardTemplateSummary,
} from '@backstage-community/plugin-mdx-card-common';

/**
 * Client for the MDX card backend.
 *
 * @public
 */
export interface MdxCardApi {
  listTemplates(): Promise<MdxCardTemplateSummary[]>;
  getTemplate(id: string): Promise<MdxCardTemplate>;
  createTemplate(
    id: string,
    input: MdxCardTemplateInput,
  ): Promise<MdxCardTemplate>;
  updateTemplate(
    id: string,
    input: MdxCardTemplateInput,
  ): Promise<MdxCardTemplate>;
  deleteTemplate(id: string): Promise<void>;
}

/**
 * API reference for {@link MdxCardApi}.
 *
 * @public
 */
export const mdxCardApiRef = createApiRef<MdxCardApi>({
  id: 'plugin.mdx-card.api',
});

/**
 * Default {@link MdxCardApi} implementation.
 *
 * @public
 */
export class MdxCardClient implements MdxCardApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async listTemplates(): Promise<MdxCardTemplateSummary[]> {
    const response = await this.request('/templates');
    const body: { items: MdxCardTemplateSummary[] } = await response.json();
    return body.items;
  }

  async getTemplate(id: string): Promise<MdxCardTemplate> {
    const response = await this.request(`/templates/${encodeURIComponent(id)}`);
    return response.json();
  }

  async createTemplate(
    id: string,
    input: MdxCardTemplateInput,
  ): Promise<MdxCardTemplate> {
    const response = await this.request('/templates', {
      method: 'POST',
      body: JSON.stringify({ id, ...input }),
    });
    return response.json();
  }

  async updateTemplate(
    id: string,
    input: MdxCardTemplateInput,
  ): Promise<MdxCardTemplate> {
    const response = await this.request(
      `/templates/${encodeURIComponent(id)}`,
      { method: 'PUT', body: JSON.stringify(input) },
    );
    return response.json();
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.request(`/templates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  private async request(path: string, init?: RequestInit) {
    const baseUrl = await this.discoveryApi.getBaseUrl('mdx-card');
    const response = await this.fetchApi.fetch(`${baseUrl}${path}`, {
      ...init,
      headers: init?.body ? { 'Content-Type': 'application/json' } : {},
    });
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response;
  }
}
