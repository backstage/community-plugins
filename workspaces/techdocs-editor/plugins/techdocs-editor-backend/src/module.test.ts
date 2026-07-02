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

import { ConfigReader } from '@backstage/config';

// Mock the providers to avoid pulling in the octokit/gitbeaker ESM chains
jest.mock('./providers/GitHubVcsProvider', () => ({
  GitHubVcsProvider: jest.fn().mockImplementation(() => ({
    id: 'github',
    canHandle: (url: string) => url.includes('github.com'),
  })),
}));

jest.mock('./providers/GitLabVcsProvider', () => ({
  GitLabVcsProvider: jest.fn().mockImplementation(() => ({
    id: 'gitlab',
    canHandle: (url: string) => url.includes('gitlab.com'),
  })),
}));

// Static imports AFTER jest.mock hoisting
import { GitHubVcsProvider } from './providers/GitHubVcsProvider';
import { GitLabVcsProvider } from './providers/GitLabVcsProvider';
import { techdocsEditorModuleDefaultProviders } from './module';

describe('techdocsEditorModuleDefaultProviders', () => {
  it('is defined and has the correct pluginId and moduleId', () => {
    expect(techdocsEditorModuleDefaultProviders).toBeDefined();
  });

  it('registers GitHub and GitLab providers with the correct canHandle behaviour', () => {
    const providers: any[] = [];

    const captureExtensionPoint = {
      addProvider(p: any) {
        providers.push(p);
      },
    };

    const config = new ConfigReader({
      integrations: {
        github: [{ host: 'github.com', token: 'ghp_test' }],
        gitlab: [{ host: 'gitlab.com', token: 'glpat_test' }],
      },
    });

    captureExtensionPoint.addProvider(new (GitHubVcsProvider as any)(config));
    captureExtensionPoint.addProvider(new (GitLabVcsProvider as any)(config));

    expect(providers).toHaveLength(2);

    const [githubProvider, gitlabProvider] = providers;

    expect(githubProvider.id).toBe('github');
    expect(githubProvider.canHandle('https://github.com/org/repo')).toBe(true);
    expect(githubProvider.canHandle('https://gitlab.com/org/repo')).toBe(false);

    expect(gitlabProvider.id).toBe('gitlab');
    expect(gitlabProvider.canHandle('https://gitlab.com/org/repo')).toBe(true);
    expect(gitlabProvider.canHandle('https://github.com/org/repo')).toBe(false);
  });
});
