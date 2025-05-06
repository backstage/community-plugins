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
import { ObjectReference } from '@backstage-community/plugin-kiali-common/types';

export const compareObjectReference = (
  a: ObjectReference,
  b: ObjectReference,
): number => {
  const cmpObjectType =
    a.objectGVK.Kind.localeCompare(b.objectGVK.Kind) ||
    a.objectGVK.Group.localeCompare(b.objectGVK.Group);
  if (cmpObjectType !== 0) {
    return cmpObjectType;
  }
  const cmpName = a.name.localeCompare(b.name);
  if (cmpName !== 0) {
    return cmpName;
  }

  return a.namespace.localeCompare(b.namespace);
};

// It assumes that is sorted
export const compareObjectReferences = (
  a: ObjectReference[],
  b: ObjectReference[],
): number => {
  if (a.length === 0 && b.length === 0) {
    return 0;
  }
  if (a.length === 0 && b.length > 0) {
    return -1;
  }
  if (a.length > 0 && b.length === 0) {
    return 1;
  }
  if (a.length !== b.length) {
    return a.length - b.length;
  }
  for (let i = 0; i < a.length; i++) {
    const cmp = compareObjectReference(a[i], b[i]);
    if (cmp !== 0) {
      return cmp;
    }
  }
  return 0;
};

// Remove duplicates and sort references
export const sortIstioReferences = (
  unsorted: ObjectReference[],
  isAscending: boolean,
): ObjectReference[] => {
  const unique = unsorted.filter(
    (item, index) => unsorted.indexOf(item) === index,
  );
  return unique.sort((a, b) => {
    return isAscending
      ? compareObjectReference(a, b)
      : compareObjectReference(b, a);
  });
};
