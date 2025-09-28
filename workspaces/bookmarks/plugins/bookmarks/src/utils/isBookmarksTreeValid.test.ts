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

import { Entity } from '@backstage/catalog-model';
import { isBookmarksTreeValid } from './isBookmarksTreeValid';

const entityExampleData: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'example-entity',
  },
};

describe('isBookmarksTreeValid', () => {
  it('should return true for a valid UrlTree', () => {
    const entity = {
      ...entityExampleData,
      metadata: {
        name: 'example-entity',
        bookmarks: {
          bookmark1: 'https://example.com',
          bookmark2: 'https://example.org',
        },
      },
    };
    expect(isBookmarksTreeValid(entity.metadata.bookmarks)).toBe(true);
  });

  it('should return false for an invalid UrlTree', () => {
    const entity = {
      ...entityExampleData,
      metadata: {
        name: 'example-entity',
        bookmarks: {
          bookmark1: ['not-a-url'],
        },
      },
    };
    expect(isBookmarksTreeValid(entity.metadata.bookmarks)).toBe(false);
  });

  it('should return true for an empty UrlTree as it is technically valid', () => {
    const entity = {
      ...entityExampleData,
      metadata: { name: 'example-entity', bookmarks: {} },
    };
    expect(isBookmarksTreeValid(entity.metadata.bookmarks)).toBe(true);
  });
});
