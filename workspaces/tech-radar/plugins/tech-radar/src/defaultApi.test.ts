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

import { DefaultTechRadarApi, mock } from './defaultApi';
import { ConfigReader } from '@backstage/config';

describe('DefaultTechRadarApi', () => {
  const mockData = { quadrants: [], rings: [], entries: [] };
  const mockConfigData = new ConfigReader(mockData);
  const dataFromURL = {
    rings: [],
    entries: [],
    quadrants: [
      { id: 'nw', name: 'northwest' },
      { id: 'ne', name: 'northeast' },
      { id: 'se', name: 'southeast' },
      { id: 'sw', name: 'southwest' },
    ],
  };
  const jsonURL = 'https://example.com/data.json';
  const yamlURL = 'https://example.com/data.yaml';
  const malformattedJsonURL = 'https://example.com/malformatted.json';
  global.fetch = jest.fn(url => {
    switch (url) {
      case jsonURL:
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              path: 'data.json',
              content: btoa(JSON.stringify(dataFromURL)),
            }),
        });
      case yamlURL:
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              path: 'data.yaml',
            }),
        });
      case malformattedJsonURL:
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              path: 'malformatted.json',
              content: btoa(JSON.stringify({ name: 'test' })),
            }),
        });
      default:
        return Promise.resolve({
          ok: false,
        });
    }
  }) as jest.Mock;
  it('should default to standard mock data if no params are passed', async () => {
    const client = new DefaultTechRadarApi({});
    const data = await client.load();
    expect(data).toStrictEqual(mock);
  });

  it('should retrieve data from url if only url param is provided', async () => {
    const client = new DefaultTechRadarApi({
      url: jsonURL,
    });
    const data = await client.load();
    expect(data).toStrictEqual(dataFromURL);
  });

  it('should return graphData param if only graphData param is provided', async () => {
    const client = new DefaultTechRadarApi({ graphData: mockConfigData });
    const data = await client.load();
    expect(data).toStrictEqual(mockData);
  });

  it('should retrieve data from url if both params are provided', async () => {
    const client = new DefaultTechRadarApi({
      url: jsonURL,
      graphData: mockConfigData,
    });
    const data = await client.load();
    expect(data).toStrictEqual(dataFromURL);
  });

  it('should throw if fetched response from URL is not a json file', async () => {
    const client = new DefaultTechRadarApi({
      url: yamlURL,
    });
    await expect(client.load()).rejects.toThrow();
  });
});
