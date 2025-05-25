/*
 * Copyright 2024 The Backstage Authors
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

import type { Namespace } from '@backstage-community/plugin-kiali-common/types';

// @ts-expect-error
export const removeDuplicatesArray = a =>
  [...Array.from(new Set(a))] as string[];

export const arrayEquals = <T>(
  a1: T[],
  a2: T[],
  comparator: (v1: T, v2: T) => boolean,
) => {
  if (a1.length !== a2.length) {
    return false;
  }
  for (let i = 0; i < a1.length; ++i) {
    if (!comparator(a1[i], a2[i])) {
      return false;
    }
  }
  return true;
};

export const namespaceEquals = (ns1: Namespace[], ns2: Namespace[]): boolean =>
  arrayEquals(ns1, ns2, (n1, n2) => n1.name === n2.name);

export function groupBy<T>(items: T[], key: keyof T): { [key: string]: T[] } {
  return items.reduce(
    (result, item) => ({
      ...result,
      [item[key as keyof T] as any]: [
        ...(result[item[key as keyof T] as any] || []),
        item,
      ],
    }),
    {} as { [key: string]: T[] },
  );
}

export type validationType = 'success' | 'warning' | 'error' | 'default';
export const isValid = (
  isValidS?: boolean,
  isWarning?: boolean,
): validationType => {
  if (isValidS === undefined) {
    return 'default';
  }
  if (isValidS) {
    return 'success';
  }
  return isWarning ? 'warning' : 'error';
};
