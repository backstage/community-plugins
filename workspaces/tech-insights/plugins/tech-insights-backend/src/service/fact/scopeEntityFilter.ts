/*
 * Copyright 2026 The Backstage Authors
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

import { CompoundEntityRef } from '@backstage/catalog-model';
import { FactRetriever } from '@backstage-community/plugin-tech-insights-node';

type EntityFilter = NonNullable<FactRetriever['entityFilter']>;
type EntityFilterClause = Record<string, string | symbol | (string | symbol)[]>;

/**
 * Narrows a fact retriever's entity filter down to a single entity.
 *
 * Each clause keeps its own conditions (e.g. `spec.type` or an annotation
 * check), so the catalog still decides whether the entity matches them. A
 * clause that already restricts kind, namespace or name to other values is
 * dropped, so a retriever declared for components does not run for a system
 * that happens to share the name.
 *
 * @returns the narrowed filter, or `undefined` if no clause can match the entity
 */
export function scopeEntityFilter(
  entityFilter: FactRetriever['entityFilter'],
  entityRef: CompoundEntityRef,
): EntityFilter | undefined {
  const identity: Record<string, string> = {
    kind: entityRef.kind,
    'metadata.namespace': entityRef.namespace,
    'metadata.name': entityRef.name,
  };

  const clauses = toClauses(entityFilter).flatMap(clause => {
    const scoped: EntityFilterClause = {};
    for (const [key, value] of Object.entries(clause)) {
      const identityKey = Object.keys(identity).find(
        it => it === key.toLocaleLowerCase('en-US'),
      );
      if (!identityKey) {
        scoped[key] = value;
      } else if (!matches(value, identity[identityKey])) {
        return [];
      }
    }
    return [{ ...scoped, ...identity }];
  });

  return clauses.length > 0 ? clauses : undefined;
}

function toClauses(
  entityFilter: FactRetriever['entityFilter'],
): EntityFilterClause[] {
  if (!entityFilter) return [{}];
  if (!Array.isArray(entityFilter)) return [entityFilter];
  return entityFilter.length > 0 ? entityFilter : [{}];
}

/** Catalog filters compare values case-insensitively; symbols mean "exists". */
function matches(
  value: string | symbol | (string | symbol)[],
  expected: string,
): boolean {
  return [value]
    .flat()
    .some(
      it =>
        typeof it === 'symbol' ||
        it.toLocaleLowerCase('en-US') === expected.toLocaleLowerCase('en-US'),
    );
}
