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
import { HttpAuthService } from '@backstage/backend-plugin-api';
import { ResponseError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import { NpmRegistryService } from './services';

export async function createRouter({
  httpAuth,
  npmRegistryService,
}: {
  httpAuth: HttpAuthService;
  npmRegistryService: NpmRegistryService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/:entityRef/package-info', async (req, res) => {
    const entityRef = req.params.entityRef;
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    try {
      const packageInfo = await npmRegistryService.getPackageInfo(entityRef, {
        credentials,
      });
      res.json(packageInfo);
    } catch (error) {
      if (error instanceof ResponseError) {
        res.status(error.statusCode).json(error.response);
      } else {
        throw error;
      }
    }
  });

  return router;
}
