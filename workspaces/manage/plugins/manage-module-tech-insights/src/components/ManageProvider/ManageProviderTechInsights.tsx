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
import { Check } from '@backstage-community/plugin-tech-insights-common';
import {
  BulkCheckResponse,
  CheckResult,
} from '@backstage-community/plugin-tech-insights-common';
import {
  useCurrentTab,
  useManagedEntities,
} from '@backstage-community/plugin-manage-react';

import { filterEmptyChecks, stringifyCheck } from '../../utils';
import { manageTechInsightsApiRef } from '../../api/api';
import { defaultGetPercentColor, defaultMapTitle } from '../../api/defaults';
import { ManageTechInsightsMapTitle } from '../../title';

/**
 * Configuration options for Manage Tech Insights provider.
 *
 * @public
 */
export interface ManageTechInsightsContextConfig {
  checkFilter?: (check: Check) => boolean;
  columnsCheckFilter?:
    | ((check: Check) => boolean)
    | Record<string, (check: Check) => boolean>;
  getPercentColor?: (percent: number) => string;
  mapTitle?: ManageTechInsightsMapTitle;
  showEmpty: boolean | Record<string, boolean>;
}

/**
 * @internal
 */
export interface ManageTechInsightsContext
  extends ManageTechInsightsContextConfig {
  allChecks: Check[];
  bulkCheckResponse: BulkCheckResponse | undefined;
  renderers: Map<string, CheckResultRenderer>;
}

const ctx = createContext<ManageTechInsightsContext>(undefined as any);

const { Provider } = ctx;

/**
 * @deprecated Use the new frontend system instead
 * @public
 */
export function ManageProviderTechInsights(
  props: PropsWithChildren<Partial<ManageTechInsightsContextConfig>>,
) {
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

    const showEmpty = props.showEmpty ?? false;

    return {
      ...props,
      showEmpty,
      allChecks,
      bulkCheckResponse,
      renderers,
    };
  }, [asyncState.value, techInsightsApi, props]);

  return <Provider value={state} children={props.children} />;
}

/**
 * @internal
 */
export interface UseManageTechInsightsOptions {
  checkFilter?: (check: Check) => boolean;
  showEmpty?: boolean;
  mode?: 'columns' | undefined;
}

/**
 * @internal
 */
export function useManageTechInsights({
  checkFilter,
  mode,
  showEmpty: customShowEmpty,
}: UseManageTechInsightsOptions = {}) {
  const manageTechInsightsApi = useApi(manageTechInsightsApiRef);
  const context = useContext(ctx);

  const currentTab = useCurrentTab();

  return useMemo(() => {
    const filter =
      checkFilter ??
      context.checkFilter ??
      manageTechInsightsApi.checkFilter ??
      (() => true);
    const getPercentColor =
      context.getPercentColor ??
      manageTechInsightsApi.getPercentColor ??
      defaultGetPercentColor;
    const mapTitle =
      context.mapTitle ?? manageTechInsightsApi.mapTitle ?? defaultMapTitle;

    const curColumnsCheckFilter = context.columnsCheckFilter ?? filter;
    const columnsCheckFilter =
      typeof curColumnsCheckFilter === 'function'
        ? curColumnsCheckFilter
        : curColumnsCheckFilter[currentTab] ?? filter;

    const curFilter = mode === 'columns' ? columnsCheckFilter : filter;

    const showEmpty =
      customShowEmpty ??
      (typeof context.showEmpty === 'boolean'
        ? context.showEmpty
        : context.showEmpty?.[currentTab] ?? false);

    return {
      ...context,
      showEmpty,
      checkFilter: filter,
      columnsCheckFilter,
      getPercentColor,
      mapTitle,
      allChecks: context.allChecks.filter(curFilter),
      bulkCheckResponse: (context.bulkCheckResponse ?? []).map(response => ({
        ...response,
        results: response.results.filter(res => curFilter(res.check)),
      })),
    };
  }, [
    context,
    manageTechInsightsApi,
    checkFilter,
    customShowEmpty,
    currentTab,
    mode,
  ]);
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
  const { allChecks, bulkCheckResponse, renderers, showEmpty } =
    useManageTechInsights({
      checkFilter,
    });

  return useMemo((): UseManageTechInsightsForEntitiesResult => {
    const { responses, filteredChecks } = filterEmptyChecks(
      bulkCheckResponse,
      entities,
      allChecks,
      showEmpty,
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

    const checks = filteredChecks
      .filter(check => uniqueChecks.has(stringifyCheck(check)))
      .map(
        (check): DecoratedCheck => ({
          check,
          uniq: stringifyCheck(check),
          renderer: renderers.get(check.type),
        }),
      );

    return { checks, responses, responsesForCheck };
  }, [allChecks, bulkCheckResponse, renderers, entities, showEmpty]);
}
