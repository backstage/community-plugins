/*
 * Copyright 2020 The Backstage Authors
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
  RadarRing,
  RadarQuadrant,
  RadarEntry,
  TechRadarLoaderResponse,
  TechRadarApi,
} from './api';
import { Config } from '@backstage/config';
import { DiscoveryApi, FetchApi } from '@backstage/frontend-plugin-api';

const rings = new Array<RadarRing>();
rings.push({
  id: 'adopt',
  name: 'ADOPT',
  color: '#5BA300',
  description:
    'Commodi accusantium culpa sed itaque excepturi rem eum nulla possimus.',
});
rings.push({
  id: 'trial',
  name: 'TRIAL',
  color: '#009EB0',
  description: 'Recusandae possimus ipsum dolores.',
});
rings.push({
  id: 'assess',
  name: 'ASSESS',
  color: '#C7BA00',
  description:
    'In asperiores repellat error recusandae et adipisci laborum porro.',
});
rings.push({
  id: 'hold',
  name: 'HOLD',
  color: '#E09B96',
  description: 'Esse mollitia in.',
});

const quadrants = new Array<RadarQuadrant>();
quadrants.push({ id: 'infrastructure', name: 'Infrastructure' });
quadrants.push({ id: 'frameworks', name: 'Frameworks' });
quadrants.push({ id: 'languages', name: 'Languages' });
quadrants.push({ id: 'process', name: 'Process' });

const entries = new Array<RadarEntry>();
entries.push({
  timeline: [
    {
      moved: 0,
      ringId: 'adopt',
      date: new Date('2020-08-06'),
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    },
  ],
  key: 'javascript',
  id: 'javascript',
  title: 'JavaScript',
  quadrant: 'languages',
  links: [
    {
      url: 'https://www.javascript.com/',
      title: 'Learn more',
    },
    {
      url: 'https://www.typescriptlang.org/',
      title: 'TypeScript',
    },
  ],
  description:
    'Excepteur **sint** occaecat *cupidatat* non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n```ts\nconst x = "3";\n```\n',
});
entries.push({
  timeline: [
    {
      moved: -1,
      ringId: 'adopt',
      date: new Date('2020-08-06'),
      description:
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat',
    },
  ],
  key: 'typescript',
  id: 'typescript',
  title: 'TypeScript',
  quadrant: 'languages',
  description:
    'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat',
});
entries.push({
  timeline: [
    {
      moved: 1,
      ringId: 'adopt',
      date: new Date('2020-08-06'),
      description:
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
    },
  ],
  links: [
    {
      url: 'https://webpack.js.org/',
      title: 'Learn more',
    },
  ],
  key: 'webpack',
  id: 'webpack',
  title: 'Webpack',
  quadrant: 'frameworks',
});
entries.push({
  timeline: [
    {
      moved: 0,
      ringId: 'adopt',
      date: new Date('2020-08-06'),
    },
  ],
  links: [
    {
      url: 'https://reactjs.org/',
      title: 'Learn more',
    },
  ],
  key: 'react',
  id: 'react',
  title: 'React',
  quadrant: 'frameworks',
});
entries.push({
  timeline: [
    {
      moved: 0,
      ringId: 'adopt',
      date: new Date('2020-08-06'),
    },
  ],
  key: 'code-reviews',
  id: 'code-reviews',
  title: 'Code Reviews',
  quadrant: 'process',
});
entries.push({
  timeline: [
    {
      moved: 0,
      ringId: 'assess',
      date: new Date('2020-08-06'),
    },
  ],
  key: 'mob-programming',
  id: 'mob-programming',
  title: 'Mob Programming',
  quadrant: 'process',
});
entries.push({
  timeline: [
    {
      moved: 0,
      ringId: 'adopt',
      date: new Date('2020-08-06'),
    },
  ],
  key: 'docs-like-code',
  id: 'docs-like-code',
  title: 'Docs-like-code',
  quadrant: 'process',
});
entries.push({
  timeline: [
    {
      ringId: 'hold',
      date: new Date('2020-08-06'),
    },
  ],
  key: 'force-push',
  id: 'force-push',
  title: 'Force push to master',
  quadrant: 'process',
});
entries.push({
  timeline: [
    {
      ringId: 'adopt',
      date: new Date('2020-08-06'),
      description: 'long description',
    },
    {
      ringId: 'trial',
      date: new Date('2020-07-05'),
      description: 'long description',
    },
  ],
  links: [
    {
      url: 'https://github.com',
      title: 'Learn more',
    },
  ],
  key: 'github-actions',
  id: 'github-actions',
  title: 'GitHub Actions',
  quadrant: 'infrastructure',
});

export const mock: TechRadarLoaderResponse = {
  entries,
  quadrants,
  rings,
};

export type Options = {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
  /**
   * Uri provided via config to load the graph data from.
   */
  proxyUri?: string;
  /**
   * Hard coded graph data populated directly via the config.
   */
  graphData?: Config;
};

export class DefaultTechRadarApi implements TechRadarApi {
  private readonly proxyUri: string | undefined;
  private readonly graphData: Config | undefined;
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;

  constructor(opts: Options) {
    this.discoveryApi = opts.discoveryApi;
    this.fetchApi = opts.fetchApi;
    this.proxyUri = opts.proxyUri;
    this.graphData = opts.graphData;
  }
  async load() {
    if (this.proxyUri) {
      const proxyUrl = `${await this.discoveryApi.getBaseUrl('proxy')}${
        this.proxyUri
      }`;
      const response = await this.fetchApi.fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(
          `Get request failed to ${this.proxyUri} with ${response.status} ${response.statusText}`,
        );
      }
      const responseJson = await response.json();
      if (!responseJson.path.endsWith('.json')) {
        throw new Error(
          `Retrieved file content from ${this.proxyUri} is not JSON. Please provide a path to a JSON file.`,
        );
      }
      const jsonContent: TechRadarLoaderResponse = JSON.parse(
        atob(responseJson.content),
      );
      // could add more robust type validation here as a future improvement
      return jsonContent;
    }
    if (this.graphData) {
      const parsedData: TechRadarLoaderResponse = {
        quadrants: this.graphData
          .getConfigArray('quadrants')
          .map(q => ({ id: q.getString('id'), name: q.getString('name') })),
        rings: this.graphData.getConfigArray('rings').map(r => ({
          id: r.getString('id'),
          name: r.getString('name'),
          color: r.getString('color'),
        })),
        entries: this.graphData.getConfigArray('entries').map(e => ({
          id: e.getString('id'),
          key: e.getString('key'),
          quadrant: e.getString('quadrant'),
          title: e.getString('title'),
          description: e.getOptionalString('description'),
          links: e.getOptionalConfigArray('links')?.map(l => ({
            url: l.getString('url'),
            title: l.getString('title'),
          })),
          timeline: e.getConfigArray('timeline').map(t => ({
            ringId: t.getString('ringId'),
            date: new Date(t.get('date')),
            moved: t.getOptionalNumber('moved'),
            description: t.getOptionalString('description'),
          })),
        })),
      };
      return parsedData;
    }
    return mock;
  }
}
