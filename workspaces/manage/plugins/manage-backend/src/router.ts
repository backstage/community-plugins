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
import express from 'express';
import Router from 'express-promise-router';

import {
  HttpAuthService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';

import { ManageService } from './services/Manage';

export async function createRouter({
  httpAuth,
  userInfo,
  manageService,
}: {
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
  manageService: ManageService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/home', async (req, res) => {
    const kinds = (() => {
      const kind = req.query.kind;
      if (typeof kind === 'string') {
        return [kind];
      } else if (Array.isArray(kind)) {
        return kind.filter(k => typeof k === 'string') as string[];
      } else if (typeof kind === 'undefined') {
        return [];
      }
      throw new InputError(`Invalid query parameter "kind"`);
    })();

    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const { ownershipEntityRefs } = await userInfo.getUserInfo(credentials);

    const ownersAndOwnedEntities =
      await manageService.getOwnersAndOwnedEntities(
        ownershipEntityRefs,
        kinds,
        credentials,
      );

    res.json(ownersAndOwnedEntities);
  });

  return router;
}
