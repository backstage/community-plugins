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
import { PropsWithChildren, createContext, useContext, useMemo } from 'react';

import useAsync from 'react-use/lib/useAsync';

import { useApi } from '@backstage/core-plugin-api';
import {
  Entity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  CheckResultRenderer,
  techInsightsApiRef,
} from '@backstage-community/plugin-tech-insights';
import { Check } from '@backstage-community/plugin-tech-insights-common/client';
import {
  BulkCheckResponse,
  CheckResult,
} from '@backstage-community/plugin-tech-insights-common';
import { useManagedEntities } from '@backstage-community/plugin-manage-react';

import { stringifyCheck } from '../../utils';
import { manageTechInsightsApiRef } from '../../api/api';

/**
 * @internal
 */
export interface ManageTechInsightsContext {
  allChecks: Check[];
  bulkCheckResponse: BulkCheckResponse | undefined;
  renderers: Map<string, CheckResultRenderer>;
}

const ctx = createContext<ManageTechInsightsContext>(undefined as any);

const { Provider } = ctx;

/** @public */
export function ManageProviderTechInsights(props: PropsWithChildren<{}>) {
  const techInsightsApi = useApi(techInsightsApiRef);
  const ownedEntities = useManagedEntities();

  const asyncState = useAsync(async () => {
    const entityRefs = ownedEntities.map(entity =>
      parseEntityRef(stringifyEntityRef(entity)),
    );

    const [allChecks, bulkCheckResponse] = await Promise.all([
      techInsightsApi.getAllChecks(),
      techInsightsApi.runBulkChecks(entityRefs),
    ]);

    return { allChecks, bulkCheckResponse };
  }, [ownedEntities, techInsightsApi]);

  const state: ManageTechInsightsContext = useMemo(() => {
    const allChecks = asyncState.value?.allChecks ?? [];
    const bulkCheckResponse = asyncState.value?.bulkCheckResponse;

    const allRenderers = techInsightsApi.getCheckResultRenderers(
      allChecks.map(check => check.type),
    );
    const renderers = new Map(
      allRenderers.map(renderer => [renderer.type, renderer]),
    );

    return {
      allChecks,
      bulkCheckResponse,
      renderers,
    };
  }, [asyncState.value, techInsightsApi]);

  return <Provider value={state} children={props.children} />;
}

/**
 * @internal
 */
export function useManageTechInsights(checkFilter?: (check: Check) => boolean) {
  const manageTechInsightsApi = useApi(manageTechInsightsApiRef);
  const context = useContext(ctx);

  const filter = checkFilter ?? manageTechInsightsApi.checkFilter;

  return useMemo(() => {
    return {
      ...context,
      allChecks: context.allChecks.filter(filter),
      bulkCheckResponse: (context.bulkCheckResponse ?? []).map(response => ({
        ...response,
        results: response.results.filter(res => filter(res.check)),
      })),
    };
  }, [context, filter]);
}

/**
 * @internal
 */
export type ResponsesForCheck = Array<{
  entity: string;
  result: CheckResult;
  renderer: CheckResultRenderer | undefined;
  failed: boolean;
}>;

/**
 * @internal
 */
export interface DecoratedCheck {
  uniq: string;
  renderer: CheckResultRenderer | undefined;
  check: Check;
}

/**
 * @internal
 */
export interface UseManageTechInsightsForEntitiesResult {
  checks: DecoratedCheck[];
  responses: BulkCheckResponse;
  responsesForCheck: Map<string, ResponsesForCheck>;
}

/**
 * @internal
 */
export function useManageTechInsightsForEntities(
  entities: Entity[],
  checkFilter?: (check: Check) => boolean,
): UseManageTechInsightsForEntitiesResult {
  const { allChecks, bulkCheckResponse, renderers } =
    useManageTechInsights(checkFilter);

  return useMemo((): UseManageTechInsightsForEntitiesResult => {
    const entitySet = new Set(
      entities.map(entity =>
        stringifyEntityRef(entity).toLocaleLowerCase('en-US'),
      ),
    );

    const responses = (bulkCheckResponse ?? []).filter(resp =>
      entitySet.has(resp.entity.toLocaleLowerCase('en-US')),
    );

    const responsesForCheck = new Map<string, ResponsesForCheck>();

    const uniqueChecks = new Set(
      responses.flatMap(resp =>
        resp.results.map(chkRes => {
          const stringified = stringifyCheck(chkRes.check);

          const renderer = renderers.get(chkRes.check.type);

          const checkResponses = responsesForCheck.get(stringified) ?? [];
          checkResponses.push({
            entity: resp.entity,
            result: chkRes,
            renderer,
            failed: !renderer?.isFailed ? false : renderer.isFailed(chkRes),
          });
          responsesForCheck.set(stringified, checkResponses);

          return stringified;
        }),
      ),
    );

    const checks = allChecks
      .filter(check => uniqueChecks.has(stringifyCheck(check)))
      .map(
        (check): DecoratedCheck => ({
          check,
          uniq: stringifyCheck(check),
          renderer: renderers.get(check.type),
        }),
      );

    return { checks, responses, responsesForCheck };
  }, [allChecks, bulkCheckResponse, renderers, entities]);
}
