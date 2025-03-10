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
import { mockRawLogs } from '../__fixtures__/rawlogs';
import { cleanLogs, extractJSON, extractPipelineSteps } from './logs';

describe('cleanLogs', () => {
  it('should replace escaped quotes', () => {
    const value = `test \"value\"`;
    expect(cleanLogs(value)).toEqual('test "value"');
  });

  it('should replace escaped carriage returns', () => {
    const value = `test \\n value`;
    expect(cleanLogs(value)).toEqual('test \n value');
  });

  it('should remove escaped double backslash', () => {
    const value = `test \\\\value`;
    expect(cleanLogs(value)).toEqual('test value');
  });
});

describe('extractJSON', () => {
  it('should should extract the json between eyecatchers', () => {
    const value = `ANCHOR_START {\"value\": \"test\"} ANCHOR_END`;
    const extracted = extractJSON(value, 'ANCHOR_START', 'ANCHOR_END');
    expect(extracted).toEqual({ value: 'test' });
  });
});

describe('extractPipelineSteps', () => {
  it('should extract pipeline steps', () => {
    const steps = extractPipelineSteps(mockRawLogs);
    expect(steps.length).toBe(9);
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

    expectedSteps.map(step => {
      const expected = steps.find(v => v.name === step);
      expect(expected?.name).toEqual(step);
      // Handle name difference for step
      const testStep = step === 'update-deployment' ? ' patch-gitops' : step;
      expect(expected?.logs.includes(`Running ${testStep}`)).toBeTruthy();
    });
  });
});
