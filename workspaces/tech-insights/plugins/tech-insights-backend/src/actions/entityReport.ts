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
import {
  BackstageCredentials,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { InputError, NotFoundError } from '@backstage/errors';
import { CatalogService } from '@backstage/plugin-catalog-node';
import {
  Check,
  CheckResult,
  techInsightsCheckReadPermission,
  techInsightsCheckUpdatePermission,
  techInsightsFactRetrieverReadPermission,
} from '@backstage-community/plugin-tech-insights-common';
import { FactChecker } from '@backstage-community/plugin-tech-insights-node';
import get from 'lodash/get';
import { authorize } from './utils';

/**
 * The dependencies needed to build a report for a single entity.
 */
export type EntityReportDeps = {
  catalog: CatalogService;
  factChecker: FactChecker<Check, CheckResult>;
  permissions: PermissionsService;
};

const matchesValue = (value: unknown, expected: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.some(item => matchesValue(item, expected));
  }
  if (Array.isArray(expected)) {
    return expected.some(item => matchesValue(value, item));
  }
  if (typeof value === 'string' && typeof expected === 'string') {
    return value.toLowerCase() === expected.toLowerCase();
  }
  return value === expected;
};

const matchesFilter = (
  entity: Entity,
  filter: Record<string, unknown> | Record<string, unknown>[],
) =>
  (Array.isArray(filter) ? filter : [filter]).some(single =>
    Object.entries(single).every(([key, expected]) =>
      matchesValue(get(entity, key), expected),
    ),
  );

/**
 * Loads an entity and runs every check that applies to it.
 */
export const getEntityReport = async (
  { catalog, factChecker, permissions }: EntityReportDeps,
  input: { kind: string; namespace: string; name: string },
  credentials: BackstageCredentials,
) => {
  if (!input.kind.trim() || !input.name.trim()) {
    throw new InputError('kind and name must be non-empty strings');
  }

  await authorize(permissions, credentials, techInsightsCheckReadPermission);
  await authorize(
    permissions,
    credentials,
    techInsightsFactRetrieverReadPermission,
  );
  // runChecks executes checks, so it also requires the check-run permission
  await authorize(permissions, credentials, techInsightsCheckUpdatePermission);

  const entityRef = stringifyEntityRef(input);
  const entity = await catalog.getEntityByRef(entityRef, { credentials });
  if (!entity) {
    throw new NotFoundError(`Entity '${entityRef}' not found`);
  }

  const checks = await factChecker.getChecks();
  const applicableChecks = checks.filter(
    check => !check.filter || matchesFilter(entity, check.filter),
  );
  const results = await factChecker.runChecks(
    entityRef,
    applicableChecks.map(check => check.id),
  );

  return {
    entityRef,
    entity,
    applicableChecks,
    results,
    resultById: new Map(results.map(result => [result.check.id, result])),
  };
};

export const formatResult = (value: unknown): 'PASS' | 'FAIL' | 'N/A' => {
  if (value === true) {
    return 'PASS';
  }
  if (value === false) {
    return 'FAIL';
  }
  return 'N/A';
};
