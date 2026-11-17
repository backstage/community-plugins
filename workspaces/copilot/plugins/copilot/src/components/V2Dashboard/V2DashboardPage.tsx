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
  Button,
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
import {
  useV2CostCenters,
  useV2DashboardData,
  useV2OrganizationTeamDashboardData,
  useV2OrganizationTeamOptions,
  useV2Teams,
} from './hooks';
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

type FilterTarget =
  | 'costCenter'
  | 'team'
  | 'enterpriseTeam'
  | 'organizationTeam';
type TeamFilterTarget = Exclude<FilterTarget, 'costCenter'>;
type FilterTargetToggleProps = {
  id: FilterTarget;
  label: string;
  description?: string;
  emptyDescription?: string;
  isEmpty: boolean;
};
type CostCenterSelection =
  | { kind: 'all' }
  | { kind: 'costCenter'; id: string }
  | { kind: 'noCostCenter' };

const ALL_COST_CENTERS_OPTION = 'all';
const ALL_ORGANIZATIONS_OPTION = 'all-organizations';
const UNASSIGNED_OPTION = 'no-cost-center';
const COST_CENTER_OPTION_PREFIX = 'cost-center:';
const ORGANIZATION_OPTION_PREFIX = 'organization:';
const TEAM_TARGET_LABELS: Record<TeamFilterTarget, string> = {
  team: 'Team',
  enterpriseTeam: 'Enterprise team',
  organizationTeam: 'Organization team',
};

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

const getListAvailability = (result: {
  loading: boolean;
  error?: Error;
  items: unknown[];
}) => {
  const isLoaded = !result.loading && !result.error;
  return {
    knownEmpty: isLoaded && result.items.length === 0,
    hasOptions: isLoaded && result.items.length > 0,
  };
};

function FilterTargetToggle({
  id,
  label,
  description,
  emptyDescription,
  isEmpty,
}: FilterTargetToggleProps) {
  const tooltipRef = useRef<HTMLElement | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const descriptionId = useId();
  const tooltipText = [description, isEmpty ? emptyDescription : undefined]
    .filter(Boolean)
    .join(' ');

  if (!tooltipText) {
    return <ToggleButton id={id}>{label}</ToggleButton>;
  }

  return (
    <>
      <TooltipTrigger
        delay={0}
        isOpen={tooltipOpen}
        onOpenChange={setTooltipOpen}
      >
        {isEmpty ? (
          <Flex
            direction="row"
            ref={node => {
              tooltipRef.current = node;
            }}
            aria-describedby={descriptionId}
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
          >
            <ToggleButton id={id} isDisabled aria-describedby={descriptionId}>
              {label}
            </ToggleButton>
          </Flex>
        ) : (
          <ToggleButton
            id={id}
            ref={node => {
              tooltipRef.current = node;
            }}
            aria-describedby={descriptionId}
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
            onFocus={() => setTooltipOpen(true)}
            onBlur={() => setTooltipOpen(false)}
          >
            {label}
          </ToggleButton>
        )}
        <Tooltip placement="top" shouldFlip={false} triggerRef={tooltipRef}>
          {tooltipText}
        </Tooltip>
      </TooltipTrigger>
      <VisuallyHidden id={descriptionId}>{tooltipText}</VisuallyHidden>
    </>
  );
}

