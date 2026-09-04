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
  BackendFeature,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import {
  TechInsightsFactInsertService,
  techInsightsFactInsertServiceRef,
} from '@backstage-community/plugin-tech-insights-node';
import { techInsightsFactInsertServiceFactory } from './techInsightsFactInsertServiceFactory';

/**
 * Starts a test backend wired up just enough to resolve
 * `techInsightsFactInsertServiceRef` and hands the resolved service back via a
 * capture module. The factory is plugin-scoped, and `startTestBackend`
 * requires a module attached to the same plugin id (`tech-insights`) to
 * trigger instantiation.
 */
async function captureFactInsertService(
  features: Array<BackendFeature | Promise<{ default: BackendFeature }>>,
): Promise<TechInsightsFactInsertService> {
  let captured: TechInsightsFactInsertService | undefined;
  const captureModule = createBackendModule({
    pluginId: 'tech-insights',
    moduleId: 'capture-fact-insert-service',
    register(env) {
      env.registerInit({
        deps: { service: techInsightsFactInsertServiceRef },
        async init({ service }) {
          captured = service;
        },
      });
    },
  });
  await startTestBackend({
    features: [...features, captureModule, mockServices.database.factory()],
  });
  if (!captured) {
    throw new Error('techInsightsFactInsertServiceRef was never resolved');
  }
  return captured;
}

describe('techInsightsFactInsertServiceFactory', () => {
  it('provides a service that inserts schemas and facts via the tech insights store', async () => {
    const service = await captureFactInsertService([
      techInsightsFactInsertServiceFactory,
    ]);

    await service.insertFactSchema({
      id: 'test-fact-insert',
      version: '0.0.1-test',
      schema: {
        testNumberFact: {
          type: 'integer',
          description: 'Test fact with a number type',
        },
      },
    });

    await expect(
      service.insertFacts({
        id: 'test-fact-insert',
        facts: [
          {
            entity: { namespace: 'default', kind: 'Component', name: 'a' },
            facts: { testNumberFact: 42 },
          },
        ],
      }),
    ).resolves.toBeUndefined();
  });

  it('treats insertFactSchema as idempotent for the same (id, version)', async () => {
    const service = await captureFactInsertService([
      techInsightsFactInsertServiceFactory,
    ]);

    const schema = {
      id: 'idempotent-schema',
      version: '1.0.0',
      schema: {
        count: { type: 'integer' as const, description: 'count' },
      },
    };

    await service.insertFactSchema(schema);
    await expect(service.insertFactSchema(schema)).resolves.toBeUndefined();
  });

  it('is a no-op when insertFacts is called with an empty facts array', async () => {
    const service = await captureFactInsertService([
      techInsightsFactInsertServiceFactory,
    ]);

    // No schema is registered for this id — if the store actually tried to
    // look up the latest schema this call would throw. The contract says
    // empty `facts` short-circuits.
    await expect(
      service.insertFacts({ id: 'never-registered', facts: [] }),
    ).resolves.toBeUndefined();
  });

  it('exposes only the write-only surface and not the underlying store reads', async () => {
    // The factory wraps the persistence store in a narrow adapter. If
    // someone ever returns the store directly again, this test will
    // catch the leak of read methods like `getLatestSchemas` etc.
    const service = await captureFactInsertService([
      techInsightsFactInsertServiceFactory,
    ]);

    expect(Object.keys(service).sort()).toEqual(
      ['insertFactSchema', 'insertFacts'].sort(),
    );
    expect(typeof service.insertFactSchema).toBe('function');
    expect(typeof service.insertFacts).toBe('function');
  });
});
