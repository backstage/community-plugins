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
import pluralize from 'pluralize';

import type { KindStarredType } from '../components/CurrentKindProvider';

/**
 * Ensure a value is an array
 *
 * @public
 */
export function arrayify<T>(t: T | T[] | Iterable<T> | undefined): T[] {
  if (Array.isArray(t)) {
    return t;
  }
  if (isIterable(t)) {
    return Array.from(t);
  }
  return typeof t === 'undefined' || t === null ? [] : [t];
}

function isIterable(v: any): v is Iterable<any> {
  return typeof v !== 'string' && typeof v?.[Symbol.iterator] === 'function';
}

export function kindToOpaqueString(kind: string | KindStarredType): string {
  return typeof kind === 'string' ? kind : ` symbol$$${kind.description} `;
}

export function joinKinds(kinds: (string | KindStarredType)[]): string {
  return kinds.map(k => kindToOpaqueString(k)).join(' $ ');
}

/**
 * Returns the plural of a kind
 *
 * @public
 */
export function pluralizeKind(kind: string) {
  return pluralize(kind);
}
