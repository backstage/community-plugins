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
import { Table, TableColumn } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  EntityMaturitySummary,
  MaturitySummaryByArea,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Circle, Line } from 'rc-progress';

import useAsyncRetry from 'react-use/lib/useAsync';
import { maturityApiRef } from '../../api';
import { getNextRankColor, pluralize } from '../../helpers/utils';
import { MaturityLink } from '../../helpers/MaturityLink';
import { MaturityRankIcon } from '../MaturityRankIcon';
import { MaturityRankChip } from '../MaturityRankChip';

const OverallCell = ({
  areaSummary,
}: {
  areaSummary: MaturitySummaryByArea;
}) => {
  const { area, rank, maxRank, progress } = areaSummary;

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      style={{ padding: '0.6rem 0' }}
    >
      <Circle
        key={area}
        strokeColor={getNextRankColor(rank, maxRank)}
        trailColor="rgba(0, 0, 0, 0.1)"
        strokeWidth={10}
        trailWidth={10}
        percent={progress.percentage}
        style={{ width: '25pt' }}
      />
      <Typography variant="button">{`${progress.percentage}%`}</Typography>
    </Stack>
  );
};

const NextRankCell = ({
  areaSummary,
}: {
  areaSummary: MaturitySummaryByArea;
}) => {
  const { rank, maxRank, isMaxRank, rankProgress } = areaSummary;

  const nextRankName = isMaxRank ? Rank[maxRank] : Rank[rank + 1];
  const incompleteTasks = rankProgress.totalChecks - rankProgress.passedChecks;
  const taskCaption = `${incompleteTasks} ${nextRankName} task${pluralize(
    incompleteTasks,
  )} left`;
  const taskTooltip = `${rankProgress.percentage}% to ${nextRankName} (${
    rankProgress.passedChecks
  }/${rankProgress.totalChecks} task${pluralize(
    rankProgress.totalChecks,
  )} completed)`;

  const progressCaption = isMaxRank ? 'Max rank!' : taskCaption;
  const progressTooltip = isMaxRank ? 'Max rank!' : taskTooltip;

  return (
    <Tooltip title={progressTooltip} arrow>
      <Stack>
        <Typography variant="caption" color="textSecondary">
          {progressCaption}
        </Typography>
        <Line
          strokeColor={getNextRankColor(rank, maxRank)}
          trailColor="rgba(0, 0, 0, 0.1)"
          strokeWidth={2}
          trailWidth={2}
          percent={rankProgress.percentage}
          style={{ padding: '0.4rem 0' }}
          data-testid="progressbar"
        />
      </Stack>
    </Tooltip>
  );
};

const ProgressCell = ({
  areaSummary,
}: {
  areaSummary?: MaturitySummaryByArea;
}) => {
  if (!areaSummary) return <></>;

  return (
    <MaturityRankIcon
      value={areaSummary}
      size={25}
      progress={areaSummary.rankProgress}
    />
  );
};

export function MaturitySummaryTable({
  entities,
}: Readonly<{ entities: Entity[] }>) {
  const theme = useTheme();

  const api = useApi(maturityApiRef);
  const { value } = useAsyncRetry(
    async () => api.getBulkMaturitySummary(entities),
    [api, entities],
  );

  const style = {
    sorting: false,
    cellStyle: {
      fontSize: '1.2rem',
      paddingTop: '0.4rem',
      paddingBottom: '0.4rem',
      verticalAlign: 'center',
    },
  };

  const columns: TableColumn<EntityMaturitySummary>[] = [
    {
      title: 'Rank',
      field: 'summary.rank',
      hiddenByColumnsButton: true,
      defaultSort: 'asc',
      customSort: (a, b) => {
        const isNotSameRank = a.summary.rank !== b.summary.rank;
        const progA = a.summary.isMaxRank ? 100 : a.summary.progress.percentage;
        const progB = b.summary.isMaxRank ? 100 : b.summary.progress.percentage;

        // Sort by rank, or by overall progress within same rank.
        return isNotSameRank ? a.summary.rank - b.summary.rank : progA - progB;
      },
      hidden: true,
    },
    {
      title: 'Name',
      field: 'displayName',
      hiddenByColumnsButton: true,
      width: '22%',
      ...style,
      render: row => (
        <b>
          <MaturityLink entity={row.entity} />
        </b>
      ),
    },
    {
      title: 'Overall',
      tooltip: 'Progress toward achieving full maturity',
      field: 'summary.progress.percentage',
      width: '13%',
      ...style,
      hidden: true,
      render: row => (
        <OverallCell
          areaSummary={{
            area: '',
            ...row.summary,
          }}
        />
      ),
    },
    {
      title: 'Rank',
      tooltip: 'Current overall rank',
      field: 'summary.rank',
      width: '10%',
      ...style,
      render: row => <MaturityRankChip value={row.summary} size={25} />,
    },
    {
      title: 'Next Rank',
      tooltip: 'Progress toward achieving next rank',
      field: 'summary.rankProgress.percentage',
      width: '15%',
      ...style,
      render: row => (
        <NextRankCell
          areaSummary={{
            area: '',
            ...row.summary,
          }}
        />
      ),
    },
  ];

  // Dynamically add each category column
  const categories = value
    ?.flatMap(x => x.summary.areaSummaries)
    .map(x => x.area)
    .filter((x, i, a) => a.indexOf(x) === i);
  categories?.forEach(category => {
    const column = {
      title: category,
      field: `summary.areaSummaries.${category}`,
      width: '10%',
      ...style,
      render: (row: EntityMaturitySummary) => (
        <ProgressCell
          areaSummary={row.summary.areaSummaries.find(x => x.area === category)}
        />
      ),
    };

    columns.push(column);
  });

  if (!value) return <></>;

  return (
    <Table
      title="Component Maturity"
      subtitle="View this entity's children in order of lowest to highest Maturity."
      columns={columns}
      data={value ?? []}
      options={{
        pageSize: 10,
        columnsButton: true,
        rowStyle: {
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.background.default}`,
          borderBottom: `1px solid ${theme.palette.background.default}`,
        },
      }}
    />
  );
}
