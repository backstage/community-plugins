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
import { isBookmarksAvailable } from './isBookmarksAvailable';

const entityExampleData: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'example-entity',
  },
};

describe('isBookmarksAvailable', () => {
  it('should return true if bookmarks object exists and is not empty', () => {
    const entity = {
      ...entityExampleData,
      metadata: {
        name: 'example-entity',
        bookmarks: {
          bookmark1: 'https://example.com',
        },
      },
    };
    expect(isBookmarksAvailable(entity)).toBe(true);
  });

  it('should return false if bookmarks object does not exist', () => {
    const entity = {
      ...entityExampleData,
      metadata: {
        name: 'example-entity',
      },
    };
    expect(isBookmarksAvailable(entity)).toBe(false);
  });

  it('should return false if bookmarks object is empty', () => {
    const entity = {
      ...entityExampleData,
      metadata: {
        name: 'example-entity',
        bookmarks: {},
      },
    };
    expect(isBookmarksAvailable(entity)).toBe(false);
  });

  it('should return false if bookmarks object is not an object', () => {
    const nonObjects = [null, undefined, 'not-an-object', 42, ['array'], true];

    for (const nonObject of nonObjects) {
      const entity = {
        ...entityExampleData,
        metadata: {
          name: 'example-entity',
          bookmarks: nonObject,
        },
      };
      expect(isBookmarksAvailable(entity)).toBe(false);
    }
  });

  it('should handle undefined entity gracefully', () => {
    expect(isBookmarksAvailable(undefined as any)).toBe(false);
  });
});
