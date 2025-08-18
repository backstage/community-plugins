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
import {
  MaturitySummaryByArea,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Line } from 'rc-progress';
import { getNextRankColor, pluralize } from './utils';
import { MaturityRankIcon } from '../components/MaturityRankIcon';

type Props = {
  areaSummary: MaturitySummaryByArea;
  variant?: 'gridItem' | 'infoCard';
};

export const AreaProgress = ({ areaSummary, variant }: Props) => {
  const { area, progress, rankProgress, rank, maxRank, isMaxRank } =
    areaSummary;
  let result = <LinearProgress color="secondary" variant="indeterminate" />;

  if (progress) {
    const nextRankName = isMaxRank ? Rank[maxRank] : Rank[rank + 1];
    const progressCaption = isMaxRank
      ? 'Max rank!'
      : `${rankProgress.percentage}% to ${nextRankName}`;

    const remainingRankTasks =
      rankProgress.totalChecks - rankProgress.passedChecks;
    const rankCheckInfo = `${remainingRankTasks} task${pluralize(
      remainingRankTasks,
    )} left to reach ${nextRankName} rank in this area`;
    const rankProgressTooltip = isMaxRank ? '' : rankCheckInfo;

    const remainingTasks = progress.totalChecks - progress.passedChecks;
    const checkInfo = `${remainingTasks} task${pluralize(
      remainingTasks,
    )} left until area is fully mature (currently ${progress.percentage}%)`;
    const progressTooltip = (
      <>
        {rankProgressTooltip}
        {rankProgressTooltip !== '' && <br />}
        {checkInfo}
      </>
    );

    const fontVariant = variant === 'infoCard' ? 'body1' : 'body2';
    const logoSize = variant === 'infoCard' ? 20 : 17;

    result = (
      <Stack key={area}>
        <Stack direction="row" spacing={1}>
          <MaturityRankIcon value={areaSummary} size={logoSize} />
          <Typography variant={fontVariant} gutterBottom color="textPrimary">
            {area}
          </Typography>
          <Typography variant={fontVariant} color="textSecondary">
            {progressCaption}
          </Typography>
        </Stack>
        <Tooltip title={progressTooltip}>
          <Box>
            <Line
              key={area}
              strokeColor={getNextRankColor(rank, maxRank)}
              trailColor="rgba(0, 0, 0, 0.1)"
              strokeWidth={2}
              trailWidth={2}
              percent={rankProgress.percentage}
              data-testid="progressbar"
            />
          </Box>
        </Tooltip>
      </Stack>
    );
  }

  return result;
};
