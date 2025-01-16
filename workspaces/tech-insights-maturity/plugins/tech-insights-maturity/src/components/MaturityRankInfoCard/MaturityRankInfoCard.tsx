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
import { InfoCard } from '@backstage/core-components';
import {
  MaturitySummary,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import React from 'react';
import { MaturitySummaryCardContent } from '../MaturitySummaryInfoCard/MaturitySummaryCardContent';
import { useScoringSummaryLoader } from '../../hooks/useScoringSummaryLoader';
import { MaturityHelp } from '../../helpers/MaturityHelp';
import { MaturityRankAvatar } from '../MaturityRankAvatar';

type Props = {
  entity: Entity;
};

const useStyles = makeStyles({
  content: {
    justifyContent: 'center',
    margin: 'auto',
  },
});

const RankDescription = new Map<number, string>([
  [
    Rank.Stone,
    'Entity does not utilize standard infrastructure or tools to ensure effective operations',
  ],
  [
    Rank.Bronze,
    'Has full Ownership, but Maintainability, Security, and Reliability are not ensured',
  ],
  [
    Rank.Silver,
    'Ownership, Maintainability, and Security are ensured, but Reliability is not guaranteed',
  ],
  [
    Rank.Gold,
    'Conforms with the Golden Path standards. Ownership, Maintainability, Security, and Reliability are all ensured',
  ],
]);

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
    <MaturityRankAvatar
      value={{ rank, isMaxRank: true }}
      size={25}
      progress={rankProgress(rank, value)}
    />
  );
}

export const MaturityRankInfoCard = ({ entity }: Props) => {
  const { content } = useStyles();
  const { value } = useScoringSummaryLoader(entity);

  let cardContent = <></>;
  if (value) {
    cardContent = (
      <>
        <CardContent>
          <Stack direction="row" spacing={5}>
            {getRankAvatarProgress(Rank.Stone, value)}
            {getRankAvatarProgress(Rank.Bronze, value)}
            {getRankAvatarProgress(Rank.Silver, value)}
            {getRankAvatarProgress(Rank.Gold, value)}
          </Stack>
        </CardContent>
        <CardContent>
          <MaturityRankAvatar
            value={value}
            size={80}
            progress={value.rankProgress}
            className={content}
          />
          <Typography variant="h6" align="center">
            {Rank[value.rank]}
          </Typography>
          <Typography variant="subtitle2" align="center">
            {RankDescription.get(value.rank)}
          </Typography>
        </CardContent>
        <Divider />
        <CardContent>
          <MaturitySummaryCardContent summary={value} variant="infoCard" />
        </CardContent>
      </>
    );
  }

  return (
    <InfoCard
      title={
        <React.Fragment>
          Maturity Rank
          <MaturityHelp />
        </React.Fragment>
      }
    >
      {cardContent}
    </InfoCard>
  );
};
