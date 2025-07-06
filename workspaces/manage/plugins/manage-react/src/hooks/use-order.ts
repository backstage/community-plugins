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

/** @public */
export interface ItemWithKey<T> {
  value: T;
  key: string;
}

/**
 * Options for the useOrder hook.
 *
 * @public
 */
export interface UseOrderOptions<T, U> {
  /**
   * Lookup a key, given an item.
   * Should return a string, but can be anything else. If not a string,
   * the item will be appended at the end of the returned array.
   */
  keyOf: (item: T) => U;

  /**
   * Compare function, to order the items that are not found in the ordered list
   * of keys.
   */
  nonFoundCompare?: (a: ItemWithKey<T>, b: ItemWithKey<T>) => number;

  /** Treat keys as case sensitive */
  caseSensitive?: boolean; // default: false

  /** Stringify an item. Will fallback to keyOf. */
  stringifyItem?: (item: T) => string;

  /** Stringify a key. Will fallback to an identity function for strings */
  stringifyKey?: (key: U) => string;

  /** Custom function for joining a list of strings to a single string */
  joiner?: (keys: string[]) => string;

  /**
   * Memoization method for the items. Can be 'reference' or 'key' (default).
   *
   * If set to 'reference', the items will be memoized by reference and the
   * result will be a new array if the input array reference is changed.
   */
  itemsMemoMethod?: 'reference' | 'key';

  /**
   * Memoization method for the items. Can be 'reference' or 'key' (default).
   *
   * If set to 'reference', the items will be memoized by reference and the
   * result will be a new array if the input array reference is changed.
   */
  keysMemoMethod?: 'reference' | 'key';
}

const defaultKeyOf = ((item: string) => item) as any;
const defaultJoiner = (v: string[]) => v.join(' @@ ');

/**
 * Orders a list of items according to an ordered list of keys.
 *
 * Items not found in the ordered list of keys will be placed at the end in the
 * same order as the input.
 * Items whose key is not a string will be placed at the very end of the list.
 *
 * @public
 */
export function useOrder<T, U>(
  items: T[],
  keys: U[],
  options: UseOrderOptions<T, U>,
): T[];
/** @public */
export function useOrder<T extends string>(
  items: T[],
  keys: T[],
  options?: Partial<UseOrderOptions<T, T>>,
): T[];
/** @public */
export function useOrder<T, U>(
  items: T[],
  keys: U[],
  options?: Partial<UseOrderOptions<T, U>>,
): T[] {
  const {
    keyOf = defaultKeyOf,
    nonFoundCompare,
    caseSensitive = false,
    stringifyItem = (item: T) => `${keyOf(item)}`,
    stringifyKey = (key: U) => `${key}`,
    joiner = defaultJoiner,
    itemsMemoMethod = 'key',
    keysMemoMethod = 'key',
  } = options ?? {};

  const ensureCase = caseSensitive
    ? (s: string) => s
    : (s: string) => s.toLocaleLowerCase('en-US');

  const joinedItems = ensureCase(
    joiner(items.map(item => stringifyItem(item))),
  );
  const joinedKeys = ensureCase(joiner(keys.map(k => stringifyKey(k))));

  const memoItems = itemsMemoMethod === 'reference' ? items : joinedItems;
  const memoKeys = keysMemoMethod === 'reference' ? keys : joinedKeys;

  return useMemo(() => {
    const casedKeys = keys.map(key => ensureCase(stringifyKey(key)));

    const itemsWithKeys: ItemWithKey<T>[] = items.map(value => ({
      value,
      key: ensureCase(keyOf(value)),
    }));

    const orderableItems: ItemWithKey<T>[] = [];
    const unorderableItems: ItemWithKey<T>[] = [];
    const nonstringItems: T[] = [];

    itemsWithKeys.forEach(item => {
      const key = item.key;
      if (typeof key === 'string') {
        const casedKey = ensureCase(key);
        if (casedKeys.includes(casedKey)) {
          orderableItems.push(item);
        } else {
          unorderableItems.push(item);
        }
      } else {
        nonstringItems.push(item.value);
      }
    });

    orderableItems.sort((a, b) => {
      const aKey = a.key as string;
      const bKey = b.key as string;

      const indexA = casedKeys.indexOf(aKey);
      const indexB = casedKeys.indexOf(bKey);

      // Since we know that each item exist in the keys array,
      // we can safely assume that the indexes are not -1.
      return indexA < indexB ? -1 : 1;
    });

    if (nonFoundCompare) {
      unorderableItems.sort(nonFoundCompare);
    }

    return ([] as T[]).concat(
      orderableItems.map(item => item.value),
      unorderableItems.map(item => item.value),
      nonstringItems,
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoItems, memoKeys]);
}
