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
import fetch, { Headers } from 'node-fetch';
import { Jenkins, type JenkinsClientOptions } from './client.ts';

jest.mock('node-fetch', () => {
  const actual = jest.requireActual('node-fetch');
  return Object.assign(jest.fn(), {
    Headers: actual.Headers,
  });
});

function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
) {
  const text = JSON.stringify(body);
  const headers = new Headers({
    'content-type': 'application/json',
    ...(init.headers || {}),
  });

  return {
    ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300,
    status: init.status ?? 200,
    statusText: 'OK',
    headers,
    text: async () => text,
    json: async () => JSON.parse(text),
  } as any;
}

function textResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
) {
  const text = JSON.stringify(body);
  const headers = new Headers({
    'content-type': 'text/plain',
    ...(init.headers || {}),
  });

  return {
    ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300,
    status: init.status ?? 200,
    statusText: 'OK',
    headers,
    text: async () => text,
    json: async () => JSON.parse(text),
  } as any;
}

const mockedFetch = fetch as unknown as jest.Mock;

describe('Jenkins client', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  const baseOptions: JenkinsClientOptions = {
    baseUrl: 'https://jenkins.example.com',
  };

  it('normalizes job names', () => {
    const client = new Jenkins(baseOptions);
    // String input
    expect((client as any).normalizeJobName('a/b')).toBe('job/a/job/b');

    // Already normalized /job/
    // Operation should be idempotent
    expect((client as any).normalizeJobName('/job/a/job/b')).toBe(
      'job/a/job/b',
    );

    // Array input
    expect((client as any).normalizeJobName(['folder', 'a'])).toBe(
      'job/folder/job/a',
    );
  });

  it('request builds full URL and parses JSON by default', async () => {
    mockedFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));
    const client = new Jenkins(baseOptions);

    const result = await (client as any).request('job/a/api/json', {
      query: { tree: 'x,y' },
      method: 'GET',
    });

    expect(result).toEqual({ ok: true });
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://jenkins.example.com/job/a/api/json?tree=x%2Cy',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('request returns raw text when rawText=true', async () => {
    mockedFetch.mockResolvedValueOnce(textResponse('hello'));
    const client = new Jenkins(baseOptions);

    const out = await (client as any).request('job/main/9/consoleText', {
      rawText: true,
      method: 'GET',
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://jenkins.example.com/job/main/9/consoleText',
      expect.objectContaining({
        method: 'GET',
        headers: {
          referer: 'https://jenkins.example.com/',
        },
        body: undefined,
      }),
    );
    expect(out).toBe('"hello"');
  });

  it('does not request crumb for GET/HEAD, does for POST and caches it', async () => {
    const crumbCall = jest.fn().mockResolvedValue({
      headerName: 'Jenkins-Crumb',
      headerValue: 'abc123',
      cookies: ['JSESSIONID=xyz'],
    });

    const client = new Jenkins({
      ...baseOptions,
      crumbIssuer: crumbCall,
      headers: {
        cookie: 'foo=bar',
      },
    });

    // GET should not fetch crumb
    mockedFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));
    await (client as any).request('test', { method: 'GET' });
    expect(crumbCall).not.toHaveBeenCalled();

    // First POST triggers crumb
    mockedFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));
    await (client as any).request('build', { method: 'POST' });
    expect(crumbCall).toHaveBeenCalledTimes(1);
    const postCall = mockedFetch.mock.calls.pop();
    const headers = postCall[1].headers as Record<string, string>;
    // cookies get merged
    expect(headers.cookie).toContain('foo=bar');
    expect(headers.cookie).toContain('JSESSIONID=xyz');

    // Second POST uses cached crumb (no new call)
    mockedFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));
    await (client as any).request('buildAgain', { method: 'POST' });
    expect(crumbCall).toHaveBeenCalledTimes(1);
  });
});
