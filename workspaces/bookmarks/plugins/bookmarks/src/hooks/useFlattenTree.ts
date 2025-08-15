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

import { useMemo } from 'react';
import { UrlTree } from '../types';
import { PATH_SEPARATOR } from '../consts/consts';

/** Flattened node type with key and value */
export type FlattenedNode = { key: string; value: string };

/** Flattened representation of a UrlTree */
export type FlattenedTree = FlattenedNode[];

/** Flatten the UrlTree to an array of URLs, with key as full path */
export const useFlattenTree = (tree: UrlTree): FlattenedTree =>
  useMemo(() => {
    const acc: FlattenedTree = [];
    const inOrderTraverse = (node: UrlTree, path: string[] = []) =>
      Object.entries(node).forEach(([key, value]) =>
        typeof value === 'string'
          ? acc.push({ key: [...path, key].join(PATH_SEPARATOR), value })
          : inOrderTraverse(value, [...path, key]),
      );
    inOrderTraverse(tree);
    return acc;
  }, [tree]);

export type UnorderedFlattenedTree = { [key: string]: string };

/** Convert a UrlTree to a key-value map of flattened URLs for easy lookup */
export const useUnorderedFlattenedTree = (
  tree: UrlTree,
): UnorderedFlattenedTree => {
  const flatTree = useFlattenTree(tree);
  return useMemo(
    () => Object.fromEntries(flatTree.map(({ key, value }) => [key, value])),
    [flatTree],
  );
};
