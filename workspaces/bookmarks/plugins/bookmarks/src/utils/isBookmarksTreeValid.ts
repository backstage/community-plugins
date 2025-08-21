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

/**
 * Recursively check if a given object conforms to the UrlTree type
 *
 * @param tree - The object to validate
 * @returns true if the object is a valid UrlTree, false otherwise
 */
export const isBookmarksTreeValid = (tree: unknown): tree is UrlTree => {
  return (
    typeof tree === 'object' &&
    tree !== null &&
    !Array.isArray(tree) &&
    Object.values(tree).every(
      value => typeof value === 'string' || isBookmarksTreeValid(value),
    )
  );
};
