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
  Select,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Text,
  FullPage,
  Container,
} from '@backstage/ui';
import { InfoCard } from '@backstage/core-components';
import type { RangeValue } from '@react-types/shared';
import type { DateValue } from '@internationalized/date';
import { parseDate } from '@internationalized/date';
import { DateTime } from 'luxon';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { CopilotPage } from '../Pages/CopilotPage';
import { useV2DashboardData, useV2Teams } from './hooks';
import { CopilotUsageSummary } from './CopilotUsageSummary';
import { CodeGenerationSummary } from './CodeGenerationSummary';
import {
  IDEActiveUsersChart,
  AvgChatRequestsChart,
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
} from './charts';
import { MetricsScope } from '@backstage-community/plugin-copilot-common';

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

/** @public */
export const V2DashboardPage = () => {
  const configApi = useApi(configApiRef);
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
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>(
    undefined,
  );

  const params = useMemo(
    () => ({ type, entityId, from, to, team: selectedTeam }),
    [type, entityId, from, to, selectedTeam],
  );

  const { data } = useV2DashboardData(params);
  const teams = useV2Teams(type, entityId, from, to);

  const onDateRangeChange = useCallback(
    (value: RangeValue<DateValue> | null) => {
      if (value?.start && value?.end) {
        setFrom(value.start.toString());
        setTo(value.end.toString());
      }
    },
    [],
  );

  if (!entityId) {
    return (
      <CopilotPage
        title="Copilot Insights"
        subtitle="GitHub Copilot usage metrics"
        themeId="tool"
      >
        <Alert title="Configure either copilot.enterprise or copilot.organization to use the Copilot Insights dashboard." />
      </CopilotPage>
    );
  }

  return (
    <>
      <FullPage>
        <Container>
          <Flex direction="column" style={{ gap: 'var(--bui-space-6, 24px)' }}>
            {/* Filters row */}

            <Flex direction="row" gap="4" style={{ flexWrap: 'wrap' }}>
              <DateRangePicker
                label="Date range"
                size="medium"
                value={{ start: parseDate(from), end: parseDate(to) }}
                onChange={onDateRangeChange}
              />
              {teams.items.length > 0 && (
                <Flex direction="column" style={{ minWidth: 200, flex: 1 }}>
                  <Select
                    searchable
                    label="Team"
                    selectedKey={selectedTeam ?? ''}
                    onChange={key =>
                      setSelectedTeam(key ? String(key) : undefined)
                    }
                    options={[
                      { value: '', label: 'All teams' },
                      ...teams.items.map(team => ({
                        value: team,
                        label: team,
                      })),
                    ]}
                  />
                </Flex>
              )}
            </Flex>

            <Tabs defaultSelectedKey="copilot-usage">
              <TabList>
                <Tab id="copilot-usage">Copilot Usage</Tab>
                <Tab id="code-generation">Code Generation</Tab>
              </TabList>

              <TabPanel id="copilot-usage">
                <Flex
                  direction="column"
                  style={{
                    gap: 'var(--bui-space-6, 24px)',
                    paddingTop: '16px',
                  }}
                >
                  {/* Summary cards */}
                  <CopilotUsageSummary
                    dailyTotals={data.daily}
                    modelFeature={data.byModelFeature}
                  />

                  {/* IDE Daily + Weekly Active Users */}
                  <Grid.Root columns="12" gap="4">
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="IDE Daily Active Users">
                        <IDEActiveUsersChart
                          data={data.daily}
                          variant="daily"
                        />
                      </ChartCard>
                    </Grid.Item>
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="IDE Weekly Active Users">
                        <IDEActiveUsersChart
                          data={data.daily}
                          variant="weekly"
                        />
                      </ChartCard>
                    </Grid.Item>
                  </Grid.Root>

                  {/* Average Chat Requests per Active User */}
                  <ChartCard title="Average Chat Requests per Active User">
                    <AvgChatRequestsChart data={data.daily} />
                  </ChartCard>

                  {/* Requests per Chat Mode */}
                  <ChartCard title="Requests per Chat Mode">
                    <RequestsByChatModeChart data={data.byFeature} />
                  </ChartCard>

                  {/* Code Completions + Acceptance Rate */}
                  <Grid.Root columns="12" gap="4">
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="Code Completions">
                        <CodeCompletionsChart data={data.byFeature} />
                      </ChartCard>
                    </Grid.Item>
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="Code Completion Acceptance Rate">
                        <CodeCompletionsAcceptanceChart data={data.byFeature} />
                      </ChartCard>
                    </Grid.Item>
                  </Grid.Root>

                  {/* Model Usage per Day */}
                  <ChartCard title="Model Usage per Day">
                    <ModelUsagePerDayChart data={data.byModelFeature} />
                  </ChartCard>

                  {/* Chat Model Usage Donut + Model Usage per Chat Mode */}
                  <Grid.Root columns="12" gap="4">
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="Chat Model Usage">
                        <ChatModelUsageDonut data={data.byModelFeature} />
                      </ChartCard>
                    </Grid.Item>
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="Model Usage per Chat Mode">
                        <ModelUsagePerChatModeChart
                          data={data.byModelFeature}
                        />
                      </ChartCard>
                    </Grid.Item>
                  </Grid.Root>

                  {/* Language Usage per Day */}
                  <ChartCard title="Language Usage per Day">
                    <LanguageUsagePerDayChart data={data.byLanguage} />
                  </ChartCard>

                  {/* Language Donut + Model Usage per Language */}
                  <Grid.Root columns="12" gap="4">
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="Language Usage">
                        <LanguageUsageDonut data={data.byLanguage} />
                      </ChartCard>
                    </Grid.Item>
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="Model Usage per Language">
                        <ModelUsagePerLanguageChart
                          data={data.byLanguageModel}
                        />
                      </ChartCard>
                    </Grid.Item>
                  </Grid.Root>
                </Flex>
              </TabPanel>

              <TabPanel id="code-generation">
                <Flex
                  direction="column"
                  style={{
                    gap: 'var(--bui-space-6, 24px)',
                    paddingTop: '16px',
                  }}
                >
                  {/* Row 1: Summary stats */}
                  <CodeGenerationSummary
                    dailyTotals={data.daily}
                    byFeature={data.byFeature}
                  />

                  {/* Row 2: Daily total lines added and deleted */}
                  <ChartCard title="Daily Total Lines Added and Deleted">
                    <Text
                      variant="body-small"
                      color="secondary"
                      style={{ marginBottom: 8 }}
                    >
                      Total lines of code added and deleted from the codebase
                      across all modes
                    </Text>
                    <DailyLOCChart data={data.daily} />
                  </ChartCard>

                  {/* Row 3: User-initiated vs Agent-initiated by feature */}
                  <Grid.Root columns="12" gap="4">
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="User-initiated Code Changes">
                        <Text
                          variant="body-small"
                          color="secondary"
                          style={{ marginBottom: 8 }}
                        >
                          Lines of code suggested and added by users through
                          code completions and chat panel actions
                        </Text>
                        <UserLOCByFeatureChart data={data.byFeature} />
                      </ChartCard>
                    </Grid.Item>
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="Agent-initiated Code Changes">
                        <Text
                          variant="body-small"
                          color="secondary"
                          style={{ marginBottom: 8 }}
                        >
                          Lines of code automatically added and deleted by
                          agents combining edit, agent, and custom modes
                        </Text>
                        <AgentLOCByFeatureChart data={data.byFeature} />
                      </ChartCard>
                    </Grid.Item>
                  </Grid.Root>

                  {/* Row 4: User-initiated vs Agent-initiated per model (top 5 + others) */}
                  <Grid.Root columns="12" gap="4">
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="User-initiated Code Changes per Model">
                        <Text
                          variant="body-small"
                          color="secondary"
                          style={{ marginBottom: 8 }}
                        >
                          Lines of code suggested and added by users, grouped by
                          model used
                        </Text>
                        <UserLOCByModelChart data={data.byModelFeature} />
                      </ChartCard>
                    </Grid.Item>
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="Agent-initiated Code Changes per Model">
                        <Text
                          variant="body-small"
                          color="secondary"
                          style={{ marginBottom: 8 }}
                        >
                          Lines of code added and deleted by agents, grouped by
                          model used
                        </Text>
                        <AgentLOCByModelChart data={data.byModelFeature} />
                      </ChartCard>
                    </Grid.Item>
                  </Grid.Root>

                  {/* Row 5: User-initiated vs Agent-initiated per language (top 5 + others) */}
                  <Grid.Root columns="12" gap="4">
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="User-initiated Code Changes per Language">
                        <Text
                          variant="body-small"
                          color="secondary"
                          style={{ marginBottom: 8 }}
                        >
                          Lines of code suggested and added by users, grouped by
                          language used
                        </Text>
                        <UserLOCByLanguageChart data={data.byLanguage} />
                      </ChartCard>
                    </Grid.Item>
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <ChartCard title="Agent-initiated Code Changes per Language">
                        <Text
                          variant="body-small"
                          color="secondary"
                          style={{ marginBottom: 8 }}
                        >
                          Lines of code added and deleted by agents, grouped by
                          language used
                        </Text>
                        <AgentLOCByLanguageChart data={data.byLanguage} />
                      </ChartCard>
                    </Grid.Item>
                  </Grid.Root>
                </Flex>
              </TabPanel>
            </Tabs>
          </Flex>
        </Container>
      </FullPage>
    </>
  );
};
