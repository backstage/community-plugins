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

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  ToggleButton,
  ToggleButtonGroup,
  FullPage,
  Container,
  Tooltip,
  TooltipTrigger,
  VisuallyHidden,
} from '@backstage/ui';
import { InfoCard } from '@backstage/core-components';
import type { RangeValue } from '@react-types/shared';
import type { DateValue } from '@internationalized/date';
import { parseDate } from '@internationalized/date';
import { DateTime } from 'luxon';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { CopilotPage } from '../Pages/CopilotPage';
import { useV2CostCenters, useV2DashboardData, useV2Teams } from './hooks';
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
  AiCreditsConsumptionChart,
} from './charts';
import { ConsumptionSummary } from './ConsumptionSummary';
import { CustomizationMetrics } from './CustomizationMetrics';
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

type FilterTarget = 'costCenter' | 'team';
type CostCenterSelection =
  | { kind: 'all' }
  | { kind: 'costCenter'; id: string }
  | { kind: 'noCostCenter' };

const ALL_COST_CENTERS_OPTION = 'all';
const UNASSIGNED_OPTION = 'no-cost-center';
const COST_CENTER_OPTION_PREFIX = 'cost-center:';

const getCostCenterOptionValue = (id: string) =>
  `${COST_CENTER_OPTION_PREFIX}${id}`;

const getCostCenterSelectionOptionValue = (
  selection: CostCenterSelection,
): string => {
  if (selection.kind === 'all') {
    return ALL_COST_CENTERS_OPTION;
  }
  if (selection.kind === 'noCostCenter') {
    return UNASSIGNED_OPTION;
  }
  return getCostCenterOptionValue(selection.id);
};

