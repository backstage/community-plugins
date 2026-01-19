/*
 * Copyright 2021 The Backstage Authors
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

import { Config } from '@backstage/config';
import { isError } from '@backstage/errors';
import { FactResponse } from '@backstage-community/plugin-tech-insights-common';
import {
  CheckValidationResponse,
  FactChecker,
  FlatTechInsightFact,
  TechInsightCheckRegistry,
  TechInsightsStore,
} from '@backstage-community/plugin-tech-insights-node';
import Ajv, { SchemaObject } from 'ajv';
import {
  Engine,
  EngineResult,
  Operator,
  TopLevelCondition,
} from 'json-rules-engine';
import { flatten, pick } from 'lodash';
import { JSON_RULE_ENGINE_CHECK_TYPE } from '../constants';
import { JsonRuleBooleanCheckResult, TechInsightJsonRuleCheck } from '../types';
import { DefaultCheckRegistry } from './CheckRegistry';
import { readChecksFromConfig } from './config';
import * as validationSchema from './validation-schema.json';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { get } from 'lodash';
import { CatalogService } from '@backstage/plugin-catalog-node';

const noopEvent = {
  type: 'noop',
};

/**
 * @public
 * Should actually be at-internal
 *
 * Constructor options for JsonRulesEngineFactChecker
 */
export type JsonRulesEngineFactCheckerOptions = {
  checks: TechInsightJsonRuleCheck[];
  repository: TechInsightsStore;
  logger: LoggerService;
  checkRegistry?: TechInsightCheckRegistry<TechInsightJsonRuleCheck>;
  operators?: Operator[];
  catalog?: CatalogService;
  auth?: AuthService;
};

/**
 * @public
 * Should actually be at-internal
 *
 * FactChecker implementation using json-rules-engine
 */
