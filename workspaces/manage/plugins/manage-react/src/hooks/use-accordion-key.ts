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
import { KindStarred, useCurrentKind } from '../components/CurrentKindProvider';

/**
 * Get the accordion key for the current view (combined, not combined, starred)
 *
 * @param key - A key for the kind of accordion, e.g. a feature or plugin name
 * @param uniquePerKind - If true, the key will be unique per kind, defaults to false
 *
 * @public
 */
export function useAccordionKey(key: string, uniquePerKind?: boolean): string {
  const kind = useCurrentKind();

  if (kind === KindStarred) {
    return `$manage-${key}-$starred`;
  } else if (!kind) {
    return `$manage-${key}-$combined`;
  }

  if (uniquePerKind) {
    return `$manage-${key}-${kind}`;
  }
  return `$manage-${key}-$kind`;
}
