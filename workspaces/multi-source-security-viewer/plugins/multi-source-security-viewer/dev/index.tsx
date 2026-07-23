/*
 * Copyright 2024 The Backstage Authors
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

import ReactDOM from 'react-dom/client';

// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

import { createApp } from '@backstage/frontend-defaults';
import {
  ApiBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';

import mssvPlugin from '../src/plugin';
import { mockEntity } from '../src/__fixtures__/entity';
import { mssvJenkinsApiRef } from '../src/api/jenkins';
import { mssvGithubActionsApiRef } from '../src/api/github';
import { mssvGitlabCIApiRef } from '../src/api/gitlab';
import { mssvAzureDevopsApiRef } from '../src/api/azure';
import { MssvApi, MssvApiResponse } from '../src/api/mssv';
import { PipelineRunResult } from '../src/models/pipelineRunResult';
import { mockPipelineRuns } from '../src/__fixtures__/pipelineruns';
import { mockRawLogs } from '../src/__fixtures__/rawlogs';

class MockMssvJenkinsApiClient implements MssvApi {
  async getPipelineSummary(): Promise<MssvApiResponse> {
    const results = mockPipelineRuns.map(
      pr =>
        new PipelineRunResult({
          ...pr,
          displayName: `${pr.displayName}-jenkins`,
          logs: mockRawLogs,
        }),
    );
    return { results, totalCount: results.length };
  }

  async getPipelineDetail(): Promise<MssvApiResponse> {
    return this.getPipelineSummary();
  }
}

class MockMssvGithubActionsApiClient implements MssvApi {
  async getPipelineSummary(): Promise<MssvApiResponse> {
    const results = mockPipelineRuns.map(
      pr =>
        new PipelineRunResult({
          ...pr,
          displayName: `${pr.displayName}-github`,
          logs: mockRawLogs,
        }),
    );
    return { results, totalCount: results.length };
  }

  async getPipelineDetail(): Promise<MssvApiResponse> {
    return this.getPipelineSummary();
  }
}

class MockMssvGitlabCIApiClient implements MssvApi {
  async getPipelineSummary(): Promise<MssvApiResponse> {
    const results = mockPipelineRuns.map(
      pr =>
        new PipelineRunResult({
          ...pr,
          displayName: `${pr.displayName}-gitlab`,
          logs: mockRawLogs,
        }),
    );
    return { results, totalCount: results.length };
  }

  async getPipelineDetail(): Promise<MssvApiResponse> {
    return this.getPipelineSummary();
  }
}

class MockMssvAzureDevopsClient implements MssvApi {
  async getPipelineSummary(): Promise<MssvApiResponse> {
    const results = mockPipelineRuns.map(
      pr =>
        new PipelineRunResult({
          ...pr,
          displayName: `${pr.displayName}-azure`,
          logs: mockRawLogs,
        }),
    );
    return { results, totalCount: results.length };
  }

  async getPipelineDetail(): Promise<MssvApiResponse> {
    return this.getPipelineSummary();
  }
}

const mssvDevModule = createFrontendModule({
  pluginId: 'multi-source-security-viewer',
  extensions: [
    ApiBlueprint.make({
      name: 'mssv-jenkins-mock',
      params: defineParams =>
        defineParams({
          api: mssvJenkinsApiRef,
          deps: {},
          factory: () => new MockMssvJenkinsApiClient(),
        }),
    }),
    ApiBlueprint.make({
      name: 'mssv-github-actions-mock',
      params: defineParams =>
        defineParams({
          api: mssvGithubActionsApiRef,
          deps: {},
          factory: () => new MockMssvGithubActionsApiClient(),
        }),
    }),
    ApiBlueprint.make({
      name: 'mssv-gitlab-ci-mock',
      params: defineParams =>
        defineParams({
          api: mssvGitlabCIApiRef,
          deps: {},
          factory: () => new MockMssvGitlabCIApiClient(),
        }),
    }),
    ApiBlueprint.make({
      name: 'mssv-azure-devops-mock',
      params: defineParams =>
        defineParams({
          api: mssvAzureDevopsApiRef,
          deps: {},
          factory: () => new MockMssvAzureDevopsClient(),
        }),
    }),
  ],
});

const catalogDevModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    ApiBlueprint.make({
      name: 'catalog-mock',
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () =>
            catalogApiMock({
              entities: [mockEntity],
            }),
        }),
    }),
  ],
});

const app = createApp({
  features: [
    catalogPlugin,
    userSettingsPlugin,
    mssvPlugin,
    mssvDevModule,
    catalogDevModule,
  ],
});

ReactDOM.createRoot(document.getElementById('root')!).render(app.createRoot());
