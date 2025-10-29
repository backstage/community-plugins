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

import { UrlTree } from '../types';
import { useEntity } from '@backstage/plugin-catalog-react';
import { isBookmarksAvailable } from '../utils/isBookmarksAvailable';
import { isBookmarksTreeValid } from '../utils/isBookmarksTreeValid';

export enum USE_TREE_ERROR {
  /** entity.metadata.bookmarks exists but is invalid */
  INVALID = 'invalid',
  /** entity.metadata.bookmarks does not exist */
  NOT_FOUND = 'not_found',
}

type UseTreeResult =
  | {
      tree: UrlTree;
      error: null;
    }
  | {
      tree: null;
      error: USE_TREE_ERROR;
    };

/** Hook to retrieve the bookmarks tree from the entity. */
export const useTree = (): UseTreeResult => {
  const { entity } = useEntity();

  if (!isBookmarksAvailable(entity)) {
    return { tree: null, error: USE_TREE_ERROR.NOT_FOUND };
  }

  if (!isBookmarksTreeValid(entity.metadata.bookmarks)) {
    return { tree: null, error: USE_TREE_ERROR.INVALID };
  }

  return { tree: entity.metadata.bookmarks, error: null };
};
