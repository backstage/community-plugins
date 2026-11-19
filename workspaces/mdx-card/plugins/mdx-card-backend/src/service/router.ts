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
import {
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { InputError, NotAllowedError } from '@backstage/errors';
import {
  AuthorizeResult,
  BasicPermission,
} from '@backstage/plugin-permission-common';
import {
  MDX_CARD_TEMPLATE_ID_PATTERN,
  mdxCardTemplateCreatePermission,
  mdxCardTemplateDeletePermission,
  mdxCardTemplateReadPermission,
  mdxCardTemplateUpdatePermission,
} from '@backstage-community/plugin-mdx-card-common';
import express from 'express';
import Router from 'express-promise-router';
import { z } from 'zod';
import { TemplateStore } from './TemplateStore';

const templateInputSchema = z.object({
  title: z.string().optional(),
  template: z.string(),
  dataFetchers: z
    .array(
      z.object({
        name: z.string().min(1),
        pluginId: z.string().min(1),
        apiUrl: z.string().min(1),
      }),
    )
    .default([]),
});

const createTemplateSchema = templateInputSchema.extend({
  id: z
    .string()
    .regex(
      MDX_CARD_TEMPLATE_ID_PATTERN,
      'id must contain only lowercase letters, numbers and single dashes',
    ),
});

const parseBody = <T>(schema: z.ZodType<T>, body: unknown): T => {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new InputError(
      result.error.issues
        .map(issue => `${issue.path.join('.') || 'body'}: ${issue.message}`)
        .join('; '),
    );
  }
  return result.data;
};

export async function createRouter(options: {
  httpAuth: HttpAuthService;
  permissions: PermissionsService;
  store: TemplateStore;
}): Promise<express.Router> {
  const { httpAuth, permissions, store } = options;

  const authorize = async (
    req: express.Request,
    permission: BasicPermission,
  ) => {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const [decision] = await permissions.authorize([{ permission }], {
      credentials,
    });
    if (decision.result !== AuthorizeResult.ALLOW) {
      throw new NotAllowedError('Unauthorized');
    }
    return credentials.principal.userEntityRef;
  };

  const router = Router();
  router.use(express.json());

  router.get('/templates', async (req, res) => {
    await authorize(req, mdxCardTemplateReadPermission);
    res.json({ items: await store.list() });
  });

  router.get('/templates/:id', async (req, res) => {
    await authorize(req, mdxCardTemplateReadPermission);
    res.json(await store.get(req.params.id));
  });

  router.post('/templates', async (req, res) => {
    const userRef = await authorize(req, mdxCardTemplateCreatePermission);
    const { id, ...input } = parseBody(createTemplateSchema, req.body);
    res.status(201).json(await store.create(id, input, userRef));
  });

  router.put('/templates/:id', async (req, res) => {
    const userRef = await authorize(req, mdxCardTemplateUpdatePermission);
    const input = parseBody(templateInputSchema, req.body);
    res.json(await store.update(req.params.id, input, userRef));
  });

  router.delete('/templates/:id', async (req, res) => {
    await authorize(req, mdxCardTemplateDeletePermission);
    await store.delete(req.params.id);
    res.status(204).end();
  });

  return router;
}
