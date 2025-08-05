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
import { createDevApp } from '@backstage/dev-utils';
import {
  EntityMultiCIPipelinesContent,
  multiSourceSecurityViewerPlugin,
} from '../src/plugin';
import { Header, Page, TabbedLayout } from '@backstage/core-components';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { MockPermissionApi, TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { mockEntity } from '../src/__fixtures__/entity';
import { mssvJenkinsApiRef } from '../src/api/jenkins';
import { mockPipelineRuns } from '../src/__fixtures__/pipelineruns';
import { mockRawLogs } from '../src/__fixtures__/rawlogs';
import { MssvApi, MssvApiResponse } from '../src/api/mssv';
import { PipelineRunResult } from '../src/models/pipelineRunResult';
import { mssvGithubActionsApiRef } from '../src/api/github';
import { mssvGitlabCIApiRef } from '../src/api/gitlab';
import { mssvAzureDevopsApiRef } from '../src/api/azure';

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

createDevApp()
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [mssvJenkinsApiRef, new MockMssvJenkinsApiClient()],
          [mssvGithubActionsApiRef, new MockMssvGithubActionsApiClient()],
          [mssvGitlabCIApiRef, new MockMssvGitlabCIApiClient()],
          [mssvAzureDevopsApiRef, new MockMssvAzureDevopsClient()],
          [permissionApiRef, new MockPermissionApi()],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <Page themeId="service">
            <Header type="component — service" title="demo-sevice" />
            <TabbedLayout>
              <TabbedLayout.Route path="/" title="CI/CD">
                <EntityMultiCIPipelinesContent />
              </TabbedLayout.Route>
            </TabbedLayout>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Multi Source Security Viewer',
    path: '/mssv',
  })
  .registerPlugin(multiSourceSecurityViewerPlugin)
  .render();
