/*
 * Copyright 2020 The Backstage Authors
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

import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import {
  Progress,
  ResponseErrorPanel,
  InfoCard,
  InfoCardVariants,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/esm/useAsync';
import { codeCoverageApiRef } from '../../api';
import { getTrendForCoverage, CoverageType } from '../../utils/coverageTrend';
import { TrendIcon } from '../../utils/TrendIcon';
import { rootRouteRef } from '../../routes';
import { isCodeCoverageAvailable } from '../Router';

const ANNOTATION_CODE_COVERAGE = 'backstage.io/code-coverage';

const useStyles = makeStyles(theme => ({
  percentage: {
    fontSize: '2rem',
    fontWeight: 'bold',
    lineHeight: 1,
  },
  label: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  metricBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  trendRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(0.5),
  },
}));

function CoverageMetric({
  label,
  percentage,
  trend,
  hasPreviousBuild,
  classes,
}: {
  label: string;
  percentage: number;
  trend: number;
  hasPreviousBuild: boolean;
  classes: ReturnType<typeof useStyles>;
}) {
  let trendLabel: string;
  if (!hasPreviousBuild) {
    trendLabel = 'No previous build';
  } else if (trend === 0) {
    trendLabel = 'No change vs last build';
  } else {
    trendLabel = `${Math.abs(Math.floor(trend))}% vs last build`;
  }

  return (
    <Box className={classes.metricBox}>
      <Typography className={classes.label} variant="overline">
        {label}
      </Typography>
      <Typography className={classes.percentage}>
        {percentage.toFixed(1)}%
      </Typography>
      <Box className={classes.trendRow}>
        <TrendIcon trend={trend} />
        <Typography variant="caption">{trendLabel}</Typography>
      </Box>
    </Box>
  );
}

/**
 * Props for {@link EntityCodeCoverageCard}.
 *
 * @public
 */
export type CoverageCardProps = {
  variant?: InfoCardVariants;
};

export const CoverageCard = ({ variant }: CoverageCardProps) => {
  const { entity } = useEntity();
  const codeCoverageApi = useApi(codeCoverageApiRef);
  const rootLink = useRouteRef(rootRouteRef);
  const classes = useStyles();

  const entityRef = {
    kind: entity.kind,
    namespace: entity.metadata.namespace || 'default',
    name: entity.metadata.name,
  };

  const {
    loading: loadingCoverage,
    error: errorCoverage,
    value: valueCoverage,
  } = useAsync(
    async () => await codeCoverageApi.getCoverageForEntity(entityRef),
  );

  const {
    loading: loadingHistory,
    error: errorHistory,
    value: valueHistory,
  } = useAsync(
    async () => await codeCoverageApi.getCoverageHistoryForEntity(entityRef, 2),
  );

  if (!isCodeCoverageAvailable(entity)) {
    return (
      <MissingAnnotationEmptyState annotation={ANNOTATION_CODE_COVERAGE} />
    );
  }

  if (loadingCoverage || loadingHistory) {
    return <Progress />;
  }

  if (errorCoverage) {
    return <ResponseErrorPanel error={errorCoverage} />;
  }

  if (errorHistory) {
    return <ResponseErrorPanel error={errorHistory} />;
  }

  if (!valueCoverage || !valueHistory) {
    return <Alert severity="warning">No coverage data found.</Alert>;
  }

  const history = valueHistory.history;
  const latest = history[0];
  const previous = history[1];

  if (!latest) {
    return <Alert severity="warning">No coverage history found.</Alert>;
  }

  const getTrend = (type: CoverageType) =>
    previous ? getTrendForCoverage(latest, previous, type) : 0;

  const lineTrend = getTrend('line');
  const branchTrend = getTrend('branch');
  const hasPreviousBuild = Boolean(previous);
  const hasBranchCoverage = latest.branch.available > 0;

  return (
    <InfoCard
      title="Code Coverage"
      variant={variant}
      deepLink={{ title: 'View full report', link: rootLink() }}
    >
      <Grid container justifyContent="space-around">
        <Grid item>
          <CoverageMetric
            label="Line Coverage"
            percentage={latest.line.percentage}
            trend={lineTrend}
            hasPreviousBuild={hasPreviousBuild}
            classes={classes}
          />
        </Grid>
        {hasBranchCoverage && (
          <Grid item>
            <CoverageMetric
              label="Branch Coverage"
              percentage={latest.branch.percentage}
              trend={branchTrend}
              hasPreviousBuild={hasPreviousBuild}
              classes={classes}
            />
          </Grid>
        )}
      </Grid>
    </InfoCard>
  );
};
