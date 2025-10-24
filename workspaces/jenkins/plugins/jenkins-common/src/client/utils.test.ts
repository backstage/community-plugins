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
import type { Response } from 'node-fetch';
import {
  addQueryParams,
  joinUrl,
  trimLeadingSlash,
  ensureTrailingSlash,
  safeExtractText,
} from './utils';

describe('utils', () => {
  it('trimLeadingSlash', () => {
    expect(trimLeadingSlash('/a/b')).toBe('a/b');
    expect(trimLeadingSlash('a/b')).toBe('a/b');
    expect(trimLeadingSlash('/')).toBe('');
  });

  it('ensureTrailingSlash', () => {
    expect(ensureTrailingSlash('https://jenkins')).toBe('https://jenkins/');
    expect(ensureTrailingSlash('https://jenkins/')).toBe('https://jenkins/');
  });

  it('addQueryParams', () => {
    expect(addQueryParams('https://example.com' as any, {}).toString()).toBe(
      'https://example.com/',
    );
    expect(
      addQueryParams('https://example.com' as any, { depth: '1' }).toString(),
    ).toBe('https://example.com/?depth=1');
    expect(
      addQueryParams('https://example.com' as any, {
        depth: '1',
        delay: 'false',
      }).toString(),
    ).toBe('https://example.com/?depth=1&delay=false');
  });

  it('joinUrl', () => {
    expect(joinUrl('https://host.com', 'a/b')).toBe('https://host.com/a/b');
    expect(joinUrl('https://host.com', 'a/b?x=1')).toBe(
      'https://host.com/a/b?x=1',
    );
  });

  it('safeExtractText returns body', async () => {
    const res: Partial<Response> = {
      text: () => Promise.resolve('hello'),
    };
    await expect(safeExtractText(res as any)).resolves.toBe('hello');
  });

  it('safeExtractText tolerates text() failure', async () => {
    const res: Partial<Response> = {
      text: () => Promise.reject(new Error('uh oh')),
    };
    await expect(safeExtractText(res as any)).resolves.toBe(
      '<no response body>',
    );
  });
});
