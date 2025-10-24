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
    headers: { get: () => 'application/json' },
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as any;
}

function textResponse(text: string) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: { get: () => 'text/plain' },
    json: async () => ({ text }),
    text: async () => text,
  } as any;
}

describe('buildApi', () => {
  beforeEach(() => mockedFetch.mockReset());
  const client = new Jenkins({ baseUrl: 'https://jenkins.example.com' });

  it('getLastBuild hits /lastBuild/api/json', async () => {
    // String
    mockedFetch.mockResolvedValueOnce(jsonResponse({ number: 8 }));
    await client.build.get('folder/proj', 8);
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://jenkins.example.com/job/folder/job/proj/8/api/json',
      expect.objectContaining({ method: 'GET' }),
    );

    // Array
    mockedFetch.mockResolvedValueOnce(jsonResponse({ number: 8 }));
    await client.build.get(['folder', 'proj'], 8);
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://jenkins.example.com/job/folder/job/proj/8/api/json',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('getConsoleText returns raw string and uses rawText flag', async () => {
    // String
    mockedFetch.mockResolvedValueOnce(textResponse('log line 1\nlog line 2\n'));
    let text = await client.build.getConsoleText(['folder', 'proj'], 7);
    expect(text).toContain('log line 1');
    let [url] = mockedFetch.mock.calls[0] as [string, any];
    expect(url).toBe(
      'https://jenkins.example.com/job/folder/job/proj/7/consoleText',
    );

    // Text
    mockedFetch.mockResolvedValueOnce(textResponse('log line 1\nlog line 2\n'));
    text = await client.build.getConsoleText('folder/proj', 7);
    expect(text).toContain('log line 1');
    [url] = mockedFetch.mock.calls[1] as [string, any];
    expect(url).toBe(
      'https://jenkins.example.com/job/folder/job/proj/7/consoleText',
    );
  });
});
