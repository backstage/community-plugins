/*
 * Copyright 2026 The Backstage Authors
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
import { Entity } from '@backstage/catalog-model';
import { parseMcpRemoteUrl, selectMcpServerRemote } from './remote';

function apiEntity(remotes?: Array<{ type?: string; url: string }>): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'API',
    metadata: { name: 'x' },
    spec: { type: 'mcp-server', ...(remotes ? { remotes } : {}) },
  };
}

describe('selectMcpServerRemote', () => {
  it('prefers a streamable-http remote over others', () => {
    const remote = selectMcpServerRemote(
      apiEntity([
        { type: 'sse', url: 'http://a/mcp' },
        { type: 'streamable-http', url: 'http://b/mcp' },
      ]),
    );
    expect(remote?.url).toBe('http://b/mcp');
  });

  it('falls back to the first remote when none are streamable-http', () => {
    expect(
      selectMcpServerRemote(apiEntity([{ url: 'http://a/mcp' }]))?.url,
    ).toBe('http://a/mcp');
  });

  it('returns undefined when there are no remotes', () => {
    expect(selectMcpServerRemote(apiEntity())).toBeUndefined();
    expect(
      selectMcpServerRemote({
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: { name: 'x' },
      }),
    ).toBeUndefined();
  });
});

describe('parseMcpRemoteUrl', () => {
  it('returns the parsed URL for http(s) links', () => {
    expect(parseMcpRemoteUrl('http://example.com/mcp')?.protocol).toBe('http:');
    expect(parseMcpRemoteUrl('https://example.com/mcp')?.origin).toBe(
      'https://example.com',
    );
  });

  it('returns undefined for non-http(s) schemes and malformed URLs (SSRF guard)', () => {
    expect(parseMcpRemoteUrl('file:///etc/passwd')).toBeUndefined();
    expect(parseMcpRemoteUrl('ftp://example.com')).toBeUndefined();
    expect(parseMcpRemoteUrl('not a url')).toBeUndefined();
    expect(parseMcpRemoteUrl('')).toBeUndefined();
  });
});
