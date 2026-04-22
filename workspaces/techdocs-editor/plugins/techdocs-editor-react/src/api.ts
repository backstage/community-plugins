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

import {
  createApiRef,
  useApi,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';
import { CompoundEntityRef } from '@backstage/catalog-model';
import {
  DocTree,
  MkDocsConfig,
  SubmitEditsRequest,
  SubmitEditsResponse,
} from '@backstage-community/plugin-techdocs-editor-common';

/**
 * API for the TechDocs editor — fetches source files and submits edits as PRs.
 * @public
 */
export interface TechDocsEditorApi {
  getMkDocsConfig(entityRef: CompoundEntityRef): Promise<MkDocsConfig>;
  getFileTree(
    entityRef: CompoundEntityRef,
  ): Promise<DocTree & { branch: string }>;
  getFile(
    entityRef: CompoundEntityRef,
    path: string,
    branch?: string,
  ): Promise<{ content: string; etag: string; branch: string }>;
  submitEdits(
    entityRef: CompoundEntityRef,
    request: SubmitEditsRequest,
  ): Promise<SubmitEditsResponse>;
}

/** @public */
export const TechDocsEditorApiRef = createApiRef<TechDocsEditorApi>({
  id: 'plugin.techdocs-editor.api',
});

/** @public */
export function useTechDocsEditorApi(): TechDocsEditorApi {
  return useApi(TechDocsEditorApiRef);
}

/**
 * Default implementation of TechDocsEditorApi that talks to the backend plugin.
 * @public
 */
export class TechDocsEditorClient implements TechDocsEditorApi {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  private entityPath(ref: CompoundEntityRef): string {
    const ns = ref.namespace ?? 'default';
    return `${ns}/${ref.kind}/${ref.name}`.toLocaleLowerCase('en-US');
  }

  private async baseUrl(): Promise<string> {
    return this.discoveryApi.getBaseUrl('techdocs-editor');
  }

  async getMkDocsConfig(entityRef: CompoundEntityRef): Promise<MkDocsConfig> {
    const base = await this.baseUrl();
    const res = await this.fetchApi.fetch(
      `${base}/sources/${this.entityPath(entityRef)}/mkdocs`,
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to load mkdocs config: ${res.status} ${text}`);
    }
    return res.json();
  }

  async getFileTree(
    entityRef: CompoundEntityRef,
  ): Promise<DocTree & { branch: string }> {
    const base = await this.baseUrl();
    const res = await this.fetchApi.fetch(
      `${base}/sources/${this.entityPath(entityRef)}/tree`,
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to load file tree: ${res.status} ${text}`);
    }
    const data = await res.json();
    // Normalise into DocTree shape
    const nodes = (data.files as string[]).map((f: string) => ({
      title: f,
      path: f,
    }));
    return { nodes, sourceEtag: '', branch: data.branch };
  }

  async getFile(
    entityRef: CompoundEntityRef,
    path: string,
    branch?: string,
  ): Promise<{ content: string; etag: string; branch: string }> {
    const base = await this.baseUrl();
    const params = new URLSearchParams({ path });
    if (branch) params.set('branch', branch);
    const res = await this.fetchApi.fetch(
      `${base}/sources/${this.entityPath(entityRef)}/file?${params}`,
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to load file: ${res.status} ${text}`);
    }
    return res.json();
  }

  async submitEdits(
    entityRef: CompoundEntityRef,
    request: SubmitEditsRequest,
  ): Promise<SubmitEditsResponse> {
    const base = await this.baseUrl();
    const res = await this.fetchApi.fetch(
      `${base}/submissions/${this.entityPath(entityRef)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      },
    );
    if (res.status === 409) {
      const data = await res.json();
      const err = new Error(`Edit conflict detected`) as any;
      err.conflicts = data.conflicts;
      err.status = 409;
      throw err;
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to submit edits: ${res.status} ${text}`);
    }
    return res.json();
  }
}