/** @public */
export const V2DashboardPage = () => {
  const configApi = useApi(configApiRef);
  const enterprise = configApi.getOptionalString('copilot.enterprise');
  const organization = configApi.getOptionalString('copilot.organization');
  const ingestTeams =
    configApi.getOptionalBoolean('copilot.ingestTeams') ?? false;
  const ingestCostCenters =
    configApi.getOptionalBoolean('copilot.ingestCostCenters') ?? false;
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
  const costCenterScopeEnabled =
    ingestCostCenters &&
    (type === 'enterprise' || Boolean(enterprise && organization));
  const teamScopeEnabled = ingestTeams;
  const bothFilterTargetsAvailable = costCenterScopeEnabled && teamScopeEnabled;

  const [from, setFrom] = useState(
    DateTime.now().minus({ days: 30 }).toFormat('yyyy-MM-dd'),
  );
  const [to, setTo] = useState(DateTime.now().toFormat('yyyy-MM-dd'));
  const scopeKey = JSON.stringify([type, entityId]);
  const [filterTargetSelection, setFilterTargetSelection] = useState<{
    scopeKey: string;
    value: FilterTarget;
  }>({ scopeKey, value: 'team' });
  const selectedFilterTarget =
    filterTargetSelection.scopeKey === scopeKey
      ? filterTargetSelection.value
      : 'team';
  let filterTarget: FilterTarget | undefined;
  if (bothFilterTargetsAvailable) {
    filterTarget = selectedFilterTarget;
  } else if (costCenterScopeEnabled) {
    filterTarget = 'costCenter';
  } else if (teamScopeEnabled) {
    filterTarget = 'team';
  }
  const [teamSelection, setTeamSelection] = useState<{
    scopeKey: string;
    value: string | undefined;
  }>({ scopeKey, value: undefined });
  const [costCenterSelection, setCostCenterSelection] = useState<{
    scopeKey: string;
    value: CostCenterSelection;
  }>({ scopeKey, value: { kind: 'all' } });
  const selectedTeam =
    teamSelection.scopeKey === scopeKey ? teamSelection.value : undefined;
  const selectedCostCenter = useMemo<CostCenterSelection>(
    () =>
      costCenterScopeEnabled && costCenterSelection.scopeKey === scopeKey
        ? costCenterSelection.value
        : { kind: 'all' },
    [
      costCenterScopeEnabled,
      costCenterSelection.scopeKey,
      costCenterSelection.value,
      scopeKey,
    ],
  );
  const activeTeam = filterTarget === 'team' ? selectedTeam : undefined;
  const activeCostCenter =
    filterTarget === 'costCenter' && selectedCostCenter.kind === 'costCenter'
      ? selectedCostCenter.id
      : undefined;
  const activeNoCostCenter =
    filterTarget === 'costCenter' && selectedCostCenter.kind === 'noCostCenter';
  const setSelectedTeam = useCallback(
    (value: string | undefined) => {
      setTeamSelection({ scopeKey, value });
      setCostCenterSelection({ scopeKey, value: { kind: 'all' } });
    },
    [scopeKey],
  );
  const setSelectedCostCenter = useCallback(
    (value: CostCenterSelection) => {
      setCostCenterSelection({ scopeKey, value });
      setTeamSelection({ scopeKey, value: undefined });
    },
    [scopeKey],
  );
  const selectFilterTarget = useCallback(
    (value: FilterTarget) => {
      setFilterTargetSelection({ scopeKey, value });
      if (value === 'costCenter') {
        setTeamSelection({ scopeKey, value: undefined });
      } else {
        setCostCenterSelection({ scopeKey, value: { kind: 'all' } });
      }
    },
    [scopeKey],
  );

  const params = useMemo(
    () => ({
      type,
      entityId,
      from,
      to,
      team: activeTeam,
      costCenter: activeCostCenter,
    }),
    [type, entityId, from, to, activeTeam, activeCostCenter],
  );

  const { data } = useV2DashboardData(params, activeNoCostCenter);
  const costCenters = useV2CostCenters(type, entityId, from, to);
  const teams = useV2Teams(type, entityId, from, to);
  const costCentersKnownEmpty =
    !costCenters.loading &&
    !costCenters.error &&
    costCenters.items.length === 0 &&
    !costCenters.hasUsersWithoutCostCenter;
  const teamsKnownEmpty =
    !teams.loading && !teams.error && teams.items.length === 0;
  const costCentersHaveOptions =
    !costCenters.loading &&
    !costCenters.error &&
    (costCenters.items.length > 0 || costCenters.hasUsersWithoutCostCenter);
  const teamsHaveOptions =
    !teams.loading && !teams.error && teams.items.length > 0;
  const filterDescriptionId = useId();
  const costCentersTooltipRef = useRef<HTMLDivElement>(null);
  const teamsTooltipRef = useRef<HTMLDivElement>(null);
  const [costCentersTooltipOpen, setCostCentersTooltipOpen] = useState(false);
  const [teamsTooltipOpen, setTeamsTooltipOpen] = useState(false);
  const costCentersEmptyDescription =
    'No cost centers with enough Copilot users in the selected date range';
  const teamsEmptyDescription =
    'No teams with Copilot data in the selected date range';

  useEffect(() => {
    if (!costCentersKnownEmpty) {
      setCostCentersTooltipOpen(false);
    }
    if (!teamsKnownEmpty) {
      setTeamsTooltipOpen(false);
    }
  }, [costCentersKnownEmpty, teamsKnownEmpty]);

  const costCenterOptions = useMemo(() => {
    const options = [...costCenters.items]
      .sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id))
      .map(({ id, name }) => ({
        value: getCostCenterOptionValue(id),
        label: name ?? id,
      }));
    if (costCenters.hasUsersWithoutCostCenter) {
      options.push({
        value: UNASSIGNED_OPTION,
        label: 'No cost center',
      });
    }
    return [
      { value: ALL_COST_CENTERS_OPTION, label: 'All cost centers' },
      ...options,
    ];
  }, [costCenters.hasUsersWithoutCostCenter, costCenters.items]);

  useEffect(() => {
    if (teamSelection.scopeKey !== scopeKey) {
      setTeamSelection({ scopeKey, value: undefined });
    }
    if (costCenterSelection.scopeKey !== scopeKey) {
      setCostCenterSelection({ scopeKey, value: { kind: 'all' } });
    }
    if (filterTargetSelection.scopeKey !== scopeKey) {
      setFilterTargetSelection({ scopeKey, value: 'team' });
    }
  }, [
    scopeKey,
    teamSelection.scopeKey,
    costCenterSelection.scopeKey,
    filterTargetSelection.scopeKey,
  ]);

  useEffect(() => {
    if (
      selectedTeam &&
      !teams.loading &&
      (teams.error || !teams.items.includes(selectedTeam))
    ) {
      setSelectedTeam(undefined);
    }
  }, [selectedTeam, setSelectedTeam, teams.error, teams.items, teams.loading]);

  useEffect(() => {
    if (
      selectedCostCenter.kind === 'costCenter' &&
      !costCenters.loading &&
      (costCenters.error ||
        !costCenters.items.some(({ id }) => id === selectedCostCenter.id))
    ) {
      setSelectedCostCenter({ kind: 'all' });
    } else if (
      selectedCostCenter.kind === 'noCostCenter' &&
      !costCenters.loading &&
      (costCenters.error || !costCenters.hasUsersWithoutCostCenter)
    ) {
      setSelectedCostCenter({ kind: 'all' });
    }
  }, [
    costCenters.error,
    costCenters.hasUsersWithoutCostCenter,
    costCenters.items,
    costCenters.loading,
    selectedCostCenter,
    setSelectedCostCenter,
  ]);

  useEffect(() => {
    if (!bothFilterTargetsAvailable) {
      return;
    }

    if (costCentersKnownEmpty && teamsKnownEmpty) {
      if (selectedFilterTarget !== 'costCenter') {
        selectFilterTarget('costCenter');
      }
      return;
    }

    if (
      selectedFilterTarget === 'costCenter' &&
      costCentersKnownEmpty &&
      teamsHaveOptions
    ) {
      selectFilterTarget('team');
    } else if (
      selectedFilterTarget === 'team' &&
      teamsKnownEmpty &&
      costCentersHaveOptions
    ) {
      selectFilterTarget('costCenter');
    }
  }, [
    bothFilterTargetsAvailable,
    costCentersHaveOptions,
    costCentersKnownEmpty,
    selectedFilterTarget,
    selectFilterTarget,
    teamsHaveOptions,
    teamsKnownEmpty,
  ]);

  const showFilter =
    filterTarget !== undefined &&
    (bothFilterTargetsAvailable ||
      (filterTarget === 'costCenter'
        ? costCentersHaveOptions
        : teams.items.length > 0));

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
            {showFilter && (
              <Flex
                direction="column"
                style={{
                  minWidth: 200,
                  flex: 1,
                  gap: 'var(--bui-space-4, 16px)',
                }}
              >
                {bothFilterTargetsAvailable && (
                  <>
                    <Flex direction="row" align="center" gap="2">
                      <Text variant="body-small">Filter by</Text>
                      <ToggleButtonGroup
                        aria-label="Filter by"
                        selectionMode="single"
                        disallowEmptySelection
                        selectedKeys={[selectedFilterTarget]}
                        onSelectionChange={keys => {
                          const [value] = Array.from(keys);
                          if (value === 'costCenter' || value === 'team') {
                            selectFilterTarget(value);
                          }
                        }}
                        orientation="horizontal"
                      >
                        {costCentersKnownEmpty ? (
                          <TooltipTrigger
                            delay={0}
                            isOpen={costCentersTooltipOpen}
                            onOpenChange={setCostCentersTooltipOpen}
                          >
                            <Flex
                              direction="row"
                              ref={costCentersTooltipRef}
                              aria-describedby={`${filterDescriptionId}-cost-centers`}
                              onMouseEnter={() =>
                                setCostCentersTooltipOpen(true)
                              }
                              onMouseLeave={() =>
                                setCostCentersTooltipOpen(false)
                              }
                            >
                              <ToggleButton
                                id="costCenter"
                                isDisabled
                                aria-describedby={`${filterDescriptionId}-cost-centers`}
                              >
                                Cost center
                              </ToggleButton>
                            </Flex>
                            <Tooltip
                              placement="top"
                              triggerRef={costCentersTooltipRef}
                            >
                              {costCentersEmptyDescription}
                            </Tooltip>
                          </TooltipTrigger>
                        ) : (
                          <ToggleButton id="costCenter">
                            Cost center
                          </ToggleButton>
                        )}
                        {teamsKnownEmpty ? (
                          <TooltipTrigger
                            delay={0}
                            isOpen={teamsTooltipOpen}
                            onOpenChange={setTeamsTooltipOpen}
                          >
                            <Flex
                              direction="row"
                              ref={teamsTooltipRef}
                              aria-describedby={`${filterDescriptionId}-teams`}
                              onMouseEnter={() => setTeamsTooltipOpen(true)}
                              onMouseLeave={() => setTeamsTooltipOpen(false)}
                            >
                              <ToggleButton
                                id="team"
                                isDisabled
                                aria-describedby={`${filterDescriptionId}-teams`}
                              >
                                Team
                              </ToggleButton>
                            </Flex>
                            <Tooltip
                              placement="right"
                              triggerRef={teamsTooltipRef}
                            >
                              {teamsEmptyDescription}
                            </Tooltip>
                          </TooltipTrigger>
                        ) : (
                          <ToggleButton id="team">Team</ToggleButton>
                        )}
                      </ToggleButtonGroup>
                    </Flex>
                    <VisuallyHidden id={`${filterDescriptionId}-cost-centers`}>
                      {costCentersEmptyDescription}
                    </VisuallyHidden>
                    <VisuallyHidden id={`${filterDescriptionId}-teams`}>
                      {teamsEmptyDescription}
                    </VisuallyHidden>
                  </>
                )}
                {filterTarget === 'costCenter' && (
                  <Select
                    searchable
                    isDisabled={costCenters.loading}
                    label="Cost center"
                    selectedKey={getCostCenterSelectionOptionValue(
                      selectedCostCenter,
                    )}
                    onChange={key => {
                      const value = key ? String(key) : ALL_COST_CENTERS_OPTION;
                      if (value === UNASSIGNED_OPTION) {
                        setSelectedCostCenter({ kind: 'noCostCenter' });
                      } else if (value === ALL_COST_CENTERS_OPTION) {
                        setSelectedCostCenter({ kind: 'all' });
                      } else if (value.startsWith(COST_CENTER_OPTION_PREFIX)) {
                        setSelectedCostCenter({
                          kind: 'costCenter',
                          id: value.slice(COST_CENTER_OPTION_PREFIX.length),
                        });
                      }
                    }}
                    options={costCenterOptions}
                  />
                )}
                {filterTarget === 'team' && (
                  <Select
                    searchable
                    isDisabled={teams.loading}
                    label="Team"
                    selectedKey={activeTeam ?? ''}
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
                )}
              </Flex>
            )}
          </Flex>

          <Tabs defaultSelectedKey="copilot-usage">
            <TabList>
              <Tab id="copilot-usage">Copilot Usage</Tab>
              <Tab id="code-generation">Code Generation</Tab>
              <Tab id="customizations">Agent Harness</Tab>
              {(activeTeam || activeCostCenter || activeNoCostCenter) && (
                <Tab id="consumption">Consumption</Tab>
              )}
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
                        from={from}
                        to={to}
                      />
                    </ChartCard>
                  </Grid.Item>
                  <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                    <ChartCard title="IDE Weekly Active Users">
                      <IDEActiveUsersChart
                        data={data.daily}
                        variant="weekly"
                        from={from}
                        to={to}
                      />
                    </ChartCard>
                  </Grid.Item>
                </Grid.Root>

                {/* Average Chat Requests per Active User */}
                <ChartCard title="Average Chat Requests per Active User">
                  <AvgChatRequestsChart data={data.daily} from={from} to={to} />
                </ChartCard>

                {/* Requests per Chat Mode */}
                <ChartCard title="Requests per Chat Mode">
                  <RequestsByChatModeChart
                    data={data.byFeature}
                    from={from}
                    to={to}
                  />
                </ChartCard>

                {/* Code Completions + Acceptance Rate */}
                <Grid.Root columns="12" gap="4">
                  <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                    <ChartCard title="Code Completions">
                      <CodeCompletionsChart
                        data={data.byFeature}
                        from={from}
                        to={to}
                      />
                    </ChartCard>
                  </Grid.Item>
                  <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                    <ChartCard title="Code Completion Acceptance Rate">
                      <CodeCompletionsAcceptanceChart
                        data={data.byFeature}
                        from={from}
                        to={to}
                      />
                    </ChartCard>
                  </Grid.Item>
                </Grid.Root>

                {/* Model Usage per Day */}
                <ChartCard title="Model Usage per Day">
                  <ModelUsagePerDayChart
                    data={data.byModelFeature}
                    from={from}
                    to={to}
                  />
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
                      <ModelUsagePerChatModeChart data={data.byModelFeature} />
                    </ChartCard>
                  </Grid.Item>
                </Grid.Root>

                {/* Language Usage per Day */}
                <ChartCard title="Language Usage per Day">
                  <LanguageUsagePerDayChart
                    data={data.byLanguage}
                    from={from}
                    to={to}
                  />
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
                      <ModelUsagePerLanguageChart data={data.byLanguageModel} />
                    </ChartCard>
                  </Grid.Item>
                </Grid.Root>
              </Flex>
            </TabPanel>

            <TabPanel id="customizations">
              <Flex
                direction="column"
                style={{
                  gap: 'var(--bui-space-6, 24px)',
                  paddingTop: '16px',
                }}
              >
                <Text variant="body-small" color="secondary">
                  Named skills, agents, MCP servers, commands, plugins, and
                  future customization categories reported by GitHub.
                </Text>
                <CustomizationMetrics
                  metrics={data.customizationMetrics}
                  summaries={data.customizationSummaries}
                  from={from}
                  to={to}
                />
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
                  <DailyLOCChart data={data.daily} from={from} to={to} />
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
                        Lines of code suggested and added by users through code
                        completions and chat panel actions
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
                        Lines of code automatically added and deleted by agents
                        combining edit, agent, and custom modes
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

            {(activeTeam || activeCostCenter || activeNoCostCenter) && (
              <TabPanel id="consumption">
                <Flex
                  direction="column"
                  style={{
                    gap: 'var(--bui-space-6, 24px)',
                    paddingTop: '16px',
                  }}
                >
                  <Text variant="body-small" color="secondary">
                    AI credit consumption is derived from per-user data and is
                    available for team or cost center views.
                  </Text>

                  {/* Summary stat */}
                  <ConsumptionSummary dailyTotals={data.daily} />

                  {/* AI credits used per day */}
                  <ChartCard title="AI Credits Used per Day">
                    <AiCreditsConsumptionChart
                      data={data.daily}
                      from={from}
                      to={to}
                    />
                  </ChartCard>
                </Flex>
              </TabPanel>
            )}
          </Tabs>
        </Flex>
      </Container>
    </FullPage>
  );
};
