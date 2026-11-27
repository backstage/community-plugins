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
  ButtonLink,
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
  useV2OrganizationTeamOptions,
  useV2Teams,
} from './hooks';
import { CopilotUsageSummary } from './CopilotUsageSummary';
import { CodeGenerationSummary } from './CodeGenerationSummary';
import { RiExternalLinkLine } from '@remixicon/react';
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

const DOCS_URL =
  'https://docs.github.com/en/copilot/reference/copilot-usage-metrics/interpret-copilot-metrics';

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
type OrganizationTeamSelection =
  | {
      target: 'organizationTeam';
      organization: undefined;
      team: undefined;
    }
  | {
      target: 'organizationTeam';
      organization: string;
      team: string | undefined;
    };
type FilterSelection =
  | { target: 'team' | 'enterpriseTeam'; team: string | undefined }
  | OrganizationTeamSelection
  | { target: 'costCenter'; costCenter: CostCenterSelection };
type ScopedFilterSelection = {
  scopeKey: string;
  value: FilterSelection;
};

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

const createEmptyFilterSelection = (target: FilterTarget): FilterSelection => {
  if (target === 'costCenter') {
    return { target, costCenter: { kind: 'all' } };
  }
  if (target === 'organizationTeam') {
    return { target, organization: undefined, team: undefined };
  }
  return { target, team: undefined };
};

