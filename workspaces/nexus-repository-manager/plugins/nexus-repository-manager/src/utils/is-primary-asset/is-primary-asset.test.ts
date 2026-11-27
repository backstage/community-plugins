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
import { isPrimaryAsset } from './is-primary-asset';

describe('isPrimaryAsset', () => {
  it.each(['pom', 'pom.sha1', 'jar.sha256', 'sha1'])(
    'should return false for %s',
    extension => {
      expect(isPrimaryAsset({ maven2: { extension } })).toBe(false);
    },
  );

  it.each(['jar', 'zip', 'tar.gz', 'proto'])(
    'should return true for %s',
    extension => {
      expect(isPrimaryAsset({ maven2: { extension } })).toBe(true);
    },
  );

  it('should return false for non-maven assets', () => {
    expect(isPrimaryAsset({ format: 'docker' })).toBe(true);
  });

  it('should return false for maven assets without an extension', () => {
    expect(isPrimaryAsset({ format: 'maven2' })).toBe(true);
    expect(isPrimaryAsset({ format: 'maven2', maven2: {} })).toBe(true);
  });
});
