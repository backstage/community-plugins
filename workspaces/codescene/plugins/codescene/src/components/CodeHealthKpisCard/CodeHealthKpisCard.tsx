/*
 * Copyright 2022 The Backstage Authors
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
import { JSX } from 'react';
import { EmptyState, InfoCard } from '@backstage/core-components';
import { ButtonLink, Grid, Text } from '@backstage/ui';
import { PropsWithChildren } from 'react';
import { Analysis } from '../../api/types';
import { Gauge } from '../Gauge/Gauge';
import styles from './CodeHealthKpisCard.module.css';

type CodeHealthKpi = {
  name: string;
  description: string;
  value: number;
  oldValue: number;
};

const CodeHealthKpiInfoCard = ({ children }: PropsWithChildren<{}>) => {
  const linkInfo = {
    title: 'What does this mean?',
    link: 'https://codescene.com/blog/3-code-health-kpis/',
  };
  return (
    <InfoCard
      title="Code Health KPIs"
      subheader="The Code Health metric identifies source code that is expensive and risky to maintain."
      deepLink={linkInfo}
    >
      {children}
    </InfoCard>
  );
};

export const CodeHealthKpisCard = ({
  codesceneHost,
  analysis,
}: {
  codesceneHost: string;
  analysis: Analysis;
}): JSX.Element => {
  if (
    !analysis.high_level_metrics.hotspots_code_health_now_weighted_average ||
    !analysis.high_level_metrics.hotspots_code_health_month_weighted_average ||
    !analysis.high_level_metrics.code_health_weighted_average_current ||
    !analysis.high_level_metrics.code_health_weighted_average_last_month ||
    !analysis.high_level_metrics.code_health_now_worst_performer ||
    !analysis.high_level_metrics.code_health_month_worst_performer
  ) {
    return (
      <CodeHealthKpiInfoCard>
        <EmptyState
          missing="data"
          title="Your project does not expose Code Health KPIs"
          description="Enable the 'Full Code Health Scan' option and trigger an analysis to scan the health of all code in the project."
          action={
            <ButtonLink
              variant="primary"
              href={`${codesceneHost}/projects/${analysis.project_id}/configuration#hotspots`}
            >
              Configuration
            </ButtonLink>
          }
        />
      </CodeHealthKpiInfoCard>
    );
  }

  const hotspotCodeHealth: CodeHealthKpi = {
    name: 'Hotspot Code Health',
    description:
      'A weighted average of the code health in your hotspots. Generally, this is the most critical metric since low code health in a hotspot will be expensive.',
    value:
      analysis.high_level_metrics.hotspots_code_health_now_weighted_average,
    oldValue:
      analysis.high_level_metrics.hotspots_code_health_month_weighted_average,
  };
  const averageCodeHealth: CodeHealthKpi = {
    name: 'Average Code Health',
    description:
      'A weighted average of all the files in the codebase. This KPI indicates how deep any potential code health issues go.',
    value: analysis.high_level_metrics.code_health_weighted_average_current,
    oldValue:
      analysis.high_level_metrics.code_health_weighted_average_last_month,
  };
  const worstPerformer: CodeHealthKpi = {
    name: 'Worst Performer',
    description:
      'A single file code health score representing the lowest code health in any module across the codebase. Points out long-term risks.',
    value: analysis.high_level_metrics.code_health_now_worst_performer,
    oldValue: analysis.high_level_metrics.code_health_month_worst_performer,
  };
  const kpis = [hotspotCodeHealth, averageCodeHealth, worstPerformer];
  const cards = kpis.map(kpi => {
    const lastMonthText =
      Math.abs(kpi.oldValue - kpi.value) < 0.1
        ? undefined
        : `(from ${kpi.oldValue} last month)`;
    return (
      <div key={kpi.name}>
        <Grid.Root columns={{ sm: '12' }} gap="4">
          <Grid.Item colSpan={{ sm: '4' }}>
            <div className={styles.gauge}>
              <Gauge value={kpi.value} max={10} tooltipText={kpi.description} />
            </div>
          </Grid.Item>
          <Grid.Item colSpan={{ sm: '8' }}>
            <Text variant="body-medium">{kpi.name}</Text>
            <Text variant="title-small">
              <b>{Math.round(kpi.value * 10) / 10}</b> {lastMonthText}
            </Text>
          </Grid.Item>
        </Grid.Root>
      </div>
    );
  });

  return <CodeHealthKpiInfoCard>{cards}</CodeHealthKpiInfoCard>;
};