export class JsonRulesEngineFactChecker
  implements FactChecker<TechInsightJsonRuleCheck, JsonRuleBooleanCheckResult>
{
  private readonly checkRegistry: TechInsightCheckRegistry<TechInsightJsonRuleCheck>;
  private repository: TechInsightsStore;
  private readonly logger: LoggerService;
  private readonly validationSchema: SchemaObject;
  private readonly operators: Operator[];
  private readonly catalog?: CatalogService;
  private readonly auth?: AuthService;

  constructor(options: JsonRulesEngineFactCheckerOptions) {
    const {
      checks,
      repository,
      logger,
      checkRegistry,
      operators,
      catalog,
      auth,
    } = options;

    this.repository = repository;
    this.logger = logger;
    this.operators = operators || [];
    this.catalog = catalog;
    this.auth = auth;
    this.validationSchema = JSON.parse(JSON.stringify(validationSchema));

    this.operators.forEach(op => {
      this.validationSchema.definitions.condition.properties.operator.anyOf.push(
        { const: op.name },
      );
    });

    checks.forEach(check => this.validate(check));
    this.checkRegistry =
      checkRegistry ??
      new DefaultCheckRegistry<TechInsightJsonRuleCheck>(checks);
  }

  /**
   * Evaluates whether an entity matches the given filter criteria.
   * Supports both single filter objects and arrays of filter objects.
   * When multiple filter objects are provided, uses OR logic (entity matches if ANY filter matches).
   *
   * @param entity - The catalog entity to evaluate
   * @param filter - Single filter object or array of filter objects to match against
   * @returns true if the entity matches the filter criteria, false otherwise
   */
  private matchesFilter(
    entity: Entity,
    filter:
      | Record<string, string | symbol | (string | symbol)[]>
      | Record<string, string | symbol | (string | symbol)[]>[],
  ): boolean {
    const filters = Array.isArray(filter) ? filter : [filter];

    // Match if ANY of the filters match (OR logic between filter objects)
    return filters.some(f => this.matchesSingleFilter(entity, f));
  }

  /**
   * Evaluates whether an entity matches a single filter object.
   * All key-value pairs in the filter must match (AND logic).
   * Supports nested property access using lodash.get (e.g., "metadata.name").
   *
   * @param entity - The catalog entity to evaluate
   * @param filter - Filter object with key-value pairs that must all match
   * @returns true if all filter conditions match, false otherwise
   */
  private matchesSingleFilter(
    entity: Entity,
    filter: Record<string, string | symbol | (string | symbol)[]>,
  ): boolean {
    // All conditions in a single filter must match (AND logic within a filter)
    return Object.entries(filter).every(([key, value]) => {
      const entityValue = get(entity, key);

      // Handle undefined/null entity values - if the property doesn't exist on the entity,
      // the filter condition cannot be satisfied, so return false
      if (entityValue === undefined || entityValue === null) {
        this.logger.warn(`Entity property '${key}' is undefined or null`);
        return false;
      }

      // Handle array values (OR logic within array)
      // If the filter value is an array, the entity matches if ANY value in the array matches
      if (Array.isArray(value)) {
        return value.some(v => this.compareValues(entityValue, v));
      }

      // Single value comparison
      return this.compareValues(entityValue, value);
    });
  }

  /**
   * Helper method to compare entity property values against filter values.
   * Implements case-insensitive string comparison for better user experience,
   * as entity kinds, types, and lifecycles are typically case-insensitive.
   *
   * @param entityValue - The actual value from the entity property
   * @param filterValue - The expected value from the filter condition
   * @returns true if values match according to the comparison rules, false otherwise
   */
  private compareValues(
    entityValue: any,
    filterValue: string | symbol,
  ): boolean {
    // If entityValue is an array, treat it as "contains" semantics
    if (Array.isArray(entityValue)) {
      return entityValue.some(ev => this.compareValues(ev, filterValue));
    }

    // Handle string comparison case-insensitively for kind, type, lifecycle, etc.
    // This provides a better user experience as these values are typically case-insensitive
    if (typeof entityValue === 'string' && typeof filterValue === 'string') {
      return entityValue.toLowerCase() === filterValue.toLowerCase();
    }

    // Handle symbol comparison (less common but supported for completeness)
    if (typeof filterValue === 'symbol') {
      return entityValue === filterValue;
    }

    // Default to strict equality for all other types (numbers, booleans, etc.)
    return entityValue === filterValue;
  }

  /**
   * Fetches an entity from the catalog to enable filter evaluation.
   * This is required to access entity metadata (kind, type, lifecycle, etc.) for filtering.
   *
   * @param entityRef - The entity reference string (e.g., "component:default/my-service")
   * @returns The entity object if found and catalogApi is available, undefined otherwise
   */
  private async fetchEntityFromCatalog(
    entityRef: string,
  ): Promise<Entity | undefined> {
    // If catalogApi wasn't provided in the constructor, filtering cannot be performed
    if (!this.catalog) {
      this.logger.debug(
        'CatalogApi not available, skipping entity fetch for filtering',
      );
      return undefined;
    }

    if (!this.auth) {
      this.logger.warn(
        'AuthService not available, skipping entity fetch for filtering',
      );
      return undefined;
    }

    try {
      const credentials = await this.auth.getOwnServiceCredentials();

      const entity = await this.catalog.getEntityByRef(entityRef, {
        credentials,
      });

      if (!entity) {
        this.logger.warn(`Entity '${entityRef}' not found in catalog`);
      }
      return entity;
    } catch (e) {
      // Log but don't throw - we'll fall back to running all checks without filtering
      this.logger.warn(
        `Failed to fetch entity ${entityRef} from catalog: ${e}`,
      );
      return undefined;
    }
  }

  async runChecks(
    entity: string,
    checks?: string[],
  ): Promise<JsonRuleBooleanCheckResult[]> {
    const engine = new Engine();
    this.operators.forEach(op => {
      engine.addOperator(op);
    });

    const techInsightChecks = checks
      ? await this.checkRegistry.getAll(checks)
      : await this.checkRegistry.list();

    // Identify checks that have filter criteria defined
    // Only these checks require entity fetching from the catalog
    const checksWithFilters = techInsightChecks.filter(check => check.filter);

    // Start with all checks; will be filtered down if entity filtering is applicable
    let filteredChecks = techInsightChecks;

    // Only fetch entity from catalog if there are checks with filter criteria
    // This optimization avoids unnecessary catalog API calls
    if (checksWithFilters.length > 0) {
      const catalogEntity = await this.fetchEntityFromCatalog(entity);
      if (catalogEntity) {
        const initialCount = filteredChecks.length;

        // Apply filter criteria to determine which checks should run for this entity
        // Checks without filters always run; checks with filters only run if they match
        filteredChecks = filteredChecks.filter(check => {
          // Always include checks that don't have filter criteria
          if (!check.filter) {
            return true;
          }

          // Evaluate if the entity matches the check's filter criteria
          const matches = this.matchesFilter(catalogEntity, check.filter);
          return matches;
        });

        // Log how many checks were filtered out for observability
        // This helps users understand why certain checks didn't run
        const skippedCount = initialCount - filteredChecks.length;
        if (skippedCount > 0) {
          this.logger.info(
            `Filtered out ${skippedCount} check(s) based on entity criteria`,
          );
        }
      } else {
        // If we couldn't fetch the entity, run all checks as a fallback
        // This ensures checks still run even if catalog is unavailable
        this.logger.warn(
          'Could not fetch entity from catalog for filtering - running all checks',
        );
      }
    }

    const factRetrieversIds = filteredChecks.flatMap(it => it.factIds);
    const facts = await this.repository.getLatestFactsByIds(
      factRetrieversIds,
      entity,
    );

    const schemas = await this.repository.getLatestSchemas(factRetrieversIds);

    // get list of available fact names
    const factNames = flatten(schemas.map(schema => Object.keys(schema)));

    const factValues = Object.values(facts).reduce(
      (acc, it) => ({ ...acc, ...it.facts }),
      {} as FlatTechInsightFact,
    );

    filteredChecks.forEach(techInsightCheck => {
      const rule = techInsightCheck.rule;
      rule.name = techInsightCheck.id;

      // Only run checks that have all the facts available:
      const usedFacts = this.retrieveIndividualFactReferences(
        techInsightCheck.rule.conditions,
      );

      // check if all facts are known - factNames are correct
      const allFactsNamesArePresent = usedFacts.every(factId =>
        factNames.includes(factId),
      );
      if (!allFactsNamesArePresent) {
        // invalid facts - not included in factNames
        throw new Error(
          `Not all facts are defined: ${usedFacts.filter(
            usedFact => !factNames.includes(usedFact),
          )}`,
        );
      }

      // Checks if all facts are present in the factValues
      const hasFacts = usedFacts.every(factId =>
        factValues.hasOwnProperty(factId),
      );
      if (hasFacts) {
        engine.addRule({ ...techInsightCheck.rule, event: noopEvent });
      } else {
        this.logger.debug(
          `Skipping ${
            rule.name
          } due to missing facts: ${techInsightCheck.factIds
            .filter(factId => !facts[factId])
            .join(', ')}`,
        );
      }
    });

    try {
      const results = await engine.run(factValues);
      return await this.ruleEngineResultsToCheckResponse(
        results,
        techInsightChecks,
        Object.values(facts),
      );
    } catch (e) {
      if (isError(e)) {
        throw new Error(`Failed to run rules engine, ${e.message}`, {
          cause: e,
        });
      }
      throw e;
    }
  }

  async validate(
    check: TechInsightJsonRuleCheck,
  ): Promise<CheckValidationResponse> {
    const ajv = new Ajv({ verbose: true });
    const validator = ajv.compile(this.validationSchema);
    const isValidToSchema = validator(check.rule);
    if (check.type !== JSON_RULE_ENGINE_CHECK_TYPE) {
      const msg = `Only ${JSON_RULE_ENGINE_CHECK_TYPE} checks can be registered to this fact checker`;
      this.logger.warn(msg);
      return {
        valid: false,
        message: msg,
      };
    }
    if (!isValidToSchema) {
      const msg = 'Failed to to validate conditions against JSON schema';
      this.logger.warn(
        'Failed to to validate conditions against JSON schema',
        new Error(JSON.stringify(validator.errors)),
      );
      return {
        valid: false,
        message: msg,
        errors: validator.errors ? validator.errors : undefined,
      };
    }

    const existingSchemas = await this.repository.getLatestSchemas(
      check.factIds,
    );
    const references = this.retrieveIndividualFactReferences(
      check.rule.conditions,
    );
    const results = references.map(ref => ({
      ref,
      result: existingSchemas.some(schema => schema.hasOwnProperty(ref)),
    }));
    const failedReferences = results.filter(it => !it.result);
    failedReferences.forEach(it => {
      this.logger.warn(
        `Validation failed for check ${check.name}. Reference to value ${
          it.ref
        } does not exists in referred fact schemas: ${check.factIds.join(',')}`,
      );
    });
    const valid = failedReferences.length === 0;
    return {
      valid,
      ...(!valid
        ? {
            message: `Check is referencing missing values from fact schemas: ${failedReferences
              .map(it => it.ref)
              .join(',')}`,
          }
        : {}),
    };
  }

  getChecks(): Promise<TechInsightJsonRuleCheck[]> {
    return this.checkRegistry.list();
  }

  private retrieveIndividualFactReferences(
    condition: TopLevelCondition | { fact: string },
  ): string[] {
    let results: string[] = [];
    if ('all' in condition) {
      results = results.concat(
        condition.all.flatMap(con =>
          this.retrieveIndividualFactReferences(con),
        ),
      );
    } else if ('any' in condition) {
      results = results.concat(
        condition.any.flatMap(con =>
          this.retrieveIndividualFactReferences(con),
        ),
      );
    } else if ('not' in condition) {
      results = results.concat(
        this.retrieveIndividualFactReferences(condition.not),
      );
    } else if ('condition' in condition) {
      // ignore the ConditionReference type
    } else {
      results.push(condition.fact);
    }
    return results;
  }

  private async ruleEngineResultsToCheckResponse(
    results: EngineResult,
    techInsightChecks: TechInsightJsonRuleCheck[],
    facts: FlatTechInsightFact[],
  ) {
    return await Promise.all(
      [
        ...(results.results && results.results),
        ...(results.failureResults && results.failureResults),
      ].map(async result => {
        const techInsightCheck = techInsightChecks.find(
          check => check.id === result.name,
        );
        if (!techInsightCheck) {
          // This should never happen, we just constructed these based on each other
          throw new Error(
            `Failed to determine tech insight check with id ${result.name}. Discrepancy between ran rule engine and configured checks.`,
          );
        }
        const factResponse = await this.constructFactInformationResponse(
          facts,
          techInsightCheck,
        );
        return {
          facts: factResponse,
          result: result.result,
          check: JsonRulesEngineFactChecker.constructCheckResponse(
            techInsightCheck,
            result,
          ),
        };
      }),
    );
  }

  private static constructCheckResponse(
    techInsightCheck: TechInsightJsonRuleCheck,
    result: any,
  ) {
    const returnable = {
      id: techInsightCheck.id,
      type: techInsightCheck.type,
      name: techInsightCheck.name,
      description: techInsightCheck.description,
      factIds: techInsightCheck.factIds,
      metadata: result.result
        ? { ...techInsightCheck.metadata, ...techInsightCheck.successMetadata }
        : { ...techInsightCheck.metadata, ...techInsightCheck.failureMetadata },
      rule: { conditions: {} },
      links: techInsightCheck.links,
    };

    if ('toJSON' in result) {
      // Results from json-rules-engine serialize "wrong" since the objects are creating their own serialization implementations.
      // 'toJSON' should always be present in the result object but it is missing from the types.
      // Parsing the stringified representation into a plain object here to be able to serialize it later
      // along with other items present in the returned response.
      const rule = JSON.parse(result.toJSON());
      return { ...returnable, rule: pick(rule, ['conditions']) };
    }
    return returnable;
  }

  private async constructFactInformationResponse(
    facts: FlatTechInsightFact[],
    techInsightCheck: TechInsightJsonRuleCheck,
  ): Promise<FactResponse> {
    const factSchemas = await this.repository.getLatestSchemas(
      techInsightCheck.factIds,
    );
    const schemas = factSchemas.reduce(
      (acc, schema) => ({ ...acc, ...schema }),
      {},
    );
    const individualFacts = this.retrieveIndividualFactReferences(
      techInsightCheck.rule.conditions,
    );
    const factValues = facts
      .filter(factContainer =>
        techInsightCheck.factIds.includes(factContainer.id),
      )
      .reduce(
        (acc, factContainer) => ({
          ...acc,
          ...pick(factContainer.facts, individualFacts),
        }),
        {},
      );
    return Object.entries(factValues).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          value,
          ...schemas[key],
        },
      };
    }, {});
  }
}

