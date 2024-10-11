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

describe('DefaultTechRadarApi', () => {
  const discoveryApiMock = {
    getBaseUrl: jest.fn().mockResolvedValue('https://example.com'),
  };
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
  const jsonFile = '/data.json';
  const yamlFile = '/data.yaml';
  const jsonURL = `https://example.com${jsonFile}`;
  const yamlURL = `https://example.com${yamlFile}`;
  const fetchApiMock = {
    fetch: jest.fn(url => {
      switch (url) {
        case jsonURL:
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                path: jsonFile,
                content: btoa(JSON.stringify(dataFromURL)),
              }),
          } as Response);
        case yamlURL:
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                path: yamlFile,
              }),
          } as Response);
        default:
          return Promise.resolve({
            ok: false,
            json: () =>
              Promise.resolve({
                path: yamlFile,
              }),
          } as Response);
      }
    }),
  };
  it('should default to standard mock data if no params are passed', async () => {
    const client = new DefaultTechRadarApi({
      discoveryApi: discoveryApiMock,
      fetchApi: fetchApiMock,
    });
    const data = await client.load();
    expect(discoveryApiMock.getBaseUrl).not.toHaveBeenCalled();
    expect(data).toStrictEqual(mock);
  });

  it('should retrieve data from proxyUri if proxyUri param is provided', async () => {
    const client = new DefaultTechRadarApi({
      discoveryApi: discoveryApiMock,
      fetchApi: fetchApiMock,
      proxyUri: jsonFile,
    });
    const data = await client.load();
    expect(data).toStrictEqual(dataFromURL);
    expect(discoveryApiMock.getBaseUrl).toHaveBeenCalledWith('proxy');
    expect(fetchApiMock.fetch).toHaveBeenCalledWith(jsonURL);
  });

  it('should throw if fetched response from proxyUri is not a json file', async () => {
    const client = new DefaultTechRadarApi({
      discoveryApi: discoveryApiMock,
      fetchApi: fetchApiMock,
      proxyUri: yamlFile,
    });
    await expect(client.load()).rejects.toThrow();
    expect(discoveryApiMock.getBaseUrl).toHaveBeenCalledWith('proxy');
    expect(fetchApiMock.fetch).toHaveBeenCalledWith(yamlURL);
  });
});
