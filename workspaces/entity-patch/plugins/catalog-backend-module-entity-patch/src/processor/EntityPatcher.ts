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
import { cloneDeep, set } from 'lodash';
import nunjucks from 'nunjucks';
import {
  Entity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { LoggerService } from '@backstage/backend-plugin-api';
import { evaluateFilterPredicate } from '@backstage/filter-predicates';
import {
  RelationPair,
  PatchConfig,
  isMappingTemplate,
  RELATION_KEY_PREFIX,
  CONFIG_KEYS,
} from '@backstage-community/plugin-entity-patch-common';
import { EntityRelationSpec } from '@backstage/plugin-catalog-node';

/** Raw stored patch data: patchName → { fieldName → value } */
export type PatchDataMap = Record<string, Record<string, unknown>>;

type FieldResolver = { source: 'field'; fieldName: string };
type TemplateResolver = {
  source: 'template';
  render: (values: Record<string, unknown>) => string;
};
type ValueResolver = FieldResolver | TemplateResolver;

/**
 * A pre-processed patch operation built once at processor construction time.
 * Contains all static config needed to apply or emit a patch mapping at runtime.
 *
 * `matchesEntity` is pre-baked from the raw filter at construction time:
 * no filter → always returns `true`; otherwise delegates to `evaluateFilterPredicate`.
 */
type ScalarPatchMapping = {
  kind: 'scalar';
  patchName: string;
  matchesEntity: (entity: Entity) => boolean;
  entityPath: string;
  resolver: ValueResolver;
};

type RelationPatchMapping = {
  kind: 'relation';
  patchName: string;
  matchesEntity: (entity: Entity) => boolean;
  entityPath: string;
  pair: RelationPair;
  resolver: ValueResolver;
};

export interface EntityPatcherOptions {
  patchConfigs: PatchConfig[];
  relationPairs: Map<string, RelationPair>;
  nunjucksEnv: nunjucks.Environment;
  logger: LoggerService;
}

/**
 * Applies patch configurations to entities. Built once at processor construction
 * from the static config, then used on every entity processing call.
 *
 * Both methods are pure data transforms — no I/O or emit callbacks.
 * The processor owns all external concerns (HTTP fetch, catalog emit).
 */
export class EntityPatcher {
  private readonly scalarPatchMappings: ScalarPatchMapping[];
  private readonly relationPatchMappings: RelationPatchMapping[];
  private readonly logger: LoggerService;

  static fromConfigs({
    patchConfigs,
    relationPairs,
    nunjucksEnv,
    logger,
  }: EntityPatcherOptions): EntityPatcher {
    const { scalars, relations } = buildEntries({
      patchConfigs,
      relationPairs,
      nunjucksEnv,
      logger,
    });
    return new EntityPatcher(scalars, relations, logger);
  }

  constructor(
    scalarPatchMappings: ScalarPatchMapping[],
    relationPatchMappings: RelationPatchMapping[],
    logger: LoggerService,
  ) {
    this.scalarPatchMappings = scalarPatchMappings;
    this.relationPatchMappings = relationPatchMappings;
    this.logger = logger;
  }

  /**
   * Returns true when at least one mapping's filter predicate matches the entity.
   * Used to short-circuit before fetching patch data.
   */
  hasMatchingEntries(entity: Entity): boolean {
    return this.hasScalarEntries(entity) || this.hasRelationEntries(entity);
  }
  /**
   * Returns true when at least one scalar mapping's filter predicate matches the entity.
   * Used to short-circuit before fetching patch data.
   */
  hasScalarEntries(entity: Entity): boolean {
    return this.scalarPatchMappings.some(e => e.matchesEntity(entity));
  }
  /**
   * Returns true when at least one relation mapping's filter predicate matches the entity.
   * Used to short-circuit before fetching patch data.
   */
  hasRelationEntries(entity: Entity): boolean {
    return this.relationPatchMappings.some(e => e.matchesEntity(entity));
  }

  /**
   * Applies all matching scalar mappings onto a deep-cloned copy of the entity.
   */
  applyScalars(entity: Entity, patchData: PatchDataMap): Entity {
    const result = cloneDeep(entity);

    this.scalarPatchMappings
      .filter(relevantMappings(entity, patchData))
      .forEach(e => {
        const value = resolveValue(e.resolver, patchData[e.patchName]);
        if (value !== undefined && value !== null && value !== '') {
          set(result, e.entityPath, value);
        }
      });

    return result;
  }

  /**
   * Resolves all matching relation mappings into a flat list of `{ type, source, target }`
   * objects — both forward and reverse directions — ready to pass directly to
   * `emit(processingResult.relation(...))`.
   *
   * Logs warnings for unresolvable entity refs and excludes them from the returned list.
   */
  resolveRelations(
    entity: Entity,
    patchData: PatchDataMap,
  ): EntityRelationSpec[] {
    const sourceRef = stringifyEntityRef(entity);
    const source = parseEntityRef(sourceRef);

    return this.relationPatchMappings
      .filter(relevantMappings(entity, patchData))
      .flatMap(mapping => {
        const targetRefs = resolveTargetRefs(
          mapping.resolver,
          patchData[mapping.patchName],
        );

        return targetRefs.flatMap(targetRef => {
          if (!isValidEntityRef(targetRef)) {
            this.logger.warn(
              `Could not parse entity ref "${targetRef}" in patch "${mapping.patchName}" mapping "${mapping.entityPath}" — skipping`,
              { entityRef: sourceRef },
            );
            return [];
          }
          const target = parseEntityRef(targetRef);
          return [
            { type: mapping.pair.forward, source, target },
            { type: mapping.pair.reverse, source: target, target: source },
          ];
        });
      });
  }
}

/**
 * Creates a predicate function that checks if a mapping entry is relevant for a given entity and patch data.
 *
 * @param entity
 * @param patchData
 * @returns A predicate function that returns true if the mapping entry is relevant for the given entity and patch data.
 */
function relevantMappings(
  entity: Entity,
  patchData: PatchDataMap,
): (value: ScalarPatchMapping | RelationPatchMapping) => boolean {
  return e => e.matchesEntity(entity) && !!patchData[e.patchName];
}

function buildValueResolver(
  fieldOrTemplate: string,
  nunjucksEnv: nunjucks.Environment,
): ValueResolver {
  if (isMappingTemplate(fieldOrTemplate)) {
    const compiled = nunjucks.compile(fieldOrTemplate, nunjucksEnv);
    return {
      source: 'template',
      render: values => compiled.render(values).trim(),
    };
  }
  return { source: 'field', fieldName: fieldOrTemplate };
}

function resolveValue(
  resolver: ValueResolver,
  savedValues: Record<string, unknown>,
): unknown {
  if (resolver.source === 'template') return resolver.render(savedValues);
  return savedValues[resolver.fieldName];
}

function isValidEntityRef(ref: string): boolean {
  try {
    parseEntityRef(ref);
    return true;
  } catch {
    return false;
  }
}

function resolveTargetRefs(
  resolver: ValueResolver,
  savedValues: Record<string, unknown>,
): string[] {
  const rawValue = resolveValue(resolver, savedValues);
  if (rawValue === undefined || rawValue === null || rawValue === '') return [];
  return (Array.isArray(rawValue) ? rawValue : [rawValue]).filter(
    (ref): ref is string => typeof ref === 'string',
  );
}

function buildEntries({
  patchConfigs,
  relationPairs,
  nunjucksEnv,
  logger,
}: EntityPatcherOptions): {
  scalars: ScalarPatchMapping[];
  relations: RelationPatchMapping[];
} {
  const scalars: ScalarPatchMapping[] = [];
  const relations: RelationPatchMapping[] = [];

  for (const { name: patchName, filter, mapping } of patchConfigs) {
    const matchesEntity = filter
      ? (entity: Entity) => evaluateFilterPredicate(filter, entity)
      : () => true;

    for (const [entityPath, fieldOrTemplate] of Object.entries(mapping)) {
      const resolver = buildValueResolver(fieldOrTemplate, nunjucksEnv);

      if (entityPath.startsWith(RELATION_KEY_PREFIX)) {
        const relType = entityPath.slice(RELATION_KEY_PREFIX.length);
        const pair = relationPairs.get(relType);
        if (!pair) {
          logger.warn(
            `Patch "${patchName}" mapping "${RELATION_KEY_PREFIX}${relType}" has no matching entry in ${CONFIG_KEYS.RELATIONS} — skipping`,
          );
          continue;
        }
        relations.push({
          kind: 'relation',
          patchName,
          matchesEntity,
          entityPath,
          pair,
          resolver,
        });
      } else {
        scalars.push({
          kind: 'scalar',
          patchName,
          matchesEntity,
          entityPath,
          resolver,
        });
      }
    }
  }

  return { scalars, relations };
}
