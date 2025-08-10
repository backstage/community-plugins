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

import {
  mockServices,
  registerMswTestHooks,
  startTestBackend,
} from '@backstage/backend-test-utils';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import { TestPipeline } from '@backstage/plugin-search-backend-node';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import {
  confluenceCollatorExtensionPoint,
  searchModuleConfluenceCollator,
} from './module';

describe('searchModuleConfluenceCollator extension points', () => {
  const BASE_URL = 'http://confluence.example.com';
  const worker = setupServer();
  registerMswTestHooks(worker);

  it('applies custom content parser and document transformer', async () => {
    const contentParser = jest.fn().mockImplementation(() => 'PARSED_TEXT');
    const documentTransformer = jest
      .fn()
      .mockImplementation(() => ({ title: 'TRANSFORMED_TITLE' }));

    const configurator = createBackendModule({
      pluginId: 'search',
      moduleId: 'confluence-collator-configurator',
      register(reg) {
        reg.registerInit({
          deps: { ep: confluenceCollatorExtensionPoint },
          async init({ ep }) {
            ep.setContentParser(contentParser);
            ep.setDocumentTransformer(documentTransformer);
          },
        });
      },
    });

    const extensionPointMock = {
      addCollator: jest.fn(),
    };

    await startTestBackend({
      extensionPoints: [
        [searchIndexRegistryExtensionPoint, extensionPointMock],
      ],
      features: [
        configurator,
        searchModuleConfluenceCollator,
        mockServices.rootConfig.factory({
          data: {
            search: {
              collators: {
                confluence: {
                  schedule: {
                    frequency: { minutes: 5 },
                    timeout: { minutes: 1 },
                    initialDelay: { seconds: 1 },
                  },
                },
              },
            },
            confluence: {
              baseUrl: BASE_URL,
              auth: { type: 'bearer', token: 't' },
            },
          },
        }),
        mockServices.logger.factory(),
      ],
    });

    expect(extensionPointMock.addCollator).toHaveBeenCalledTimes(1);
    const { factory } = extensionPointMock.addCollator.mock.calls[0][0];

    // Mock Confluence API for list and document fetch
    worker.use(
      rest.get(`${BASE_URL}/rest/api/content/search`, (_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            results: [
              {
                id: '1',
                title: 't',
                status: 'current',
                _links: { webui: '/p' },
                version: { when: '2020-01-01' },
              },
            ],
            _links: {},
          }),
        );
      }),
      rest.get(`${BASE_URL}/rest/api/content/1`, (req, res, ctx) => {
        // ensure expand requested to include necessary fields
        expect(req.url.searchParams.get('expand')).toContain('body.storage');
        return res(
          ctx.status(200),
          ctx.json({
            id: '1',
            title: 'Original Title',
            status: 'current',
            type: 'page',
            body: { storage: { value: '<p>ignored</p>' } },
            space: { key: 'S', name: 'Space', _links: { webui: '/s' } },
            ancestors: [],
            version: {
              when: '2020-01-01',
              friendlyWhen: 'yesterday',
              by: { publicName: 'me' },
            },
            _links: { base: BASE_URL, webui: '/p' },
          }),
        );
      }),
    );

    const collator = await factory.getCollator();
    const pipeline = TestPipeline.fromCollator(collator);
    const { documents: docs } = await pipeline.execute();

    expect(contentParser).toHaveBeenCalled();
    expect(documentTransformer).toHaveBeenCalled();
    expect(docs).toHaveLength(1);
    expect(docs[0].text).toBe('PARSED_TEXT');
    expect(docs[0].title).toBe('TRANSFORMED_TITLE');
  });
});
