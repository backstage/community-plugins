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

import { techdocsEditorVcsProviderExtensionPoint } from './extensionPoint';
import type {
  VcsProvider,
  VcsProviderExtensionPoint,
  OpenPrOptions,
  OpenPrResult,
} from './types';

describe('techdocsEditorVcsProviderExtensionPoint', () => {
  it('has the correct extension point id', () => {
    expect(techdocsEditorVcsProviderExtensionPoint.id).toBe(
      'techdocs-editor.vcs-provider',
    );
  });
});

describe('VcsProvider interface contract', () => {
  // Verifies that a valid implementation satisfies the interface at runtime
  it('accepts a conforming implementation', () => {
    const mockProvider: VcsProvider = {
      id: 'mock',
      canHandle: (_url: string) => true,
      getDefaultBranch: async (_url: string) => 'main',
      readFile: async _opts => ({ content: '# Hello', etag: 'abc' }),
      listFiles: async _opts => ['index.md'],
      openPullRequest: async (_opts: OpenPrOptions): Promise<OpenPrResult> => ({
        url: 'https://example.com/pr/1',
        number: 1,
      }),
    };

    expect(mockProvider.id).toBe('mock');
    expect(mockProvider.canHandle('https://example.com/repo')).toBe(true);
  });
});

describe('VcsProviderExtensionPoint interface contract', () => {
  it('accepts a conforming implementation', () => {
    const providers: VcsProvider[] = [];

    const extensionPoint: VcsProviderExtensionPoint = {
      addProvider(provider: VcsProvider) {
        providers.push(provider);
      },
    };

    const mockProvider: VcsProvider = {
      id: 'test',
      canHandle: () => false,
      getDefaultBranch: async () => 'main',
      readFile: async () => ({ content: '', etag: '' }),
      listFiles: async () => [],
      openPullRequest: async (): Promise<OpenPrResult> => ({
        url: '',
        number: 0,
      }),
    };

    extensionPoint.addProvider(mockProvider);
    expect(providers).toHaveLength(1);
    expect(providers[0].id).toBe('test');
  });
});

describe('OpenPrOptions type', () => {
  it('allows required fields only', () => {
    const opts: OpenPrOptions = {
      repoUrl: 'https://github.com/org/repo',
      headBranch: 'patch-1',
      baseBranch: 'main',
      title: 'My PR',
      files: new Map([['docs/index.md', '# Content']]),
      commitMessage: 'docs: update',
      authorName: 'Test',
      authorEmail: 'test@example.com',
    };

    expect(opts.repoUrl).toBe('https://github.com/org/repo');
    expect(opts.draft).toBeUndefined();
    expect(opts.reviewers).toBeUndefined();
  });

  it('allows all optional fields', () => {
    const opts: OpenPrOptions = {
      repoUrl: 'https://github.com/org/repo',
      headBranch: 'patch-1',
      baseBranch: 'main',
      title: 'My PR',
      description: 'Details here',
      files: new Map([['docs/index.md', null]]),
      commitMessage: 'docs: update',
      authorName: 'Test',
      authorEmail: 'test@example.com',
      draft: true,
      reviewers: ['alice', 'bob'],
    };

    expect(opts.draft).toBe(true);
    expect(opts.reviewers).toEqual(['alice', 'bob']);
    expect(opts.files.get('docs/index.md')).toBeNull();
  });
});
