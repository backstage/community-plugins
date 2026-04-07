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
import { createDevApp } from '@backstage/frontend-dev-utils';
import {
  ApiBlueprint,
  createFrontendModule,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import { EntityNamePickerFieldExtension } from '@backstage/plugin-scaffolder';
import {
  FormFieldBlueprint,
  createFormField,
} from '@backstage/plugin-scaffolder-react/alpha';

import plugin from '../src';

/**
 * Dev-only fetchApi override that auto-injects a guest Bearer token for all
 * requests to the local backend (localhost:7007).
 *
 * Why not override identityApiRef? AppRouter calls
 * `toAppIdentityProxy(useApi(identityApiRef))` which requires the impl to have
 * an `enableCookieAuth` property — a private framework interface. Overriding
 * fetchApiRef directly is simpler and avoids that constraint.
 */
const devGuestFetchModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    ApiBlueprint.make({
      name: 'fetch',
      params: defineParams =>
        defineParams({
          api: fetchApiRef,
          deps: {},
          factory: () => {
            let cachedToken: string | undefined;
            let expiresAt = 0;

            async function getGuestToken(): Promise<string | undefined> {
              const now = Date.now();
              if (cachedToken && expiresAt > now + 60_000) return cachedToken;
              try {
                const resp = await globalThis.fetch(
                  'http://localhost:7007/api/auth/guest/refresh',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ scope: '' }),
                  },
                );
                if (!resp.ok) return undefined;
                const data = await resp.json();
                cachedToken = data?.backstageIdentity?.token as
                  | string
                  | undefined;
                expiresAt =
                  now +
                  (data?.backstageIdentity?.expiresInSeconds ?? 3600) * 1000;
                return cachedToken;
              } catch {
                return undefined;
              }
            }

            return {
              fetch: async (
                input: Parameters<typeof fetch>[0],
                init?: Parameters<typeof fetch>[1],
              ) => {
                let url: string;
                if (typeof input === 'string') {
                  url = input;
                } else if (input instanceof URL) {
                  url = input.toString();
                } else {
                  url = (input as Request).url;
                }

                if (!url.startsWith('http://localhost:7007')) {
                  return globalThis.fetch(input, init);
                }

                const token = await getGuestToken();
                return globalThis.fetch(input, {
                  ...init,
                  headers: {
                    ...(init?.headers ?? {}),
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                });
              },
            };
          },
        }),
    }),
  ],
});

// Register the built-in EntityNamePicker scaffolder field extension so that
// patches using `ui:field: EntityNamePicker` work in the dev environment.
const entityNamePickerModule = createFrontendModule({
  pluginId: 'scaffolder',
  extensions: [
    FormFieldBlueprint.make({
      name: 'entity-name-picker',
      params: {
        field: async () =>
          createFormField({
            name: 'EntityNamePicker',
            component: EntityNamePickerFieldExtension as any,
          }),
      },
    }),
  ],
});

createDevApp({
  features: [
    plugin,
    catalogPlugin,
    scaffolderPlugin,
    devGuestFetchModule,
    entityNamePickerModule,
  ],
});