const getOrganizationTeamOptionValue = (organization: string, team: string) =>
  `${organization}/${team}`;

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
  const configuredOrganizationTeamScopeEnabled =
    type === 'organization' &&
    Boolean(enterprise && organization && ingestOrganizationTeamReports);
  const defaultTeamTarget: FilterTarget =
    type === 'enterprise' ? 'enterpriseTeam' : 'team';
  const teamTargets = useMemo<FilterTarget[]>(
    () => [
      ...(ingestTeams || configuredOrganizationTeamScopeEnabled
        ? [defaultTeamTarget]
        : []),
      ...(organizationTeamScopeEnabled ? ['organizationTeam' as const] : []),
    ],
    [
      defaultTeamTarget,
      ingestTeams,
      organizationTeamScopeEnabled,
      configuredOrganizationTeamScopeEnabled,
    ],
  );
  const filterTargets = useMemo<FilterTarget[]>(
    () => [
      ...(costCenterScopeEnabled ? ['costCenter' as const] : []),
      ...teamTargets,
    ],
    [costCenterScopeEnabled, teamTargets],
  );
  const filterTargetToggleAvailable = filterTargets.length > 1;

  const [from, setFrom] = useState(
    DateTime.now().minus({ days: 30 }).toFormat('yyyy-MM-dd'),
  );
  const [to, setTo] = useState(DateTime.now().toFormat('yyyy-MM-dd'));
  const scopeKey = JSON.stringify([type, entityId]);
  const [filterSelection, setFilterSelection] = useState<ScopedFilterSelection>(
    {
      scopeKey,
      value: createEmptyFilterSelection(defaultTeamTarget),
    },
  );
  const currentFilterSelection =
    filterSelection.scopeKey === scopeKey &&
    filterTargets.includes(filterSelection.value.target)
      ? filterSelection.value
      : undefined;
  const filterTarget: FilterTarget | undefined =
    currentFilterSelection?.target ?? teamTargets[0] ?? filterTargets[0];
  const activeFilterSelection =
    currentFilterSelection?.target === filterTarget
      ? currentFilterSelection
      : undefined;
  const selectedOrganizationTeamOrganization =
    activeFilterSelection?.target === 'organizationTeam'
      ? activeFilterSelection.organization
      : undefined;
  const isPartialOrganizationTeamMode =
    (filterTarget === 'organizationTeam' &&
      selectedOrganizationTeamOrganization !== undefined) ||
    (type === 'organization' && filterTarget === 'team');
  const selectedTeam =
    activeFilterSelection && activeFilterSelection.target !== 'costCenter'
      ? activeFilterSelection.team
      : undefined;
  const selectedCostCenter = useMemo<CostCenterSelection>(
    () =>
      costCenterScopeEnabled && activeFilterSelection?.target === 'costCenter'
        ? activeFilterSelection.costCenter
        : { kind: 'all' },
    [activeFilterSelection, costCenterScopeEnabled],
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
      if (filterTarget === 'organizationTeam') {
        setFilterSelection({
          scopeKey,
          value:
            selectedOrganizationTeamOrganization === undefined
              ? {
                  target: 'organizationTeam',
                  organization: undefined,
                  team: undefined,
                }
              : {
                  target: 'organizationTeam',
                  organization: selectedOrganizationTeamOrganization,
                  team: value,
                },
        });
      } else if (filterTarget === 'team' || filterTarget === 'enterpriseTeam') {
        setFilterSelection({
          scopeKey,
          value: { target: filterTarget, team: value },
        });
      }
    },
    [filterTarget, scopeKey, selectedOrganizationTeamOrganization],
  );
  const setSelectedCostCenter = useCallback(
    (value: CostCenterSelection) => {
      setFilterSelection({
        scopeKey,
        value: { target: 'costCenter', costCenter: value },
      });
    },
    [scopeKey],
  );
  const setSelectedOrganizationTeamOrganization = useCallback(
    (value: string | undefined, team?: string) => {
      setFilterSelection({
        scopeKey,
        value:
          value === undefined
            ? {
                target: 'organizationTeam',
                organization: undefined,
                team: undefined,
              }
            : { target: 'organizationTeam', organization: value, team },
      });
    },
    [scopeKey],
  );
  const selectFilterTarget = useCallback(
    (value: FilterTarget) => {
      if (value === filterTarget) {
        return;
      }
      setFilterSelection({
        scopeKey,
        value: createEmptyFilterSelection(value),
      });
    },
    [scopeKey, filterTarget],
  );

  let dashboardType = type;
  if (filterTarget === 'organizationTeam') {
    dashboardType = selectedOrganizationTeamOrganization
      ? 'organization'
      : 'enterprise';
  }
  const dashboardEntityId =
    filterTarget === 'organizationTeam'
      ? selectedOrganizationTeamOrganization ?? entityId
      : entityId;
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

  const dashboard = useV2DashboardData(params, activeNoCostCenter);
  const data = dashboard.data;
  const costCenters = useV2CostCenters(type, entityId, from, to);
  const enterpriseTeams = useV2Teams(type, entityId, from, to);
  const organizationTeamOptions = useV2OrganizationTeamOptions(
    selectedOrganizationTeamOrganization,
    from,
    to,
    organizationTeamScopeEnabled,
  );
  const teamOptionsLoading =
    filterTarget === 'organizationTeam'
      ? organizationTeamOptions.loading
      : enterpriseTeams.loading;
  const teamOptionsError =
    filterTarget === 'organizationTeam'
      ? organizationTeamOptions.error
      : enterpriseTeams.error;
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
    'Teams defined in an organization. Each team is listed with its owning organization.';
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
    if (filterSelection.scopeKey !== scopeKey) {
      setFilterSelection({
        scopeKey,
        value: createEmptyFilterSelection(defaultTeamTarget),
      });
    }
  }, [scopeKey, defaultTeamTarget, filterSelection.scopeKey]);

  useEffect(() => {
    if (!selectedTeam || teamOptionsLoading) {
      return;
    }

    const teamExists =
      filterTarget === 'organizationTeam'
        ? organizationTeamOptions.teams.some(
            ({ team }) => team === selectedTeam,
          )
        : enterpriseTeams.items.includes(selectedTeam);
    if (teamOptionsError || !teamExists) {
      setSelectedTeam(undefined);
    }
  }, [
    enterpriseTeams.items,
    filterTarget,
    organizationTeamOptions.teams,
    selectedTeam,
    setSelectedTeam,
    teamOptionsError,
    teamOptionsLoading,
  ]);

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
    if (
      !filterTargetToggleAvailable ||
      (filterTarget === 'organizationTeam' &&
        selectedOrganizationTeamOrganization !== undefined)
    ) {
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
    selectedOrganizationTeamOrganization,
    selectedTargetKnownEmpty,
    targetWithOptions,
    selectFilterTarget,
  ]);

  const teamSelectorLabel =
    filterTarget && filterTarget !== 'costCenter'
      ? TEAM_TARGET_LABELS[filterTarget]
      : 'Team';
  const teamOptions =
    filterTarget === 'organizationTeam'
      ? organizationTeamOptions.teams.map(
          ({ organization: teamOrganization, team }) => ({
            value: getOrganizationTeamOptionValue(teamOrganization, team),
            label: selectedOrganizationTeamOrganization
              ? team
              : `${teamOrganization} / ${team}`,
          }),
        )
      : enterpriseTeams.items.map(team => ({ value: team, label: team }));
  const filterTargetHasOptions =
    filterTarget === 'organizationTeam'
      ? organizationTeamOptions.organizations.length > 0 ||
        organizationTeamOptions.loading ||
        selectedOrganizationTeamOrganization !== undefined
      : filterTarget !== undefined &&
        targetAvailability[filterTarget].hasOptions;
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
                        selectedKeys={filterTarget ? [filterTarget] : []}
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
                    isDisabled={teamOptionsLoading || Boolean(teamOptionsError)}
                    label={teamSelectorLabel}
                    selectedKey={
                      filterTarget === 'organizationTeam' &&
                      selectedOrganizationTeamOrganization &&
                      activeTeam
                        ? getOrganizationTeamOptionValue(
                            selectedOrganizationTeamOrganization,
                            activeTeam,
                          )
                        : activeTeam ?? ''
                    }
                    onChange={key => {
                      const value = key ? String(key) : undefined;
                      if (filterTarget === 'organizationTeam' && value) {
                        const separator = value.indexOf('/');
                        setSelectedOrganizationTeamOrganization(
                          value.slice(0, separator),
                          value.slice(separator + 1),
                        );
                      } else {
                        setSelectedTeam(value);
                      }
                    }}
                    options={[
                      { value: '', label: 'All teams' },
                      ...teamOptions,
                    ]}
                  />
                )}
              </Flex>
            )}
            <ButtonLink
              variant="tertiary"
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              iconEnd={<RiExternalLinkLine />}
              style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}
            >
              How do I interpret these metrics?
            </ButtonLink>
          </Flex>
          {filterTarget === 'organizationTeam' &&
            (organizationTeamOptions.error || dashboard.error) && (
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
                      if (dashboard.error) {
                        dashboard.retry();
                      }
                    }}
                  >
                    Retry
                  </Button>
                }
              />
            )}

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
                        fillMissingDays={!isPartialOrganizationTeamMode}
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
                        fillMissingDays={!isPartialOrganizationTeamMode}
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
                    fillMissingDays={!isPartialOrganizationTeamMode}
                  />
                </ChartCard>

                {/* Requests per Chat Mode */}
                <ChartCard title="Requests per Chat Mode">
                  <RequestsByChatModeChart
                    data={data.byFeature}
                    from={from}
                    to={to}
                    fillMissingDays={!isPartialOrganizationTeamMode}
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
                        fillMissingDays={!isPartialOrganizationTeamMode}
                      />
                    </ChartCard>
                  </Grid.Item>
                  <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                    <ChartCard title="Code Completion Acceptance Rate">
                      <CodeCompletionsAcceptanceChart
                        data={data.byFeature}
                        from={from}
                        to={to}
                        fillMissingDays={!isPartialOrganizationTeamMode}
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
                    fillMissingDays={!isPartialOrganizationTeamMode}
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
                    fillMissingDays={!isPartialOrganizationTeamMode}
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
                  fillMissingDays={!isPartialOrganizationTeamMode}
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
                    fillMissingDays={!isPartialOrganizationTeamMode}
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
                      fillMissingDays={!isPartialOrganizationTeamMode}
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
