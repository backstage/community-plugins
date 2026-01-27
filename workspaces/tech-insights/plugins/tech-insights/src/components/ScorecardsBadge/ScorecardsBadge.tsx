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

import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { Tooltip, Tag, TagGroup, TooltipTrigger } from '@backstage/ui';

import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';

import { ScorecardsList } from '../ScorecardsList';

export const ScorecardsBadge = (props: {
  checkResults: CheckResult[];
  entity?: Entity;
}) => {
  const { checkResults, entity } = props;

  const api = useApi(techInsightsApiRef);

  const types = [...new Set(checkResults.map(({ check }) => check.type))];
  const checkResultRenderers = api.getCheckResultRenderers(types);
  const checkResultsWithRenderer = checkResults.map(result => ({
    result,
    renderer: checkResultRenderers.find(
      renderer => renderer.type === result.check.type,
    ),
  }));

  const succeeded = checkResultsWithRenderer.filter(
    ({ result, renderer }) => !renderer?.isFailed?.(result),
  ).length;

  const isAllPassing = succeeded === checkResults.length;

  return (
    <TooltipTrigger>
      <TagGroup>
        <Tag
          size="medium"
          style={{
            borderRadius: 16,
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 16,
            paddingRight: 16,
            backgroundColor: isAllPassing ? 'mediumseagreen' : 'orangered',
          }}
        >
          {`${succeeded}/${checkResults.length}`}
        </Tag>

        <Tooltip>
          <ScorecardsList
            checkResults={checkResults}
            entity={entity}
            dense
            hideDescription
          />
        </Tooltip>
      </TagGroup>
    </TooltipTrigger>
  );
};
