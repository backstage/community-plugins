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
import { Rank } from '@backstage-community/plugin-tech-insights-maturity-common';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { PieChart } from '@mui/x-charts/PieChart';
import type { ReactNode } from 'react';
import useAsyncRetry from 'react-use/lib/useAsync';
import { maturityApiRef } from '../../api';
import { getRankColor } from '../../helpers/utils';

type Props = {
  entities: Entity[];
};

const size = {
  width: 380,
  height: 300,
};

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 20,
}));

function PieCenterLabel({ children }: { children: ReactNode }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

export const MaturityChartCard = ({ entities }: Props) => {
  const api = useApi(maturityApiRef);
  const { loading, value } = useAsyncRetry(
    async () => api.getBulkMaturityCheckResults(entities),
    [api],
  );

  return (
    <Card>
      <CardContent>
        {loading && <CircularProgress size={100} />}
        {value && value.length > 0 && (
          <PieChart
            colors={[
              getRankColor(Rank.Stone),
              getRankColor(Rank.Bronze),
              getRankColor(Rank.Silver),
              getRankColor(Rank.Gold),
            ]}
            series={[
              {
                arcLabel: item =>
                  item.value > 0
                    ? `${((item.value / value.length) * 100).toFixed()}%`
                    : '',
                data: [
                  {
                    value: value.filter(x => x.rank === Rank.Stone).length,
                    label: Rank[Rank.Stone],
                  },
                  {
                    value: value.filter(x => x.rank === Rank.Bronze).length,
                    label: Rank[Rank.Bronze],
                  },
                  {
                    value: value.filter(x => x.rank === Rank.Silver).length,
                    label: Rank[Rank.Silver],
                  },
                  {
                    value: value.filter(x => x.rank === Rank.Gold).length,
                    label: Rank[Rank.Gold],
                  },
                ],
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { color: 'gray' },
                innerRadius: 90,
              },
            ]}
            {...size}
          >
            <PieCenterLabel>{`${value.length} services`}</PieCenterLabel>
          </PieChart>
        )}
      </CardContent>
    </Card>
  );
};
