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
  mockServices,
  registerMswTestHooks,
  createMockDirectory,
} from '@backstage/backend-test-utils';
import { TestPipeline } from '@backstage/plugin-search-backend-node';
import { graphql, http } from 'msw';
import { setupServer } from 'msw/node';
import { Readable } from 'stream';
import { ConfigReader } from '@backstage/config';
import { GithubDiscussionsCollatorFactory } from './GithubDiscussionsCollatorFactory';

const mockSearchDocIndex = {
  docs: [
    {
      title: 'Discussion 1 title',
      text: 'Example discussion 1 body text',
      location: 'https://github.com/backstage/backstage/discussions/1',
    },
    {
      title: 'Discussion 2 title',
      text: 'Example discussion 2 body text',
      location: 'https://github.com/backstage/backstage/discussions/2',
    },
  ],
};

describe('GithubDiscussionsCollatorFactory', () => {
  const logger = mockServices.logger.mock();
  const mockDir = createMockDirectory();
  const config = new ConfigReader({
    integrations: {
      github: [
        {
          host: 'github.com',
          token: 'TOKEN',
        },
      ],
    },
    search: {
      collators: {
        githubDiscussions: {
          schedule: {
            initialDelay: { seconds: 0 },
            timeout: { minutes: 1 },
            frequency: { minutes: 5 },
          },
          url: 'https://github.com/backstage/backstage',
          cacheBase: `file://${mockDir.path}`,
        },
      },
    },
  });

  it('has expected type', async () => {
    const factory = await GithubDiscussionsCollatorFactory.fromConfig({
      logger,
      config,
    });
    expect(factory.type).toBe('github-discussions');
  });

  describe('getCollator', () => {
    let factory: GithubDiscussionsCollatorFactory;
    let collator: Readable;

    const server = setupServer();
    registerMswTestHooks(server);

    beforeEach(async () => {
      mockDir.clear();
      factory = await GithubDiscussionsCollatorFactory.fromConfig({
        logger,
        config,
      });
      collator = await factory.getCollator();
      server.use(
        http.all(/.*/, () => {
          console.log('🔴 http all');
        }),
      );
    });

    it('returns a readable stream', async () => {
      expect(collator).toBeInstanceOf(Readable);
    });
    it('fetches from the configured endpoint', async () => {
      const pipeline = TestPipeline.fromCollator(collator);
      const { documents } = await pipeline.execute();
      expect(documents).toHaveLength(mockSearchDocIndex.docs.length);
    });
    //   it('should create documents for each discussion');
  });
});
