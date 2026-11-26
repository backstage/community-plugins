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

import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';
import { Gauge } from '@backstage/core-components';
import { ScorecardInfo } from '../ScorecardsInfo';
import { Box, Card, CardBody, CardHeader, Flex, Text } from '@backstage/ui';

export const ScorecardsGauge = (props: {
  checkResults: CheckResult[];
  entity?: Entity;
  title: string;
  description?: string;
  noWarning?: boolean;
  expanded?: boolean;
  dense?: boolean;
  hideDescription?: boolean;
}) => {
  const {
    checkResults,
    entity,
    title,
    description,
    noWarning,
    expanded,
    dense = true,
    hideDescription,
  } = props;

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
  const progress = succeeded / checkResults.length;

  return (
    <Card>
      <CardHeader>
        <Text as="h2" variant="title-small">
          {title}
        </Text>
        {description && (
          <Text as="p" variant="body-small" color="secondary">
            {description}
          </Text>
        )}
      </CardHeader>
      <CardBody>
        <Flex justify="center">
          <Box width="160px" mb="4">
            <Gauge value={progress} size="small" />
          </Box>
        </Flex>
        <ScorecardInfo
          title="Checks"
          checkResults={checkResults}
          entity={entity}
          noWarning={noWarning}
          expanded={expanded}
          dense={dense}
          hideDescription={hideDescription}
        />
      </CardBody>
    </Card>
  );
};
