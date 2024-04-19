/*
 * Copyright 2022 The Backstage Authors
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

import { ConfigReader } from '@backstage/config';
import { ExploreTool } from '@backstage-community/plugin-explore-common';
import { JsonObject } from '@backstage/types';
import { StaticExploreToolProvider } from './StaticExploreToolProvider';

describe('StaticExploreToolProvider', () => {
  const tool1: ExploreTool = {
    title: 'Tool 1',
    image: 'https://example/image.png',
    url: 'https://example.com',
    lifecycle: 'production',
    tags: ['tag1', 'tag2'],
  };
  const tool2: ExploreTool = {
    ...tool1,
    title: 'Tool 2',
    lifecycle: 'production',
    tags: ['tag1'],
  };
  const tool3: ExploreTool = {
    ...tool1,
    title: 'Tool 3',
    lifecycle: 'experimental',
    tags: ['tag2'],
  };
  const allTools: ExploreTool[] = [tool1, tool2, tool3];

  describe('getTools', () => {
    it('fromConfig returns a list of all tools', async () => {
      const config = new ConfigReader({
        explore: {
          tools: [
            tool1 as JsonObject,
            tool2 as JsonObject,
            tool3 as JsonObject,
          ],
        },
      });
      const provider = StaticExploreToolProvider.fromConfig(config);

      await expect(provider.getTools({})).resolves.toEqual({
        tools: allTools,
      });
    });

    it('fromData returns a list of all tools', async () => {
      const provider = StaticExploreToolProvider.fromData(allTools);

      await expect(provider.getTools({})).resolves.toEqual({
        tools: allTools,
      });
    });

    it.each([
      [['tag1'], [tool1, tool2]],
      [['tag2'], [tool1, tool3]],
      [[], allTools],
    ])(
      'returns % when filtered by tags %',
      async (tagFilter, expectedTools) => {
        const provider = StaticExploreToolProvider.fromData(allTools);

        await expect(
          provider.getTools({ filter: { tags: tagFilter } }),
        ).resolves.toEqual({
          tools: expectedTools,
        });
      },
    );

    it.each([
      [['production'], [tool1, tool2]],
      [['experimental'], [tool3]],
      [[], allTools],
    ])(
      'returns % when filtered by lifecycle %',
      async (lifecycleFilter, expectedTools) => {
        const provider = StaticExploreToolProvider.fromData(allTools);

        await expect(
          provider.getTools({ filter: { lifecycle: lifecycleFilter } }),
        ).resolves.toEqual({
          tools: expectedTools,
        });
      },
    );
  });
});
