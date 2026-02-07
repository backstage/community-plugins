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
import { useMemo } from 'react';

import { stringifyEntityRef } from '@backstage/catalog-model';
import { ResultCheckIcon } from '@backstage-community/plugin-tech-insights-react';
import type { Check } from '@backstage-community/plugin-tech-insights-common';
import {
  ColumnIconError,
  type ManageColumn,
  type GetColumnsFunc,
  ColumnIconNoData,
} from '@backstage-community/plugin-manage-react';

import { eqCheck } from '../utils';

import { useEntityInsights } from './hooks';
import { useTableColumnTitle } from './title';
import { Cell } from './Cell';

export function makeGetColumns(
  customCheckFilter: ((check: Check) => boolean) | undefined,
  customShowEmpty: boolean | undefined,
): GetColumnsFunc {
  return function useColumns(entities): ManageColumn[] {
    const { responses, checks } = useEntityInsights(
      entities,
      customCheckFilter,
      customShowEmpty,
    );

    const mapTitle = useTableColumnTitle();

    return useMemo(
      () =>
        checks.map(
          (check): ManageColumn => ({
            id: `tech-insights-${check.id}`,
            title: mapTitle(check),
            render: ({ entity }) => {
              const entityRef = stringifyEntityRef(entity);
              const response = responses.get(entityRef);
              if (!response) {
                return <></>;
              }

              const foundCheck = response.find(res =>
                eqCheck(res.check, check),
              );

              if (!foundCheck) {
                return <ColumnIconNoData />;
              }

              return (
                <Cell>
                  <ResultCheckIcon
                    result={foundCheck}
                    entity={entity}
                    missingRendererComponent={
                      <ColumnIconError title="No renderer found for this check" />
                    }
                  />
                </Cell>
              );
            },
          }),
        ),
      [checks, responses, mapTitle],
    );
  };
}
