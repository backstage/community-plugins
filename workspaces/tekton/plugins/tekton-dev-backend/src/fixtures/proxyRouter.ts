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

import { Router } from 'express';

import {
  acsDeploymentCheck,
  acsImageCheckResults,
  acsImageScanResult,
  enterpriseContractResult,
} from './fixtureData';

/**
 * Intercepts kubernetes-backend `/proxy` pod log requests and returns the same
 * ACS/EC/log fixtures the FE mock used for e2e expanded-row coverage.
 */
export function createFixtureProxyRouter(): Router {
  const router = Router();

  router.use((req, res) => {
    // Paths look like: /api/v1/namespaces/{ns}/pods/{pod}/log?container=...
    const podMatch = req.path.match(/\/pods\/([^/]+)\/log/);
    const podName = podMatch?.[1] ?? '';

    if (podName.includes('ec-task')) {
      res.type('text/plain').send(JSON.stringify(enterpriseContractResult));
      return;
    }
    if (podName.includes('image-scan-task')) {
      res.type('text/plain').send(JSON.stringify(acsImageScanResult));
      return;
    }
    if (podName.includes('image-check-task')) {
      res.type('text/plain').send(JSON.stringify(acsImageCheckResults));
      return;
    }
    if (podName.includes('deployment-check-task')) {
      res.type('text/plain').send(JSON.stringify(acsDeploymentCheck));
      return;
    }

    const container =
      typeof req.query.container === 'string' ? req.query.container : 'step';
    res
      .type('text/plain')
      .send(`\nstreaming logs from container: ${container} \n...`);
  });

  return router;
}
