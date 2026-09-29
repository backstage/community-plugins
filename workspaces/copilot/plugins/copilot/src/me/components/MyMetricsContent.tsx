/*
 * Copyright 2026 The Backstage Authors
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
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  DateRangePicker,
  Flex,
  Grid,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Text,
  Container,
} from '@backstage/ui';
import { InfoCard, Progress } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/frontend-plugin-api';
import type { RangeValue } from '@react-types/shared';
import type { DateValue } from '@internationalized/date';
import { parseDate } from '@internationalized/date';
import { DateTime } from 'luxon';
import { MetricsScope } from '@backstage-community/plugin-copilot-common';
import {
  RequestsByChatModeChart,
  CodeCompletionsChart,
  CodeCompletionsAcceptanceChart,
  ModelUsagePerDayChart,
  ChatModelUsageDonut,
  ModelUsagePerChatModeChart,
  LanguageUsagePerDayChart,
  LanguageUsageDonut,
  ModelUsagePerLanguageChart,
  DailyLOCChart,
  UserLOCByFeatureChart,
  AgentLOCByFeatureChart,
  UserLOCByModelChart,
  AgentLOCByModelChart,
  UserLOCByLanguageChart,
  AgentLOCByLanguageChart,
  AiCreditsConsumptionChart,
} from '../../components/V2Dashboard/charts';
import { CodeGenerationSummary } from '../../components/V2Dashboard/CodeGenerationSummary';
import { ConsumptionSummary } from '../../components/V2Dashboard/ConsumptionSummary';
import { useMyDashboardData } from '../hooks';
import {
  toDailyTotals,
  toFeatureRows,
  toLanguageFeatureRows,
  toModelFeatureRows,
  toLanguageModelRows,
} from '../adapters';
import { MyUsageSummary } from './MyUsageSummary';

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <InfoCard title={title} variant="fullHeight">
      {children}
    </InfoCard>
  );
}

/**
 * The content of the individual Copilot metrics view: date range picker,
 * tabs, summaries and charts. Reusable both as a standalone page and as a
 * Settings sub-page tab.
 *
 * @public
 */
