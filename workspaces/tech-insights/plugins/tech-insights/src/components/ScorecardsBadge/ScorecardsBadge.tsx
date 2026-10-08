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
import {
  Badge,
  Flex,
  Focusable,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { RiCheckboxCircleLine, RiErrorWarningLine } from '@remixicon/react';

import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import {
  ResultCheckIcon,
  techInsightsApiRef,
} from '@backstage-community/plugin-tech-insights-react';

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
      <Focusable>
        {/* Focusable so keyboard users can reach the tooltip */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <Badge
          size="medium"
          tabIndex={0}
          aria-label={`${succeeded} of ${checkResults.length} checks passed`}
          icon={
            isAllPassing ? (
              <RiCheckboxCircleLine
                color="var(--bui-fg-positive)"
                aria-label="All checks passed"
              />
            ) : (
              <RiErrorWarningLine
                color="var(--bui-fg-negative)"
                aria-label="Some checks failed"
              />
            )
          }
        >
          {`${succeeded}/${checkResults.length}`}
        </Badge>
      </Focusable>
      <Tooltip>
        {/* A plain list: nested tooltip triggers would steal this tooltip's anchor */}
        <Flex direction="column" gap="1" role="list">
          {checkResultsWithRenderer.map(({ result, renderer }) => (
            <Flex
              key={result.check.id}
              role="listitem"
              align="center"
              justify="between"
              gap="2"
            >
              <Text as="span">{result.check.name}</Text>
              <ResultCheckIcon
                result={result}
                entity={entity}
                checkResultRenderer={renderer}
                disableLinksMenu
              />
            </Flex>
          ))}
        </Flex>
      </Tooltip>
    </TooltipTrigger>
  );
};
