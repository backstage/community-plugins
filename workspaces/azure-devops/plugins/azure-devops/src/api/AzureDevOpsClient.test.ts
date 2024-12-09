/*
 * Copyright 2021 The Backstage Authors
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

import { AzureDevOpsClient } from './AzureDevOpsClient';

describe('AzureDevOpsClient', () => {
  const discoveryApiMock = {
    getBaseUrl: jest.fn().mockResolvedValue('http://mocked-url'),
  };

  const fetchApiMock = {
    fetch: jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    }),
  };

  const azureDevOpsClient = new AzureDevOpsClient({
    discoveryApi: discoveryApiMock,
    fetchApi: fetchApiMock,
  });

  beforeEach(() => {
    fetchApiMock.fetch.mockClear();
  });

  it('should call get with correct parameters for single build definition', async () => {
    const projectName = 'project';
    const entityRef = 'some-entity-ref';
    const hostName = 'host';
    const definitionNames = 'def1';

    await azureDevOpsClient.getBuildRuns(
      projectName,
      entityRef,
      undefined,
      definitionNames,
      hostName,
      undefined,
      undefined,
    );

    expect(fetchApiMock.fetch).toHaveBeenCalledTimes(1);
    expect(fetchApiMock.fetch).toHaveBeenCalledWith(
      'http://mocked-url/builds/project?entityRef=some-entity-ref&host=host&definitionName=def1',
    );
  });

  it('should call get with correct parameters for multiple build definitions', async () => {
    const projectName = 'project';
    const entityRef = 'some-entity-ref';
    const hostName = 'host';
    const definitionNames = 'def1,def2,def3';

    await azureDevOpsClient.getBuildRuns(
      projectName,
      entityRef,
      undefined,
      definitionNames,
      hostName,
      undefined,
      undefined,
    );

    expect(fetchApiMock.fetch).toHaveBeenCalledTimes(3);
    expect(fetchApiMock.fetch).toHaveBeenCalledWith(
      'http://mocked-url/builds/project?entityRef=some-entity-ref&host=host&definitionName=def1',
    );
    expect(fetchApiMock.fetch).toHaveBeenCalledWith(
      'http://mocked-url/builds/project?entityRef=some-entity-ref&host=host&definitionName=def2',
    );
    expect(fetchApiMock.fetch).toHaveBeenCalledWith(
      'http://mocked-url/builds/project?entityRef=some-entity-ref&host=host&definitionName=def3',
    );
  });
});
