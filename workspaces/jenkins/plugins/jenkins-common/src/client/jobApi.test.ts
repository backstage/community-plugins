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
import fetch from 'node-fetch';
import { Jenkins } from '../client';

jest.mock('node-fetch', () => jest.fn());
const mockedFetch = fetch as unknown as jest.Mock;

function jsonResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: {
      get: () => 'application/json',
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as any;
}

describe('jobApi', () => {
  beforeEach(() => mockedFetch.mockReset());

  const client = new Jenkins({
    baseUrl: 'https://jenkins.example.com',
  });

  it('Job.get builds GET to /job/<path>/api/json with optional tree/depth', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse({ jobs: [] }));
    await client.job.get({
      name: ['folder', 'main'],
      tree: 'jobs[name]',
      depth: 2,
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://jenkins.example.com/job/folder/job/main/api/json?tree=jobs%5Bname%5D&depth=2',
      expect.objectContaining({
        body: undefined,
        headers: {
          referer: 'https://jenkins.example.com/',
        },
        method: 'GET',
      }),
    );
  });

  it('Job.getBuilds requests standard tree when not provided as param', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse({}));
    await client.job.getBuilds(['folder', 'test']);
    expect(mockedFetch.mock.calls[0][0]).toBe(
      'https://jenkins.example.com/job/folder/job/test/api/json?tree=builds%5Bnumber%2Curl%2Cresult%2Ctimestamp%2Cid%2CqueueId%2CdisplayName%2Cduration%5D',
    );
  });

  it('Job.build chooses endpoint and encodes params/token/delay', async () => {
    mockedFetch.mockResolvedValue(jsonResponse({}));

    // With params -> buildWithParameters
    await client.job.build('proj', {
      parameters: { BRANCH: 'main', MESSAGE: 'hello world' },
      token: 't-123',
      delay: '0sec',
    });

    // Note: index 0 should be crumb issuer call
    let [url, init] = mockedFetch.mock.calls[1] as [string, any];
    expect(url).toBe(
      'https://jenkins.example.com/job/proj/buildWithParameters?token=t-123&delay=0sec',
    );
    expect(init.method).toBe('POST');
    // body should be URLSearchParams
    expect(String(init.body)).toContain('BRANCH=main');
    expect(String(init.body)).toContain('MESSAGE=hello+world');

    mockedFetch.mockClear();

    // without parameters -> build
    mockedFetch.mockResolvedValue(jsonResponse({}));
    await client.job.build(['folder', 'proj'], { token: 'abc' });
    [url, init] = mockedFetch.mock.calls[0] as [string, any];
    expect(url).toBe(
      'https://jenkins.example.com/job/folder/job/proj/build?token=abc',
    );
    expect(init.method).toBe('POST');
    // no body
    expect(init.body).toBeUndefined();
  });

  it('Job.copy builds URL correctly', async () => {
    // String
    mockedFetch.mockResolvedValueOnce(jsonResponse({}));
    await client.job.copy('pipelineACopy', 'pipelineA');
    let [url, init] = mockedFetch.mock.calls[0] as [string, any];
    expect(url).toBe(
      'https://jenkins.example.com/createItem?name=pipelineACopy&mode=copy&from=pipelineA',
    );
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();

    // Array
    mockedFetch.mockResolvedValueOnce(jsonResponse({}));
    await client.job.copy(['folder', 'proj', 'dup'], 'folder/proj');
    [url, init] = mockedFetch.mock.calls[1] as [string, any];
    expect(url).toBe(
      'https://jenkins.example.com/job/folder/job/proj/createItem?name=dup&mode=copy&from=folder%2Fproj',
    );
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();
  });

  it('Job.create builds URL correctly and accepts XML', async () => {
    const xml = `
      <flow-definition plugin="workflow-job">
        <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps">
          <script>pipeline { agent any; stages { stage('hi'){steps{ echo 'hello' } } } }</script>
          <sandbox>true</sandbox>
        </definition>
      </flow-definition>
    `;

    // String
    mockedFetch.mockResolvedValueOnce(jsonResponse({}));
    await client.job.create('pipelineA', xml);
    let [url, init] = mockedFetch.mock.calls[0] as [string, any];
    expect(url).toBe('https://jenkins.example.com/createItem?name=pipelineA');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(xml);

    // Array
    mockedFetch.mockResolvedValueOnce(jsonResponse({}));
    await client.job.create(['folder', 'proj'], xml);
    [url, init] = mockedFetch.mock.calls[1] as [string, any];
    expect(url).toBe(
      'https://jenkins.example.com/job/folder/createItem?name=proj',
    );
    expect(init.method).toBe('POST');
    expect(init.body).toBe(xml);
  });

  it('Job.destroy builds URL correctly', async () => {
    // String
    mockedFetch.mockResolvedValueOnce(jsonResponse({}));
    await client.job.destroy('pipelineA');
    let [url, init] = mockedFetch.mock.calls[0] as [string, any];
    expect(url).toBe('https://jenkins.example.com/job/pipelineA/doDelete');
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();

    // Array
    mockedFetch.mockResolvedValueOnce(jsonResponse({}));
    await client.job.destroy(['folder', 'proj']);
    [url, init] = mockedFetch.mock.calls[1] as [string, any];
    expect(url).toBe(
      'https://jenkins.example.com/job/folder/job/proj/doDelete',
    );
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();
  });

  it('Job.enable builds URL correctly', async () => {
    // String
    mockedFetch.mockResolvedValueOnce(jsonResponse({}));
    await client.job.enable('pipelineA');
    let [url, init] = mockedFetch.mock.calls[0] as [string, any];
    expect(url).toBe('https://jenkins.example.com/job/pipelineA/enable');
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();

    // Array
    mockedFetch.mockResolvedValueOnce(jsonResponse({}));
    await client.job.enable(['folder', 'proj']);
    [url, init] = mockedFetch.mock.calls[1] as [string, any];
    expect(url).toBe('https://jenkins.example.com/job/folder/job/proj/enable');
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();
  });

  it('Job.disable builds URL correctly', async () => {
    // String
    mockedFetch.mockResolvedValueOnce(jsonResponse({}));
    await client.job.disable('pipelineA');
    let [url, init] = mockedFetch.mock.calls[0] as [string, any];
    expect(url).toBe('https://jenkins.example.com/job/pipelineA/disable');
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();

    // Array
    mockedFetch.mockResolvedValueOnce(jsonResponse({}));
    await client.job.disable(['folder', 'proj']);
    [url, init] = mockedFetch.mock.calls[1] as [string, any];
    expect(url).toBe('https://jenkins.example.com/job/folder/job/proj/disable');
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();
  });
});
