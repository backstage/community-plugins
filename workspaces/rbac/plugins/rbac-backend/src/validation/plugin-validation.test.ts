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
import { validatePermissionDependentPlugin } from './plugin-validation';

describe('validatePermissionDependentPlugin', () => {
  it('does not throw when ids is a valid array of strings', () => {
    expect(() =>
      validatePermissionDependentPlugin({
        ids: ['plugin-a', 'plugin-b'],
      }),
    ).not.toThrow();
  });

  it('throws if ids is missing', () => {
    expect(() => validatePermissionDependentPlugin({} as any)).toThrow(
      `'ids' must be specified in the permission dependent plugin`,
    );
  });

  it('throws if ids is not an array', () => {
    expect(() =>
      validatePermissionDependentPlugin({ ids: 'plugin-a' } as any),
    ).toThrow(`'ids' must be an array of string plugin ID values`);
  });

  it('throws if ids contains non-string values', () => {
    expect(() =>
      validatePermissionDependentPlugin({ ids: ['plugin-a', 123] } as any),
    ).toThrow(`'ids' must be an array of string plugin ID values`);
  });

  it('throws if ids is an empty array', () => {
    expect(() => validatePermissionDependentPlugin({ ids: [] })).toThrow(
      `'ids' must contain at least one plugin ID`,
    );
  });

  it('throws if ids contains duplicates', () => {
    expect(() =>
      validatePermissionDependentPlugin({ ids: ['plugin-a', 'plugin-a'] }),
    ).toThrow(`'ids' contains duplicate plugin ID 'plugin-a'`);
  });

  it('allows plugin ids with varied characters and casing', () => {
    expect(() =>
      validatePermissionDependentPlugin({
        ids: ['Catalog.API', 'catalog/api', 'catalog plugin'],
      }),
    ).not.toThrow();
  });

  it('throws if an id is too long', () => {
    const longId = 'a'.repeat(65);
    expect(() => validatePermissionDependentPlugin({ ids: [longId] })).toThrow(
      `plugin ID '${longId}' must be between 1 and 64 characters`,
    );
  });
});
