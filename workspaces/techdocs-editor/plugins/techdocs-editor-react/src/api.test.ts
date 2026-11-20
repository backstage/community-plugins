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
  TechDocsEditorClient,
  TechDocsEditorApiRef,
  useTechDocsEditorApi,
} from './api';

const mockFetch = jest.fn();
const mockGetBaseUrl = jest
  .fn()
  .mockResolvedValue('http://localhost:7007/api/techdocs-editor');

const mockDiscoveryApi = { getBaseUrl: mockGetBaseUrl };
const mockFetchApi = { fetch: mockFetch };

const entityRef = {
  namespace: 'default',
  kind: 'Component',
  name: 'my-service',
};

describe('TechDocsEditorApiRef', () => {
  it('has the correct id', () => {
    expect(TechDocsEditorApiRef.id).toBe('plugin.techdocs-editor.api');
  });
});

describe('TechDocsEditorClient', () => {
  let client: TechDocsEditorClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new TechDocsEditorClient(
      mockDiscoveryApi as any,
      mockFetchApi as any,
    );
  });

  describe('getMkDocsConfig', () => {
    it('fetches mkdocs endpoint and returns parsed JSON', async () => {
      const payload = { site_name: 'My Docs', docs_dir: 'docs' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => payload,
      });

      const result = await client.getMkDocsConfig(entityRef);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/techdocs-editor/sources/default/component/my-service/mkdocs',
      );
      expect(result).toEqual(payload);
    });

    it('throws when response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      });

      await expect(client.getMkDocsConfig(entityRef)).rejects.toThrow(
        'Failed to load mkdocs config: 404 Not Found',
      );
    });
  });

  describe('getFileTree', () => {
    it('fetches tree endpoint and normalises into DocTree shape', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          files: ['index.md', 'guide/setup.md'],
          branch: 'main',
        }),
      });

      const result = await client.getFileTree(entityRef);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/techdocs-editor/sources/default/component/my-service/tree',
      );
      expect(result.branch).toBe('main');
      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].path).toBe('index.md');
    });

    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => 'Forbidden',
      });

      await expect(client.getFileTree(entityRef)).rejects.toThrow(
        'Failed to load file tree: 403 Forbidden',
      );
    });
  });

  describe('getFile', () => {
    it('fetches file with path param', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ content: '# Title', etag: 'abc', branch: 'main' }),
      });

      const result = await client.getFile(entityRef, 'docs/index.md');

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('/sources/default/component/my-service/file');
      expect(calledUrl).toContain('path=docs%2Findex.md');
      expect(result.content).toBe('# Title');
      expect(result.etag).toBe('abc');
    });

    it('appends branch param when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: '# Title',
          etag: 'x',
          branch: 'feature',
        }),
      });

      await client.getFile(entityRef, 'docs/index.md', 'feature');

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('branch=feature');
    });

    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      });

      await expect(client.getFile(entityRef, '../etc/passwd')).rejects.toThrow(
        'Failed to load file: 400 Bad Request',
      );
    });
  });

  describe('submitEdits', () => {
    const request = {
      prTitle: 'Fix typo',
      baseBranch: 'main',
      files: [{ path: 'docs/index.md', content: '# Fixed', etag: 'abc' }],
    };

    it('POSTs to submissions endpoint and returns response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          pullRequestUrl: 'https://github.com/org/repo/pull/1',
          pullRequestNumber: 1,
          headBranch: 'techdocs-editor-fix-typo',
        }),
      });

      const result = await client.submitEdits(entityRef, request as any);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/techdocs-editor/submissions/default/component/my-service',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        }),
      );
      expect(result.pullRequestUrl).toBe('https://github.com/org/repo/pull/1');
    });

    it('throws a conflict error with conflicts array on 409', async () => {
      const conflicts = [{ path: 'docs/index.md', serverEtag: 'def' }];
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ conflicts }),
      });

      const err: any = await client
        .submitEdits(entityRef, request as any)
        .catch(e => e);

      expect(err.status).toBe(409);
      expect(err.conflicts).toEqual(conflicts);
    });

    it('throws generic error on non-ok non-409 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(
        client.submitEdits(entityRef, request as any),
      ).rejects.toThrow('Failed to submit edits: 500 Internal Server Error');
    });
  });

  describe('entity path normalisation', () => {
    it('lowercases kind', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
      await client
        .getMkDocsConfig({
          namespace: 'default',
          kind: 'Component',
          name: 'svc',
        })
        .catch(() => {});
      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('/sources/default/component/svc/');
    });

    it('uses default namespace when not provided', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
      await client
        .getMkDocsConfig({
          namespace: undefined as any,
          kind: 'API',
          name: 'my-api',
        })
        .catch(() => {});
      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('/sources/default/api/my-api/');
    });
  });
});

describe('useTechDocsEditorApi', () => {
  it('is a function (hook)', () => {
    expect(typeof useTechDocsEditorApi).toBe('function');
  });
});
