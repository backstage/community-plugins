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

/**
 * Intercepts kubernetes-backend `/proxy` pod log requests so pod-log UI
 * paths never hit the dummy fixture cluster URL.
 */
export function createFixtureProxyRouter(): Router {
  const router = Router();

  router.use((req, res) => {
    const container =
      typeof req.query.container === 'string' ? req.query.container : 'step';
    res
      .type('text/plain')
      .send(`\nstreaming logs from container: ${container} \n...`);
  });

  return router;
}
