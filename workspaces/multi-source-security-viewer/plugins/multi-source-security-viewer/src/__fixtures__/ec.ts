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
import {
  ENTERPRISE_CONTRACT_POLICY_STATUS,
  EnterpriseContractPolicy,
} from '@aonic-ui/pipelines';

export const mockECResults: EnterpriseContractPolicy[] = [
  {
    title: 'Missing CVE scan results',
    description:
      'The clair-scan task results have not been found in the SLSA Provenance attestation of the build pipeline.',
    status: ENTERPRISE_CONTRACT_POLICY_STATUS.successes,
    timestamp: '2022-01-01T00:00:00Z',
    component: 'devfile-sample-python-basic-aw05',
    msg: 'CVE scan results not found',
    solution: 'solution for failure',
    collection: ['minimal'],
  },
  {
    title: 'Attestation signature check passed',
    description:
      'The attestation signature matches available signing materials.',
    status: ENTERPRISE_CONTRACT_POLICY_STATUS.warnings,
    component: 'testsample-go',
    collection: ['slsa3', 'redhat'],
  },
  {
    title: 'Attestation syntax check passed',
    description: 'The attestation has correct syntax.',
    status: ENTERPRISE_CONTRACT_POLICY_STATUS.successes,
    component: 'testsample-go',
    collection: ['slsa3', 'redhat'],
  },
];