/** @public */
export const V2DashboardPage = () => {
  const configApi = useApi(configApiRef);
  const enterprise = configApi.getOptionalString('copilot.enterprise');
  const organization = configApi.getOptionalString('copilot.organization');
  const ingestTeams =
    configApi.getOptionalBoolean('copilot.ingestTeams') ?? false;
  const ingestCostCenters =
    configApi.getOptionalBoolean('copilot.ingestCostCenters') ?? false;
  const ingestOrganizationTeamReports =
    configApi.getOptionalBoolean('copilot.ingestOrganizationTeamReports') ??
    false;
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
  const organizationTeamScopeEnabled =
    type === 'enterprise' &&
    Boolean(
      enterprise &&
        (ingestOrganizationTeamReports || (organization && ingestTeams)),
    );
  const defaultTeamTarget: FilterTarget =
    type === 'enterprise' ? 'enterpriseTeam' : 'team';
  const teamTargets = useMemo<FilterTarget[]>(
    () => [
      ...(ingestTeams ? [defaultTeamTarget] : []),
      ...(organizationTeamScopeEnabled ? ['organizationTeam' as const] : []),
    ],
    [defaultTeamTarget, ingestTeams, organizationTeamScopeEnabled],
  );
  const filterTargets = useMemo<FilterTarget[]>(
    () => [
      ...(costCenterScopeEnabled ? ['costCenter' as const] : []),
      ...teamTargets,
    ],
    [costCenterScopeEnabled, teamTargets],
  );
  const filterTargetToggleAvailable = filterTargets.length > 1;
  const fallbackTeamTarget = teamTargets[0] ?? defaultTeamTarget;

  const [from, setFrom] = useState(
    DateTime.now().minus({ days: 30 }).toFormat('yyyy-MM-dd'),
  );
  const [to, setTo] = useState(DateTime.now().toFormat('yyyy-MM-dd'));
  const scopeKey = JSON.stringify([type, entityId]);
  const [filterTargetSelection, setFilterTargetSelection] = useState<{
    scopeKey: string;
    value: FilterTarget;
  }>({ scopeKey, value: defaultTeamTarget });
  const selectedFilterTarget =
    filterTargetSelection.scopeKey === scopeKey &&
    filterTargets.includes(filterTargetSelection.value)
      ? filterTargetSelection.value
      : fallbackTeamTarget;
  const organizationTeamSelectionScopeKey = JSON.stringify([
    scopeKey,
    'organizationTeam',
  ]);
  const [
    organizationTeamOrganizationSelection,
    setOrganizationTeamOrganizationSelection,
  ] = useState<{
    scopeKey: string;
    value: string | undefined;
  }>({
    scopeKey: organizationTeamSelectionScopeKey,
    value: undefined,
  });
  const selectedOrganizationTeamOrganization =
    organizationTeamOrganizationSelection.scopeKey ===
    organizationTeamSelectionScopeKey
      ? organizationTeamOrganizationSelection.value
      : undefined;
  let filterTarget: FilterTarget | undefined;
  if (filterTargetToggleAvailable) {
    filterTarget = selectedFilterTarget;
  } else if (costCenterScopeEnabled) {
    filterTarget = 'costCenter';
  } else if (ingestTeams) {
    filterTarget = defaultTeamTarget;
  } else if (organizationTeamScopeEnabled) {
    filterTarget = 'organizationTeam';
  }
  const teamSelectionScopeKey = JSON.stringify([
    scopeKey,
    filterTarget,
    filterTarget === 'organizationTeam'
      ? selectedOrganizationTeamOrganization
      : undefined,
  ]);
  const [teamSelection, setTeamSelection] = useState<{
    scopeKey: string;
    value: string | undefined;
  }>({ scopeKey, value: undefined });
  const [costCenterSelection, setCostCenterSelection] = useState<{
    scopeKey: string;
    value: CostCenterSelection;
  }>({ scopeKey, value: { kind: 'all' } });
  const selectedTeam =
    teamSelection.scopeKey === teamSelectionScopeKey
      ? teamSelection.value
      : undefined;
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
  const isTeamTarget =
    filterTarget === 'team' ||
    filterTarget === 'enterpriseTeam' ||
    filterTarget === 'organizationTeam';
  const activeTeam = isTeamTarget ? selectedTeam : undefined;
  const activeCostCenter =
    filterTarget === 'costCenter' && selectedCostCenter.kind === 'costCenter'
      ? selectedCostCenter.id
      : undefined;
  const activeNoCostCenter =
    filterTarget === 'costCenter' && selectedCostCenter.kind === 'noCostCenter';
  const setSelectedTeam = useCallback(
    (value: string | undefined) => {
      setTeamSelection({ scopeKey: teamSelectionScopeKey, value });
      setCostCenterSelection({ scopeKey, value: { kind: 'all' } });
    },
    [scopeKey, teamSelectionScopeKey],
  );
  const setSelectedCostCenter = useCallback(
    (value: CostCenterSelection) => {
      setCostCenterSelection({ scopeKey, value });
      setTeamSelection({
        scopeKey: teamSelectionScopeKey,
        value: undefined,
      });
    },
    [scopeKey, teamSelectionScopeKey],
  );
  const setSelectedOrganizationTeamOrganization = useCallback(
    (value: string | undefined) => {
      setOrganizationTeamOrganizationSelection({
        scopeKey: organizationTeamSelectionScopeKey,
        value,
      });
      setTeamSelection({
        scopeKey: JSON.stringify([scopeKey, 'organizationTeam', value]),
        value: undefined,
      });
    },
    [organizationTeamSelectionScopeKey, scopeKey],
  );
  const selectFilterTarget = useCallback(
    (value: FilterTarget) => {
      if (value === selectedFilterTarget) {
        return;
      }
      setFilterTargetSelection({ scopeKey, value });
      if (value !== 'costCenter') {
        setCostCenterSelection({ scopeKey, value: { kind: 'all' } });
      }
      setTeamSelection({
        scopeKey: JSON.stringify([scopeKey, value, undefined]),
        value: undefined,
      });
      if (value === 'organizationTeam') {
        setOrganizationTeamOrganizationSelection({
          scopeKey: organizationTeamSelectionScopeKey,
          value: undefined,
        });
      }
    },
    [
      organizationTeamSelectionScopeKey,
      setOrganizationTeamOrganizationSelection,
      scopeKey,
      selectedFilterTarget,
    ],
  );

  const dashboardType: MetricsScope = type;
  const dashboardEntityId = entityId;
  const params = useMemo(
    () => ({
      type: dashboardType,
      entityId: dashboardEntityId,
      from,
      to,
      team: activeTeam,
      costCenter: activeCostCenter,
    }),
    [dashboardType, dashboardEntityId, from, to, activeTeam, activeCostCenter],
  );

  const dashboard = useV2DashboardData(
    params,
    activeNoCostCenter,
    filterTarget !== 'organizationTeam',
  );
  const organizationTeamDashboard = useV2OrganizationTeamDashboardData(
    {
      from,
      to,
      organization: selectedOrganizationTeamOrganization,
      team: activeTeam,
    },
    filterTarget === 'organizationTeam',
  );
  const data =
    filterTarget === 'organizationTeam'
      ? organizationTeamDashboard.data
      : dashboard.data;
  const organizationTeamHasData = [
    data.daily,
    data.byFeature,
    data.byLanguage,
    data.byModelFeature,
    data.byLanguageModel,
    data.prMetrics,
    data.customizationMetrics,
    data.customizationSummaries,
  ].some(rows => rows.length > 0);
  const costCenters = useV2CostCenters(type, entityId, from, to);
  const enterpriseTeams = useV2Teams(type, entityId, from, to);
  const organizationTeamOptions = useV2OrganizationTeamOptions(
    from,
    to,
    selectedOrganizationTeamOrganization,
    organizationTeamScopeEnabled,
  );
  const showOrganizationTeamEmptyState =
    filterTarget === 'organizationTeam' &&
    !organizationTeamOptions.loading &&
    !organizationTeamOptions.error &&
    !organizationTeamDashboard.loading &&
    !organizationTeamDashboard.error &&
    !organizationTeamHasData;
  const teams =
    filterTarget === 'organizationTeam'
      ? {
          items: organizationTeamOptions.teams,
          loading:
            organizationTeamOptions.loading ||
            !organizationTeamOptions.teamsReady,
          error: organizationTeamOptions.error,
        }
      : enterpriseTeams;
  const costCenterAvailability = getListAvailability(costCenters);
  const costCentersHaveOptions =
    costCenterAvailability.hasOptions ||
    (!costCenters.loading &&
      !costCenters.error &&
      costCenters.hasUsersWithoutCostCenter);
  const enterpriseTeamAvailability = getListAvailability(enterpriseTeams);
  const organizationTeamAvailability = {
    knownEmpty:
      !organizationTeamOptions.loading &&
      !organizationTeamOptions.error &&
      !organizationTeamOptions.hasPendingOrganizations &&
      organizationTeamOptions.organizations.length === 0,
    hasOptions:
      !organizationTeamOptions.loading &&
      !organizationTeamOptions.error &&
      organizationTeamOptions.organizations.length > 0,
  };
  const targetAvailability: Record<
    FilterTarget,
    ReturnType<typeof getListAvailability>
  > = {
    costCenter: {
      knownEmpty:
        costCenterAvailability.knownEmpty &&
        !costCenters.hasUsersWithoutCostCenter,
      hasOptions: costCentersHaveOptions,
    },
    team: enterpriseTeamAvailability,
    enterpriseTeam: enterpriseTeamAvailability,
    organizationTeam: organizationTeamAvailability,
  };
  const selectedTargetKnownEmpty = filterTarget
    ? targetAvailability[filterTarget].knownEmpty
    : false;
  const targetWithOptions = filterTargets.find(
    target => targetAvailability[target].hasOptions,
  );
  const allTargetsKnownEmpty = filterTargets.every(
    target => targetAvailability[target].knownEmpty,
  );
  const costCentersEmptyDescription =
    'No cost centers with enough Copilot users in the selected date range';
  const teamsEmptyDescription =
    'No teams with Copilot data in the selected date range';
  const enterpriseTeamDescription =
    'Teams defined at the enterprise level in GitHub. They can include members from any organization in the enterprise.';
  const organizationTeamDescription =
    'Teams defined in an organization. All organizations combines matching team slugs across the enterprise.';
  const teamTargetDescriptions: Partial<Record<TeamFilterTarget, string>> = {
    enterpriseTeam: enterpriseTeamDescription,
    organizationTeam: organizationTeamDescription,
  };
  const filterTargetToggles = filterTargets.map(
    (target): FilterTargetToggleProps => {
      if (target === 'costCenter') {
        return {
          id: target,
          label: 'Cost center',
          emptyDescription: costCentersEmptyDescription,
          isEmpty: targetAvailability[target].knownEmpty,
        };
      }

      return {
        id: target,
        label: TEAM_TARGET_LABELS[target],
        description:
          type === 'enterprise' ? teamTargetDescriptions[target] : undefined,
        emptyDescription: teamsEmptyDescription,
        isEmpty: targetAvailability[target].knownEmpty,
      };
    },
  );

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
    if (teamSelection.scopeKey !== teamSelectionScopeKey) {
      setTeamSelection({ scopeKey: teamSelectionScopeKey, value: undefined });
    }
    if (costCenterSelection.scopeKey !== scopeKey) {
      setCostCenterSelection({ scopeKey, value: { kind: 'all' } });
    }
    if (filterTargetSelection.scopeKey !== scopeKey) {
      setFilterTargetSelection({ scopeKey, value: defaultTeamTarget });
    }
  }, [
    scopeKey,
    teamSelectionScopeKey,
    defaultTeamTarget,
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
    if (!filterTargetToggleAvailable) {
      return;
    }

    if (allTargetsKnownEmpty) {
      const emptyFallbackTarget = costCenterScopeEnabled
        ? 'costCenter'
        : defaultTeamTarget;
      if (filterTarget !== emptyFallbackTarget) {
        selectFilterTarget(emptyFallbackTarget);
      }
      return;
    }

    if (selectedTargetKnownEmpty && targetWithOptions) {
      selectFilterTarget(targetWithOptions);
    }
  }, [
    defaultTeamTarget,
    allTargetsKnownEmpty,
    costCenterScopeEnabled,
    filterTarget,
    filterTargetToggleAvailable,
    selectedTargetKnownEmpty,
    targetWithOptions,
    selectFilterTarget,
  ]);

  const teamSelectorLabel =
    filterTarget && filterTarget !== 'costCenter'
      ? TEAM_TARGET_LABELS[filterTarget]
      : 'Team';
  const filterTargetHasOptions = (() => {
    if (filterTarget === 'costCenter') {
      return costCentersHaveOptions;
    }
    if (filterTarget === 'organizationTeam') {
      return (
        organizationTeamOptions.organizations.length > 0 ||
        organizationTeamOptions.loading
      );
    }
    return teams.items.length > 0;
  })();
  const showFilter =
    filterTarget !== undefined &&
    (filterTargetToggleAvailable || filterTargetHasOptions);
  const organizationTeamAlertTitle = organizationTeamOptions.error
    ? 'Unable to load organization team options.'
    : 'Unable to load organization team dashboard.';
  const organizationTeamAlertDescription = organizationTeamOptions.error
    ? 'The organization team options request failed. Try again, or contact your Backstage administrator if the problem persists.'
    : 'The organization team dashboard request failed. Try again, or contact your Backstage administrator if the problem persists.';

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
                {filterTargetToggleAvailable && (
                  <>
                    <Flex direction="row" align="center" gap="2">
                      <Text variant="body-small">Filter by</Text>
                      <ToggleButtonGroup
                        aria-label="Filter by"
                        selectionMode="single"
                        disallowEmptySelection
                        selectedKeys={[selectedFilterTarget]}
                        onSelectionChange={keys => {
                          const [selected] = Array.from(keys);
                          if (
                            typeof selected === 'string' &&
                            filterTargets.includes(selected as FilterTarget)
                          ) {
                            selectFilterTarget(selected as FilterTarget);
                          }
                        }}
                        orientation="horizontal"
                      >
                        {filterTargetToggles.map(toggle => (
                          <FilterTargetToggle key={toggle.id} {...toggle} />
                        ))}
                      </ToggleButtonGroup>
                    </Flex>
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
                {filterTarget === 'organizationTeam' && (
                  <Select
                    searchable
                    isDisabled={organizationTeamOptions.loading}
                    label="Organization"
                    selectedKey={
                      selectedOrganizationTeamOrganization
                        ? `${ORGANIZATION_OPTION_PREFIX}${selectedOrganizationTeamOrganization}`
                        : ALL_ORGANIZATIONS_OPTION
                    }
                    onChange={key => {
                      const value = key
                        ? String(key)
                        : ALL_ORGANIZATIONS_OPTION;
                      setSelectedOrganizationTeamOrganization(
                        value.startsWith(ORGANIZATION_OPTION_PREFIX)
                          ? value.slice(ORGANIZATION_OPTION_PREFIX.length)
                          : undefined,
                      );
                    }}
                    options={[
                      {
                        value: ALL_ORGANIZATIONS_OPTION,
                        label: 'All organizations',
                      },
                      ...organizationTeamOptions.organizations.map(org => ({
                        value: `${ORGANIZATION_OPTION_PREFIX}${org}`,
                        label: org,
                      })),
                    ]}
                  />
                )}
                {isTeamTarget && (
                  <Select
                    searchable
                    isDisabled={
                      teams.loading ||
                      (filterTarget === 'organizationTeam' &&
                        !organizationTeamOptions.teamsReady)
                    }
                    label={teamSelectorLabel}
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
          {filterTarget === 'organizationTeam' &&
            (organizationTeamOptions.error ||
              organizationTeamDashboard.error) && (
              <Alert
                status="danger"
                title={organizationTeamAlertTitle}
                description={organizationTeamAlertDescription}
                customActions={
                  <Button
                    size="small"
                    variant="secondary"
                    onPress={() => {
                      if (organizationTeamOptions.error) {
                        organizationTeamOptions.retry();
                      }
                      if (organizationTeamDashboard.error) {
                        organizationTeamDashboard.retry();
                      }
                    }}
                  >
                    Retry
                  </Button>
                }
              />
            )}

          {showOrganizationTeamEmptyState && (
            <div
              role="status"
              style={{
                padding: 16,
                textAlign: 'center',
                color: '#888',
              }}
            >
              No organization-team data is available for this selection and date
              range.
            </div>
          )}
          <Tabs
            defaultSelectedKey="copilot-usage"
            style={{
              display: showOrganizationTeamEmptyState ? 'none' : undefined,
            }}
          >
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
                        fillMissingDays={filterTarget !== 'organizationTeam'}
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
                        fillMissingDays={filterTarget !== 'organizationTeam'}
                      />
                    </ChartCard>
                  </Grid.Item>
                </Grid.Root>

                {/* Average Chat Requests per Active User */}
                <ChartCard title="Average Chat Requests per Active User">
                  <AvgChatRequestsChart
                    data={data.daily}
                    from={from}
                    to={to}
                    fillMissingDays={filterTarget !== 'organizationTeam'}
                  />
                </ChartCard>

                {/* Requests per Chat Mode */}
                <ChartCard title="Requests per Chat Mode">
                  <RequestsByChatModeChart
                    data={data.byFeature}
                    from={from}
                    to={to}
                    fillMissingDays={filterTarget !== 'organizationTeam'}
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
                        fillMissingDays={filterTarget !== 'organizationTeam'}
                      />
                    </ChartCard>
                  </Grid.Item>
                  <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                    <ChartCard title="Code Completion Acceptance Rate">
                      <CodeCompletionsAcceptanceChart
                        data={data.byFeature}
                        from={from}
                        to={to}
                        fillMissingDays={filterTarget !== 'organizationTeam'}
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
                    fillMissingDays={filterTarget !== 'organizationTeam'}
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
                    fillMissingDays={filterTarget !== 'organizationTeam'}
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
                  fillMissingDays={filterTarget !== 'organizationTeam'}
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
                  <DailyLOCChart
                    data={data.daily}
                    from={from}
                    to={to}
                    fillMissingDays={filterTarget !== 'organizationTeam'}
                  />
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
                      fillMissingDays={filterTarget !== 'organizationTeam'}
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
