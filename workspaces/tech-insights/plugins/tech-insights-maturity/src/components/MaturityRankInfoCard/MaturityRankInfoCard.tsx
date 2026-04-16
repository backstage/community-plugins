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
import { Fragment, useMemo } from 'react';
import { InfoCard } from '@backstage/core-components';
import {
  MaturitySummary,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { MaturitySummaryCardContent } from '../MaturitySummaryInfoCard/MaturitySummaryCardContent';
import { MaturityHelp } from '../../helpers/MaturityHelp';
import { MaturityRankIcon } from '../MaturityRankIcon';

type Props = {
  summary: MaturitySummary;
};

const useStyles = makeStyles({
  content: {
    justifyContent: 'center',
    margin: 'auto',
  },
});

function rankProgress(rank: Rank, value: MaturitySummary) {
  if (value.rank >= rank || (value.maxRank === rank && value.isMaxRank)) {
    return {
      passedChecks: 0,
      totalChecks: 0,
      percentage: 100,
    };
  }
  return undefined;
}

function getRankAvatarProgress(rank: Rank, value: MaturitySummary) {
  return (
    <MaturityRankIcon
      value={{ rank, isMaxRank: true }}
      size={25}
      progress={rankProgress(rank, value)}
    />
  );
}

export const MaturityRankInfoCard = ({ summary }: Props) => {
  const configApi = useApi(configApiRef);
  const { content } = useStyles();

  const rankInfo = useMemo(
    () => ({
      [Rank.Stone]: {
        title:
          configApi.getOptionalString(
            'techInsights.maturity.rank.stone.title',
          ) ?? 'Unmanaged',
        description:
          configApi.getOptionalString(
            'techInsights.maturity.rank.stone.description',
          ) ??
          'Entity does not utilize standard infrastructure or tools to ensure effective operations',
      },
      [Rank.Bronze]: {
        title:
          configApi.getOptionalString(
            'techInsights.maturity.rank.bronze.title',
          ) ?? 'Foundational',
        description:
          configApi.getOptionalString(
            'techInsights.maturity.rank.bronze.description',
          ) ??
          'Has full Ownership, but Maintainability, Security, and Reliability are not ensured',
      },
      [Rank.Silver]: {
        title:
          configApi.getOptionalString(
            'techInsights.maturity.rank.silver.title',
          ) ?? 'Standard',
        description:
          configApi.getOptionalString(
            'techInsights.maturity.rank.silver.description',
          ) ??
          'Ownership, Maintainability, and Security are ensured, but Reliability is not guaranteed',
      },
      [Rank.Gold]: {
        title:
          configApi.getOptionalString(
            'techInsights.maturity.rank.gold.title',
          ) ?? 'Excellent',
        description:
          configApi.getOptionalString(
            'techInsights.maturity.rank.gold.description',
          ) ??
          'Conforms with the Golden Path standards. Ownership, Maintainability, Security, and Reliability are all ensured',
      },
    }),
    [configApi],
  );

  const { title, description } = rankInfo[summary.rank];

  return (
    <InfoCard
      title={
        <Fragment>
          Maturity Rank
          <MaturityHelp />
        </Fragment>
      }
    >
      <CardContent>
        <Stack direction="row" spacing={5}>
          {getRankAvatarProgress(Rank.Stone, summary)}
          {getRankAvatarProgress(Rank.Bronze, summary)}
          {getRankAvatarProgress(Rank.Silver, summary)}
          {getRankAvatarProgress(Rank.Gold, summary)}
        </Stack>
      </CardContent>
      <CardContent>
        <MaturityRankIcon
          value={summary}
          size={80}
          progress={summary.rankProgress}
          className={content}
        />
        <Typography variant="h6" align="center">
          {title}
        </Typography>
        <Typography variant="subtitle2" align="center">
          {description}
        </Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <MaturitySummaryCardContent summary={summary} variant="infoCard" />
      </CardContent>
    </InfoCard>
  );
};