/**
 * @public
 *
 * Constructor options for JsonRulesEngineFactCheckerFactory
 *
 * Implementation of checkRegistry is optional.
 * If there is a need to use persistent storage for checks, it is recommended to inject a storage implementation here.
 * Otherwise, an in-memory option is instantiated and used.
 */
export type JsonRulesEngineFactCheckerFactoryOptions = {
  checks: TechInsightJsonRuleCheck[];
  logger: LoggerService;
  checkRegistry?: TechInsightCheckRegistry<TechInsightJsonRuleCheck>;
  operators?: Operator[];
  catalog?: CatalogService;
  auth?: AuthService;
};

/**
 * @public
 *
 * Factory to construct JsonRulesEngineFactChecker
 * Can be constructed with optional implementation of CheckInsightCheckRegistry if needed.
 * Otherwise, defaults to using in-memory CheckRegistry.
 */
export class JsonRulesEngineFactCheckerFactory {
  private readonly checks: TechInsightJsonRuleCheck[];
  private readonly logger: LoggerService;
  private readonly checkRegistry?: TechInsightCheckRegistry<TechInsightJsonRuleCheck>;
  private readonly operators?: Operator[];
  private readonly catalog?: CatalogService;
  private readonly auth?: AuthService;

  static fromConfig(
    config: Config,
    options: Omit<JsonRulesEngineFactCheckerFactoryOptions, 'checks'>,
  ): JsonRulesEngineFactCheckerFactory {
    const checks = readChecksFromConfig(config, { logger: options.logger });

    return new JsonRulesEngineFactCheckerFactory({
      ...options,
      checks,
    });
  }

  constructor(options: JsonRulesEngineFactCheckerFactoryOptions) {
    this.logger = options.logger;
    this.checks = options.checks;
    this.checkRegistry = options.checkRegistry;
    this.operators = options.operators;
    this.catalog = options.catalog;
    this.auth = options.auth;
  }

  /**
   * @param repository - Implementation of TechInsightsStore. Used by the returned JsonRulesEngineFactChecker
   *                     to retrieve fact and fact schema data
   * @returns JsonRulesEngineFactChecker implementation
   */
  construct(repository: TechInsightsStore) {
    return new JsonRulesEngineFactChecker({
      checks: this.checks,
      logger: this.logger,
      checkRegistry: this.checkRegistry,
      repository,
      operators: this.operators,
      catalog: this.catalog,
      auth: this.auth,
    });
  }
}
