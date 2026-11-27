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
import { getHash } from './get-hash';

describe('getHash', () => {
  it('should return the correct sha256', () => {
    const asset = {
      checksum: {
        sha256: '12345',
      },
    };
    const hash = getHash(asset);
    expect(hash?.algorithm).toBe('sha256');
    expect(hash?.value).toBe('12345');
  });

  it('should return undefined if asset is undefined', () => {
    expect(getHash(undefined)).toBe(undefined);
  });

  it('should return undefined if checksum DNE', () => {
    expect(getHash({})).toBe(undefined);
    expect(getHash({ format: 'maven2' })).toBe(undefined);
    expect(getHash({ format: 'maven2', checksum: {} })).toBe(undefined);
  });

  it('should get the sha1 hash on maven artifacts', () => {
    const asset = {
      format: 'maven2',
      checksum: {
        sha1: '12345',
        sha256: '67890',
      },
    };
    const hash = getHash(asset);
    expect(hash?.algorithm).toBe('sha1');
    expect(hash?.value).toBe('12345');
  });

  it('should get the sha256 hash on docker artifacts', () => {
    const asset = {
      format: 'docker',
      checksum: {
        sha1: '12345',
        sha256: '67890',
      },
    };
    const hash = getHash(asset);
    expect(hash?.algorithm).toBe('sha256');
    expect(hash?.value).toBe('67890');
  });

  it('should return undefined if algorithm is not supported', () => {
    const asset = {
      checksum: {
        md5: '12345',
      },
    };
    expect(getHash(asset)).toBe(undefined);
  });
});
