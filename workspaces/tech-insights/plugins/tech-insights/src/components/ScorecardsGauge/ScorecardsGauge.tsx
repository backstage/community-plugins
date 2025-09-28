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
import { Gauge, InfoCard } from '@backstage/core-components';
import { ScorecardInfo } from '../ScorecardsInfo';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

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
    <InfoCard title={title} subheader={description}>
      <Grid container justifyContent="center">
        <Grid item style={{ width: '160px', marginBottom: '1em' }}>
          <Gauge value={progress} size="small" />
        </Grid>
      </Grid>
      <ScorecardInfo
        title={<Typography variant="h6">Checks</Typography>}
        checkResults={checkResults}
        entity={entity}
        noWarning={noWarning}
        expanded={expanded}
        dense={dense}
        hideDescription={hideDescription}
      />
    </InfoCard>
  );
};
