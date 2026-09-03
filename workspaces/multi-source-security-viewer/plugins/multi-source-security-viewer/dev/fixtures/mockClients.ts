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
import { MssvApi, MssvApiResponse } from '../../src/api/mssv';
import { PipelineRunResult } from '../../src/models/pipelineRunResult';
import { mockPipelineRuns } from '../../src/__fixtures__/pipelineruns';
import { mockRawLogs } from '../../src/__fixtures__/rawlogs';

class MockMssvApiClient implements MssvApi {
  constructor(private readonly source: string) {}

  async getPipelineSummary(): Promise<MssvApiResponse> {
    const results = mockPipelineRuns.map(
      pr =>
        new PipelineRunResult({
          ...pr,
          displayName: `${pr.displayName}-${this.source}`,
          logs: mockRawLogs,
        }),
    );
    return { results, totalCount: results.length };
  }

  async getPipelineDetail(): Promise<MssvApiResponse> {
    return this.getPipelineSummary();
  }
}

export class MockMssvJenkinsApiClient extends MockMssvApiClient {
  constructor() {
    super('jenkins');
  }
}

export class MockMssvGithubActionsApiClient extends MockMssvApiClient {
  constructor() {
    super('github');
  }
}

export class MockMssvGitlabCIApiClient extends MockMssvApiClient {
  constructor() {
    super('gitlab');
  }
}

export class MockMssvAzureDevopsClient extends MockMssvApiClient {
  constructor() {
    super('azure');
  }
}
