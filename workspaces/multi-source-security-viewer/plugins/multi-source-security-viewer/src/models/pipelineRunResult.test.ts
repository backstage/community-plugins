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
import { PipelineRunResult } from './pipelineRunResult';
import { PipelineRun, RunStatus } from '../types/pipelinerun';
import { mockRawLogs } from '../__fixtures__/rawlogs';
import { extractPipelineSteps } from '../utils/logs';

describe('PipelineRunResult', () => {
  const data: PipelineRun = {
    id: 'pipelinerun-2',
    displayName: 'pipelinerun-2',
    status: RunStatus.Succeeded,
    logs: mockRawLogs,
    steps: extractPipelineSteps(mockRawLogs),
  };
  let pr: PipelineRunResult;

  beforeEach(() => {
    pr = new PipelineRunResult(data);
  });

  it('should get the id', () => {
    expect(pr.id).toEqual('pipelinerun-2');
  });

  it('should get the type', () => {
    expect(pr.type).toEqual('Build');
    pr = new PipelineRunResult({
      ...data,
      logs: `TPA_SBOM_URL_EYECATCHER_BEGIN\n{"TPA_SBOM_URL": "http://some-linkl"}\nTPA_SBOM_URL_EYECATCHER_END`,
    });
    expect(pr.type).toEqual('Promote');
  });

  it('should get the status', () => {
    expect(pr.status).toEqual('Succeeded');
    pr = new PipelineRunResult({});
    expect(pr.status).toEqual('Unknown');
  });

  it('should get count of vulnerablities', () => {
    expect(pr.critical).toEqual(0);
    expect(pr.important).toEqual(14);
    expect(pr.moderate).toEqual(92);
    expect(pr.low).toEqual(166);
    pr = new PipelineRunResult({});
    expect(pr.critical).toEqual('N/A');
    expect(pr.important).toEqual('N/A');
    expect(pr.moderate).toEqual('N/A');
    expect(pr.low).toEqual('N/A');
  });

  it('should get the logs', () => {
    expect(pr.logs.startsWith('Started by')).toBeTruthy();
    pr = new PipelineRunResult({});
    expect(pr.logs).toEqual('');
  });

  it('should get the pipeline steps', () => {
    expect(pr.steps.length).toEqual(9);
    const expectedSteps = [
      'init',
      'buildah-rhtap',
      'cosign-sign-attest',
      'acs-deploy-check',
      'acs-image-check',
      'acs-image-scan',
      'update-deployment',
      'show-sbom-rhdh',
      'summary',
    ];
    expect(pr.steps.map(v => v.name)).toEqual(expectedSteps);
    expect(pr.hasSteps).toBeTruthy();
    expect(new PipelineRunResult({}).hasSteps).toBeFalsy();
  });
});