export function MyMetricsContent() {
  const configApi = useApi(configApiRef);
  const enabled =
    configApi.getOptionalBoolean('copilot.showUserMetrics') ?? true;

  const enterprise = configApi.getOptionalString('copilot.enterprise');
  const organization = configApi.getOptionalString('copilot.organization');
  const defaultView = configApi.getOptionalString('copilot.defaultView') as
    | 'enterprise'
    | 'organization'
    | undefined;

  const preferredType: MetricsScope = (() => {
    if (defaultView === 'enterprise' || defaultView === 'organization') {
      return defaultView;
    }
    return enterprise ? 'enterprise' : 'organization';
  })();

  const type: MetricsScope = (() => {
    if (preferredType === 'enterprise') {
      return enterprise ? 'enterprise' : 'organization';
    }
    return organization ? 'organization' : 'enterprise';
  })();
  const entityId =
    type === 'enterprise'
      ? enterprise ?? organization ?? ''
      : organization ?? enterprise ?? '';

  const [from, setFrom] = useState(
    DateTime.now().minus({ days: 30 }).toFormat('yyyy-MM-dd'),
  );
  const [to, setTo] = useState(DateTime.now().toFormat('yyyy-MM-dd'));

  const params = useMemo(
    () => ({ type, entityId, from, to }),
    [type, entityId, from, to],
  );

  const { data, loading, error } = useMyDashboardData(params);

  const onDateRangeChange = useCallback(
    (value: RangeValue<DateValue> | null) => {
      if (value?.start && value?.end) {
        setFrom(value.start.toString());
        setTo(value.end.toString());
      }
    },
    [],
  );

  if (!enabled) {
    return (
      <Container>
        <Alert title="Individual Copilot metrics have been disabled by your administrator (copilot.showUserMetrics is set to false)." />
      </Container>
    );
  }

  if (!entityId) {
    return (
      <Container>
        <Alert title="Configure either copilot.enterprise or copilot.organization to use the Copilot Insights dashboard." />
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Progress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert
          status="danger"
          title={`Failed to load your Copilot metrics: ${error.message}`}
        />
      </Container>
    );
  }

  if (!data.matched) {
    return (
      <Container>
        <Alert
          status="info"
          title="We couldn't find your Copilot usage."
          description="This can happen if your Backstage user could not be matched to a GitHub login, if you haven't used GitHub Copilot yet, or if your administrator hasn't enabled per-user metrics ingestion (copilot.ingestTeams)."
        />
      </Container>
    );
  }

  const dailyTotals = toDailyTotals(data.daily);
  const byFeature = toFeatureRows(data.byFeature);
  const byLanguage = toLanguageFeatureRows(data.byLanguage);
  const byModelFeature = toModelFeatureRows(data.byModelFeature);
  const byLanguageModel = toLanguageModelRows(data.byLanguageModel);

  return (
    <Container>
      <Flex direction="column" style={{ gap: 'var(--bui-space-6, 24px)' }}>
        <Flex direction="row" gap="4" style={{ flexWrap: 'wrap' }}>
          <DateRangePicker
            label="Date range"
            size="medium"
            value={{ start: parseDate(from), end: parseDate(to) }}
            onChange={onDateRangeChange}
          />
        </Flex>

        {data.daily.length === 0 && (
          <Alert
            status="info"
            title="No Copilot activity recorded for you in this date range."
          />
        )}

        <Tabs defaultSelectedKey="copilot-usage">
          <TabList>
            <Tab id="copilot-usage">Copilot Usage</Tab>
            <Tab id="code-generation">Code Generation</Tab>
            <Tab id="consumption">Consumption</Tab>
          </TabList>

          <TabPanel id="copilot-usage">
            <Flex
              direction="column"
              style={{ gap: 'var(--bui-space-6, 24px)', paddingTop: '16px' }}
            >
              <MyUsageSummary
                daily={data.daily}
                byModelFeature={data.byModelFeature}
              />

              <ChartCard title="Requests per Chat Mode">
                <RequestsByChatModeChart data={byFeature} />
              </ChartCard>

              <Grid.Root columns="12" gap="4">
                <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                  <ChartCard title="Code Completions">
                    <CodeCompletionsChart data={byFeature} />
                  </ChartCard>
                </Grid.Item>
                <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                  <ChartCard title="Code Completion Acceptance Rate">
                    <CodeCompletionsAcceptanceChart data={byFeature} />
                  </ChartCard>
                </Grid.Item>
              </Grid.Root>

              <ChartCard title="Model Usage per Day">
                <ModelUsagePerDayChart data={byModelFeature} />
              </ChartCard>

              <Grid.Root columns="12" gap="4">
                <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                  <ChartCard title="Chat Model Usage">
                    <ChatModelUsageDonut data={byModelFeature} />
                  </ChartCard>
                </Grid.Item>
                <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                  <ChartCard title="Model Usage per Chat Mode">
                    <ModelUsagePerChatModeChart data={byModelFeature} />
                  </ChartCard>
                </Grid.Item>
              </Grid.Root>

              <ChartCard title="Language Usage per Day">
                <LanguageUsagePerDayChart data={byLanguage} />
              </ChartCard>

              <Grid.Root columns="12" gap="4">
                <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                  <ChartCard title="Language Usage">
                    <LanguageUsageDonut data={byLanguage} />
                  </ChartCard>
                </Grid.Item>
                <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                  <ChartCard title="Model Usage per Language">
                    <ModelUsagePerLanguageChart data={byLanguageModel} />
                  </ChartCard>
                </Grid.Item>
              </Grid.Root>
            </Flex>
          </TabPanel>

          <TabPanel id="code-generation">
            <Flex
              direction="column"
              style={{ gap: 'var(--bui-space-6, 24px)', paddingTop: '16px' }}
            >
              <CodeGenerationSummary
                dailyTotals={dailyTotals}
                byFeature={byFeature}
              />

              <ChartCard title="Daily Total Lines Added and Deleted">
                <Text
                  variant="body-small"
                  color="secondary"
                  style={{ marginBottom: 8 }}
                >
                  Total lines of code you added and deleted across all modes
                </Text>
                <DailyLOCChart data={dailyTotals} />
              </ChartCard>

              <Grid.Root columns="12" gap="4">
                <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                  <ChartCard title="User-initiated Code Changes">
                    <UserLOCByFeatureChart data={byFeature} />
                  </ChartCard>
                </Grid.Item>
                <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                  <ChartCard title="Agent-initiated Code Changes">
                    <AgentLOCByFeatureChart data={byFeature} />
                  </ChartCard>
                </Grid.Item>
              </Grid.Root>

              <Grid.Root columns="12" gap="4">
                <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                  <ChartCard title="User-initiated Code Changes per Model">
                    <UserLOCByModelChart data={byModelFeature} />
                  </ChartCard>
                </Grid.Item>
                <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                  <ChartCard title="Agent-initiated Code Changes per Model">
                    <AgentLOCByModelChart data={byModelFeature} />
                  </ChartCard>
                </Grid.Item>
              </Grid.Root>

              <Grid.Root columns="12" gap="4">
                <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                  <ChartCard title="User-initiated Code Changes per Language">
                    <UserLOCByLanguageChart data={byLanguage} />
                  </ChartCard>
                </Grid.Item>
                <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                  <ChartCard title="Agent-initiated Code Changes per Language">
                    <AgentLOCByLanguageChart data={byLanguage} />
                  </ChartCard>
                </Grid.Item>
              </Grid.Root>
            </Flex>
          </TabPanel>

          <TabPanel id="consumption">
            <Flex
              direction="column"
              style={{ gap: 'var(--bui-space-6, 24px)', paddingTop: '16px' }}
            >
              <Text variant="body-small" color="secondary">
                AI credit consumption is derived from your per-day usage.
              </Text>

              <ConsumptionSummary dailyTotals={dailyTotals} />

              <ChartCard title="AI Credits Used per Day">
                <AiCreditsConsumptionChart data={dailyTotals} />
              </ChartCard>
            </Flex>
          </TabPanel>
        </Tabs>
      </Flex>
    </Container>
  );
}
