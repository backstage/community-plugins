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

import { ConfigReader } from '@backstage/core-app-api';
import { configApiRef } from '@backstage/core-plugin-api';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import {
  V2DailyTotal,
  V2DashboardData,
  V2CostCenterListResponse,
  V2CostCenterOption,
} from '@backstage-community/plugin-copilot-common';
import { CopilotApiV2, copilotApiV2Ref } from '../../api';
import { V2DashboardPage } from './V2DashboardPage';

jest.mock('./charts', () => {
  const Noop = () => null;
  const IDEActiveUsersChart = ({
    data,
    variant,
    fillMissingDays,
  }: {
    data: V2DailyTotal[];
    variant: string;
    fillMissingDays?: boolean;
  }) => (
    <output
      data-testid={`ide-active-users-${variant}`}
      data-fill-missing-days={String(fillMissingDays)}
    >
      {JSON.stringify(data)}
    </output>
  );
  return {
    IDEActiveUsersChart,
    AvgChatRequestsChart: Noop,
    RequestsByChatModeChart: Noop,
    CodeCompletionsChart: Noop,
    CodeCompletionsAcceptanceChart: Noop,
    ModelUsagePerDayChart: Noop,
    ChatModelUsageDonut: Noop,
    ModelUsagePerChatModeChart: Noop,
    LanguageUsagePerDayChart: Noop,
    LanguageUsageDonut: Noop,
    ModelUsagePerLanguageChart: Noop,
    DailyLOCChart: Noop,
    UserLOCByFeatureChart: Noop,
    AgentLOCByFeatureChart: Noop,
    UserLOCByModelChart: Noop,
    AgentLOCByModelChart: Noop,
    UserLOCByLanguageChart: Noop,
    AgentLOCByLanguageChart: Noop,
    AiCreditsConsumptionChart: Noop,
  };
});

jest.mock('./CopilotUsageSummary', () => ({
  CopilotUsageSummary: () => null,
}));

jest.mock('./CodeGenerationSummary', () => ({
  CodeGenerationSummary: () => null,
}));

jest.mock('./ConsumptionSummary', () => ({
  ConsumptionSummary: () => null,
}));

const EMPTY_DASHBOARD: V2DashboardData = {
  daily: [],
  byFeature: [],
  byLanguage: [],
  byModelFeature: [],
  byLanguageModel: [],
  prMetrics: [],
  customizationMetrics: [],
  customizationSummaries: [],
};

const createDailyTotal = (
  day: string,
  dailyActiveUsers: number,
): V2DailyTotal => ({
  day,
  metrics_type: 'organization',
  entity_id: 'my-org',
  team_slug: 'platform',
  daily_active_users: dailyActiveUsers,
  code_acceptance_activity_count: 0,
  code_generation_activity_count: 0,
  loc_added_sum: 0,
  loc_deleted_sum: 0,
  loc_suggested_to_add_sum: 0,
  loc_suggested_to_delete_sum: 0,
  user_initiated_interaction_count: 0,
});

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const createApi = ({
  costCenters = [],
  hasUsersWithoutCostCenter = false,
  teams = ['platform', 'product'],
  organizations = ['my-org', 'other-org'],
  organizationTeams,
}: {
  costCenters?: V2CostCenterOption[];
  hasUsersWithoutCostCenter?: boolean;
  teams?: string[];
  organizations?: string[];
  organizationTeams?: Array<{ organization: string; team: string }>;
} = {}): jest.Mocked<CopilotApiV2> => {
  const teamsByOrganization =
    organizationTeams ??
    teams.map(team => ({ organization: organizations[0] ?? '', team }));
  return {
    getDailyMetrics: jest.fn().mockResolvedValue([]),
    getPrMetrics: jest.fn().mockResolvedValue([]),
    getByFeature: jest.fn().mockResolvedValue([]),
    getByIde: jest.fn().mockResolvedValue([]),
    getLanguageByFeature: jest.fn().mockResolvedValue([]),
    fetchCostCenters: jest.fn().mockResolvedValue({
      costCenters,
      hasUsersWithoutCostCenter,
    }),
    getTeams: jest.fn().mockResolvedValue(teams),
    getPeriodRange: jest.fn().mockResolvedValue(null),
    getBackfillStatus: jest.fn().mockResolvedValue([]),
    getByModelFeature: jest.fn().mockResolvedValue([]),
    getByLanguageModel: jest.fn().mockResolvedValue([]),
    getDashboardData: jest.fn().mockResolvedValue(EMPTY_DASHBOARD),
    getOrganizationTeamOptions: jest
      .fn()
      .mockImplementation(async ({ organization }) => ({
        organizations,
        teams: organization
          ? teamsByOrganization.filter(
              option => option.organization === organization,
            )
          : teamsByOrganization,
        hasPendingOrganizations: false,
      })),
    getNoCostCenterDashboardData: jest.fn().mockResolvedValue(EMPTY_DASHBOARD),
  };
};

type DashboardConfig = {
  enterprise?: string;
  organization?: string;
  defaultView?: 'enterprise' | 'organization';
  ingestCostCenters?: boolean;
  ingestTeams?: boolean;
  ingestOrganizationTeamReports?: boolean;
};

const createDashboard = (
  api: jest.Mocked<CopilotApiV2>,
  scope: DashboardConfig = { enterprise: 'enterprise-1' },
) => {
  const config = {
    ingestCostCenters: true,
    ingestTeams: true,
    ingestOrganizationTeamReports: false,
    ...scope,
  };
  const copilotConfig: Record<string, string | boolean> = {
    ingestCostCenters: config.ingestCostCenters,
    ingestTeams: config.ingestTeams,
    ingestOrganizationTeamReports: config.ingestOrganizationTeamReports,
  };
  if (config.enterprise) {
    copilotConfig.enterprise = config.enterprise;
  }
  if (config.organization) {
    copilotConfig.organization = config.organization;
  }
  if (config.defaultView) {
    copilotConfig.defaultView = config.defaultView;
  }
  return (
    <TestApiProvider
      apis={[
        [configApiRef, new ConfigReader({ copilot: copilotConfig })],
        [copilotApiV2Ref, api],
      ]}
    >
      <V2DashboardPage />
    </TestApiProvider>
  );
};

const renderDashboard = async (
  api: jest.Mocked<CopilotApiV2>,
  scope: DashboardConfig = { enterprise: 'enterprise-1' },
) => renderInTestApp(createDashboard(api, scope));

const getFilterToggleButtons = () =>
  screen
    .queryAllByText(/^(Cost center|Team|Enterprise team|Organization team)$/)
    .map(element => element.closest('button'))
    .filter((button): button is HTMLButtonElement => button !== null);

const getFilterToggleButton = (
  label: 'Cost center' | 'Team' | 'Enterprise team' | 'Organization team',
) => {
  const button = getFilterToggleButtons().find(
    element =>
      element.textContent?.trim() === label ||
      (label === 'Team' && element.textContent?.trim() === 'Enterprise team'),
  );
  if (!button) {
    throw new Error(`Could not find the ${label} filter toggle button`);
  }
  return button;
};

describe('V2DashboardPage filter targets', () => {
  it('shows the Cost center | Team toggle button group, defaulting to Team', async () => {
    const api = createApi({
      costCenters: [{ id: 'cc-platform', name: 'Platform' }],
    });
    await renderDashboard(api);

    const filterLabel = await screen.findByText('Filter by', { exact: true });
    const filterGroup = screen.getByLabelText('Filter by');
    expect(filterLabel).toBeVisible();
    expect(filterGroup).toBeVisible();
    expect(filterLabel.parentElement).toBe(filterGroup.parentElement);
    expect(getFilterToggleButtons()).toHaveLength(2);
    expect(getFilterToggleButton('Enterprise team')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(getFilterToggleButton('Cost center')).not.toBeDisabled();
    expect(getFilterToggleButton('Enterprise team')).not.toBeDisabled();
    expect(await screen.findByRole('button', { name: /team/i })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /Cost center/ }),
    ).not.toBeInTheDocument();
  });

  it('uses each organization team only within its owning organization', async () => {
    const api = createApi({
      organizations: ['org-1', 'org-2'],
      organizationTeams: [
        { organization: 'org-1', team: 'platform' },
        { organization: 'org-2', team: 'platform' },
      ],
    });
    const user = userEvent.setup();
    await renderDashboard(api, {
      enterprise: 'my-enterprise',
      organization: 'my-org',
      ingestCostCenters: false,
      ingestTeams: true,
      ingestOrganizationTeamReports: true,
    });

    expect(getFilterToggleButtons()).toHaveLength(2);
    expect(getFilterToggleButton('Enterprise team')).toBeVisible();
    expect(getFilterToggleButton('Organization team')).toBeVisible();
    expect(
      getFilterToggleButton('Enterprise team'),
    ).toHaveAccessibleDescription(
      'Teams defined at the enterprise level in GitHub. They can include members from any organization in the enterprise.',
    );
    expect(
      getFilterToggleButton('Organization team'),
    ).toHaveAccessibleDescription(
      'Teams defined in an organization. Each team is listed with its owning organization.',
    );

    await user.hover(getFilterToggleButton('Enterprise team'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Teams defined at the enterprise level in GitHub.',
    );
    await user.unhover(getFilterToggleButton('Enterprise team'));
    await user.hover(getFilterToggleButton('Organization team'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Teams defined in an organization.',
    );

    await waitFor(() =>
      expect(api.getOrganizationTeamOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          organization: undefined,
        }),
      ),
    );
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'enterprise',
          entityId: 'my-enterprise',
          team: undefined,
        }),
      ),
    );
    await user.click(getFilterToggleButton('Organization team'));
    await user.click(screen.getByRole('button', { name: /All teams/ }));
    expect(
      await screen.findByRole('option', { name: 'org-1 / platform' }),
    ).toBeVisible();
    expect(
      await screen.findByRole('option', { name: 'org-2 / platform' }),
    ).toBeVisible();
    await user.click(
      await screen.findByRole('option', { name: 'org-2 / platform' }),
    );

    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'organization',
          entityId: 'org-2',
          team: 'platform',
        }),
      ),
    );

    await user.click(screen.getByRole('button', { name: /org-2/ }));
    await user.click(await screen.findByRole('option', { name: 'org-1' }));
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'organization',
          entityId: 'org-1',
          team: undefined,
        }),
      ),
    );
    expect(screen.getByRole('button', { name: /All teams/ })).toBeVisible();
    await user.click(screen.getByRole('button', { name: /All teams/ }));
    await user.click(await screen.findByRole('option', { name: 'platform' }));
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'organization',
          entityId: 'org-1',
          team: 'platform',
        }),
      ),
    );

    expect(screen.getByRole('tab', { name: 'Consumption' })).toBeVisible();
    await user.click(screen.getByRole('tab', { name: 'Consumption' }));
    await user.click(screen.getByRole('tab', { name: 'Agent Harness' }));
    expect(api.getDashboardData).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: 'organization',
        entityId: 'org-1',
        team: 'platform',
      }),
    );

    await user.click(getFilterToggleButton('Enterprise team'));
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'enterprise',
          entityId: 'my-enterprise',
          team: undefined,
        }),
      ),
    );
  });

  it('requires enterprise and multi-organization ingestion to offer organization teams', async () => {
    const user = userEvent.setup();
    const unavailableScopes: DashboardConfig[] = [
      {
        organization: 'my-org',
        ingestCostCenters: false,
        ingestTeams: true,
        ingestOrganizationTeamReports: true,
      },
      {
        enterprise: 'my-enterprise',
        ingestCostCenters: false,
        ingestTeams: true,
        ingestOrganizationTeamReports: false,
      },
      {
        enterprise: 'my-enterprise',
        organization: 'my-org',
        ingestCostCenters: false,
        ingestTeams: false,
        defaultView: 'organization',
        ingestOrganizationTeamReports: true,
      },
    ];
    for (const scope of unavailableScopes) {
      const rendered = await renderDashboard(createApi(), scope);
      expect(
        screen.queryByRole('button', { name: 'Organization team' }),
      ).not.toBeInTheDocument();
      rendered.unmount();
    }

    const configuredOrganizationApi = createApi({
      organizations: ['my-org'],
      teams: ['octo-team'],
    });
    const configuredOrganizationDashboard = await renderDashboard(
      configuredOrganizationApi,
      {
        enterprise: 'my-enterprise',
        organization: 'my-org',
        ingestCostCenters: false,
        ingestTeams: true,
        ingestOrganizationTeamReports: false,
      },
    );
    expect(getFilterToggleButton('Organization team')).toBeInTheDocument();
    await user.click(getFilterToggleButton('Organization team'));
    expect(
      await screen.findByRole('button', { name: /All organizations/ }),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: /All organizations/ }));
    await user.click(await screen.findByRole('option', { name: 'my-org' }));
    await waitFor(() =>
      expect(
        configuredOrganizationApi.getDashboardData,
      ).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'organization',
          entityId: 'my-org',
          team: undefined,
        }),
      ),
    );
    configuredOrganizationDashboard.unmount();

    const organizationApi = createApi();
    const rendered = await renderDashboard(organizationApi, {
      enterprise: 'my-enterprise',
      ingestCostCenters: true,
      ingestTeams: true,
      ingestOrganizationTeamReports: true,
    });
    expect(getFilterToggleButton('Enterprise team')).toBeVisible();
    expect(getFilterToggleButton('Organization team')).toBeVisible();
    rendered.unmount();
  });

  it('keeps known team options available while organization reports are pending', async () => {
    const api = createApi();
    api.getOrganizationTeamOptions.mockResolvedValue({
      organizations: ['accessible-org'],
      teams: [{ organization: 'accessible-org', team: 'historic-only' }],
      hasPendingOrganizations: true,
    });
    const user = userEvent.setup();
    await renderDashboard(api, {
      enterprise: 'my-enterprise',
      ingestCostCenters: false,
      ingestTeams: true,
      ingestOrganizationTeamReports: true,
    });

    await user.click(getFilterToggleButton('Organization team'));

    expect(
      screen.queryByText('Organization team data is still being prepared.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Unable to load organization team options.'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /all teams/i }),
    ).not.toBeDisabled();
    await user.click(screen.getByRole('button', { name: /all teams/i }));
    expect(
      await screen.findByRole('option', {
        name: 'accessible-org / historic-only',
      }),
    ).toBeVisible();
    await user.keyboard('{Escape}');

    await user.click(
      screen.getByRole('button', { name: /all organizations/i }),
    );
    expect(
      await screen.findByRole('option', { name: 'accessible-org' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('option', { name: 'inaccessible-org' }),
    ).not.toBeInTheDocument();
  });

  it('reports organization-options failures and lets users retry without exposing backend errors', async () => {
    const api = createApi();
    const backendErrorMessage = 'Private GraphQL failure details';
    let failOptionsRequest = true;
    api.getOrganizationTeamOptions.mockImplementation(async () => {
      if (failOptionsRequest) {
        throw new Error(backendErrorMessage);
      }
      return {
        organizations: ['my-org'],
        teams: [{ organization: 'my-org', team: 'platform' }],
        hasPendingOrganizations: false,
      };
    });
    const user = userEvent.setup();
    await renderDashboard(api, {
      enterprise: 'my-enterprise',
      ingestCostCenters: false,
      ingestTeams: true,
      ingestOrganizationTeamReports: true,
    });

    await user.click(getFilterToggleButton('Organization team'));

    expect(
      await screen.findByText('Unable to load organization team options.'),
    ).toBeVisible();
    expect(screen.getByText(/Try again/)).toBeVisible();
    expect(screen.queryByText(backendErrorMessage)).not.toBeInTheDocument();
    expect(
      screen.queryByText('Organization team data is still being prepared.'),
    ).not.toBeInTheDocument();

    const callsBeforeRetry = api.getOrganizationTeamOptions.mock.calls.length;
    failOptionsRequest = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() =>
      expect(api.getOrganizationTeamOptions.mock.calls.length).toBeGreaterThan(
        callsBeforeRetry,
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByText('Unable to load organization team options.'),
      ).not.toBeInTheDocument(),
    );
  });

  it('reports organization-dashboard failures and lets users retry without exposing backend errors', async () => {
    const api = createApi({
      organizations: ['my-org'],
      organizationTeams: [{ organization: 'my-org', team: 'platform' }],
    });
    const backendErrorMessage = 'Private organization dashboard details';
    let failDashboardRequest = true;
    api.getDashboardData.mockImplementation(async params => {
      if (
        failDashboardRequest &&
        params.type === 'organization' &&
        params.team
      ) {
        throw new Error(backendErrorMessage);
      }
      return EMPTY_DASHBOARD;
    });
    const user = userEvent.setup();
    await renderDashboard(api, {
      enterprise: 'my-enterprise',
      ingestCostCenters: false,
      ingestTeams: true,
      ingestOrganizationTeamReports: true,
    });

    await user.click(getFilterToggleButton('Organization team'));
    await user.click(screen.getByRole('button', { name: /All teams/ }));
    await user.click(
      await screen.findByRole('option', { name: 'my-org / platform' }),
    );

    expect(
      await screen.findByText('Unable to load organization team dashboard.'),
    ).toBeVisible();
    expect(screen.getByText(/dashboard request failed/i)).toBeVisible();
    expect(screen.queryByText(backendErrorMessage)).not.toBeInTheDocument();

    const callsBeforeRetry = api.getDashboardData.mock.calls.length;
    failDashboardRequest = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() =>
      expect(api.getDashboardData.mock.calls.length).toBeGreaterThan(
        callsBeforeRetry,
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByText('Unable to load organization team dashboard.'),
      ).not.toBeInTheDocument(),
    );
  });

  it('renders only the unchanged team dropdown when only team filtering is configured', async () => {
    const api = createApi();
    const user = userEvent.setup();
    await renderDashboard(api, {
      enterprise: 'enterprise-1',
      ingestCostCenters: false,
      ingestTeams: true,
    });

    expect(getFilterToggleButtons()).toHaveLength(0);
    expect(await screen.findByRole('button', { name: /team/i })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /Cost center/ }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /team/i }));
    expect(
      (await screen.findAllByRole('option')).map(option => option.textContent),
    ).toEqual(['All teams', 'platform', 'product']);
    await user.click(await screen.findByRole('option', { name: 'platform' }));

    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          team: 'platform',
          costCenter: undefined,
        }),
      ),
    );
    expect(
      api.getTeams.mock.calls.every(([params]) => !('costCenter' in params)),
    ).toBe(true);
  });

  it('omits unreported days in the organization-view team filter while keeping reported zero days', async () => {
    const today = DateTime.now();
    const positiveDay = today.minus({ days: 4 }).toFormat('yyyy-MM-dd');
    const missingDay = today.minus({ days: 3 }).toFormat('yyyy-MM-dd');
    const reportedZeroDay = today.minus({ days: 2 }).toFormat('yyyy-MM-dd');
    const daily = [
      createDailyTotal(positiveDay, 2),
      createDailyTotal(reportedZeroDay, 0),
    ];
    const api = createApi();
    api.getDashboardData.mockResolvedValue({
      ...EMPTY_DASHBOARD,
      daily,
    });
    const user = userEvent.setup();

    await renderDashboard(api, {
      enterprise: 'enterprise-1',
      organization: 'my-org',
      defaultView: 'organization',
      ingestCostCenters: false,
      ingestTeams: true,
    });

    await user.click(await screen.findByRole('button', { name: /team/i }));
    await user.click(await screen.findByRole('option', { name: 'platform' }));

    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'organization',
          entityId: 'my-org',
          team: 'platform',
        }),
      ),
    );

    const dailyChart = screen.getByTestId('ide-active-users-daily');
    expect(dailyChart).toHaveAttribute('data-fill-missing-days', 'false');
    expect(JSON.parse(dailyChart.textContent ?? '[]')).toEqual(daily);
    expect(daily.map(row => row.day)).not.toContain(missingDay);
    expect(daily).toContainEqual(
      expect.objectContaining({
        day: reportedZeroDay,
        daily_active_users: 0,
      }),
    );
  });

  it('renders only the cost-center dropdown when only cost-center filtering is configured', async () => {
    const api = createApi({
      costCenters: [{ id: 'cc-platform', name: 'Platform' }],
    });
    await renderDashboard(api, {
      enterprise: 'enterprise-1',
      ingestCostCenters: true,
      ingestTeams: false,
    });

    expect(getFilterToggleButtons()).toHaveLength(0);
    expect(screen.getByRole('button', { name: /Cost center/ })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /^Team/ }),
    ).not.toBeInTheDocument();
  });

  it('shows no filter UI when neither target is configured', async () => {
    const api = createApi({
      costCenters: [{ id: 'cc-platform', name: 'Platform' }],
    });
    await renderDashboard(api, {
      enterprise: 'enterprise-1',
      ingestCostCenters: false,
      ingestTeams: false,
    });

    expect(getFilterToggleButtons()).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: /Cost center/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Team/ }),
    ).not.toBeInTheDocument();
  });

  it('clears the other selection whenever the filter target changes', async () => {
    const api = createApi({
      costCenters: [{ id: 'cc-platform', name: 'Platform' }],
    });
    const user = userEvent.setup();
    await renderDashboard(api);

    await user.click(getFilterToggleButton('Cost center'));
    await user.click(
      await screen.findByRole('button', { name: /Cost center/ }),
    );
    await user.click(await screen.findByRole('option', { name: 'Platform' }));
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          team: undefined,
          costCenter: 'cc-platform',
        }),
      ),
    );

    await user.click(getFilterToggleButton('Team'));
    expect(getFilterToggleButton('Team')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('button', { name: /team/i })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /Cost center/ }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({ team: undefined, costCenter: undefined }),
      ),
    );

    await user.click(screen.getByRole('button', { name: /team/i }));
    await user.click(await screen.findByRole('option', { name: 'platform' }));
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          team: 'platform',
          costCenter: undefined,
        }),
      ),
    );

    await user.click(getFilterToggleButton('Cost center'));
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({ team: undefined, costCenter: undefined }),
      ),
    );
    await user.click(
      await screen.findByRole('button', { name: /Cost center/ }),
    );
    await user.click(await screen.findByRole('option', { name: 'Platform' }));

    expect(
      api.getDashboardData.mock.calls.every(
        ([params]) => !(params.team && params.costCenter),
      ),
    ).toBe(true);
  });

  it('falls back to teams when cost centers are known empty and describes the disabled option', async () => {
    const api = createApi({
      costCenters: [{ id: 'cc-platform', name: 'Platform' }],
    });
    const user = userEvent.setup();
    const rendered = await renderDashboard(api);

    await user.click(getFilterToggleButton('Cost center'));
    await user.click(
      await screen.findByRole('button', { name: /Cost center/ }),
    );
    await user.click(await screen.findByRole('option', { name: 'Platform' }));
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({ costCenter: 'cc-platform' }),
      ),
    );

    const emptyCostCenterApi = createApi({ costCenters: [] });
    rendered.rerender(createDashboard(emptyCostCenterApi));

    await waitFor(() =>
      expect(getFilterToggleButton('Team')).toHaveAttribute(
        'aria-checked',
        'true',
      ),
    );
    await waitFor(() =>
      expect(emptyCostCenterApi.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({ team: undefined, costCenter: undefined }),
      ),
    );
    const costCenterToggle = getFilterToggleButton('Cost center');
    expect(costCenterToggle).toBeDisabled();
    expect(costCenterToggle).toHaveAccessibleDescription(
      'No cost centers with enough Copilot users in the selected date range',
    );

    await user.hover(costCenterToggle.parentElement ?? costCenterToggle);
    const costCenterTooltip = await screen.findByRole('tooltip');
    expect(costCenterTooltip).toHaveTextContent(
      'No cost centers with enough Copilot users in the selected date range',
    );
    expect(costCenterTooltip).toHaveAttribute('data-placement', 'top');
  });

  it('falls back to cost centers when teams finish loading empty', async () => {
    const api = createApi({
      costCenters: [{ id: 'cc-platform', name: 'Platform' }],
      teams: [],
    });
    const pendingTeams = createDeferred<string[]>();
    api.getTeams.mockReturnValue(pendingTeams.promise);
    const user = userEvent.setup();
    await renderDashboard(api);

    const teamToggle = getFilterToggleButton('Enterprise team');
    expect(teamToggle).not.toBeDisabled();
    expect(teamToggle).toHaveAttribute('aria-checked', 'true');

    await act(async () => {
      pendingTeams.resolve([]);
      await pendingTeams.promise;
    });

    await waitFor(() =>
      expect(getFilterToggleButton('Cost center')).toHaveAttribute(
        'aria-checked',
        'true',
      ),
    );
    const disabledTeamToggle = getFilterToggleButton('Enterprise team');
    expect(disabledTeamToggle).toBeDisabled();
    expect(disabledTeamToggle).toHaveAccessibleDescription(
      /No teams with Copilot data in the selected date range/,
    );
    await user.hover(disabledTeamToggle.parentElement ?? disabledTeamToggle);
    const teamTooltip = await screen.findByRole('tooltip');
    expect(teamTooltip).toHaveTextContent(
      'No teams with Copilot data in the selected date range',
    );
    expect(teamTooltip).toHaveAttribute('data-placement', 'top');
  });

  it('keeps Cost center selected with an enabled empty dropdown when both lists are empty', async () => {
    const api = createApi({ costCenters: [], teams: [] });
    await renderDashboard(api);

    await waitFor(() => {
      expect(getFilterToggleButton('Cost center')).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(getFilterToggleButton('Cost center')).toBeDisabled();
      expect(getFilterToggleButton('Team')).toBeDisabled();
    });
    expect(screen.getByRole('button', { name: /Cost center/ })).toBeEnabled();
  });

  it('does not treat a loading or failed list as known empty and clears failed selections', async () => {
    const initialApi = createApi({
      costCenters: [{ id: 'cc-platform', name: 'Platform' }],
    });
    const user = userEvent.setup();
    const rendered = await renderDashboard(initialApi);

    await user.click(getFilterToggleButton('Cost center'));
    await user.click(
      await screen.findByRole('button', { name: /Cost center/ }),
    );
    await user.click(await screen.findByRole('option', { name: 'Platform' }));
    await waitFor(() =>
      expect(initialApi.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({ costCenter: 'cc-platform' }),
      ),
    );

    const pendingCostCenters = createDeferred<V2CostCenterListResponse>();
    const refreshApi = createApi();
    refreshApi.fetchCostCenters.mockReturnValue(pendingCostCenters.promise);
    rendered.rerender(createDashboard(refreshApi));

    expect(getFilterToggleButton('Cost center')).not.toBeDisabled();
    expect(getFilterToggleButton('Cost center')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await act(async () => {
      pendingCostCenters.reject(new Error('Request failed'));
      try {
        await pendingCostCenters.promise;
      } catch {
        // The hook converts the rejection into an error result.
      }
    });

    await waitFor(() =>
      expect(refreshApi.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          team: undefined,
          costCenter: undefined,
        }),
      ),
    );
    expect(getFilterToggleButton('Cost center')).not.toBeDisabled();
    expect(getFilterToggleButton('Cost center')).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await user.click(getFilterToggleButton('Team'));
    await user.click(screen.getByRole('button', { name: /team/i }));
    await user.click(await screen.findByRole('option', { name: 'platform' }));
    await waitFor(() =>
      expect(refreshApi.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({ team: 'platform', costCenter: undefined }),
      ),
    );

    const failedTeamsApi = createApi();
    failedTeamsApi.getTeams.mockRejectedValue(new Error('Request failed'));
    rendered.rerender(createDashboard(failedTeamsApi));

    await waitFor(() =>
      expect(failedTeamsApi.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({ team: undefined, costCenter: undefined }),
      ),
    );
    expect(getFilterToggleButton('Team')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(getFilterToggleButton('Team')).not.toBeDisabled();
  });

  it('keeps filter selections and options bound to their scope', async () => {
    const api = createApi({
      costCenters: [{ id: 'cc-old', name: 'Old center' }],
      teams: ['old-team'],
    });
    const user = userEvent.setup();
    const rendered = await renderDashboard(api);

    await user.click(getFilterToggleButton('Cost center'));
    await user.click(
      await screen.findByRole('button', { name: /Cost center/ }),
    );
    await user.click(await screen.findByRole('option', { name: 'Old center' }));
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          entityId: 'enterprise-1',
          costCenter: 'cc-old',
        }),
      ),
    );

    const pendingCostCenters = createDeferred<V2CostCenterListResponse>();
    const pendingTeams = createDeferred<string[]>();
    const newApi = createApi();
    newApi.fetchCostCenters.mockReturnValue(pendingCostCenters.promise);
    newApi.getTeams.mockReturnValue(pendingTeams.promise);
    rendered.rerender(createDashboard(newApi, { enterprise: 'enterprise-2' }));

    await waitFor(() =>
      expect(newApi.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          entityId: 'enterprise-2',
          team: undefined,
          costCenter: undefined,
        }),
      ),
    );
    expect(getFilterToggleButton('Team')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(await screen.findByRole('button', { name: /team/i })).toBeDisabled();

    await act(async () => {
      pendingCostCenters.resolve({
        costCenters: [{ id: 'cc-new', name: 'New center' }],
        hasUsersWithoutCostCenter: false,
      });
      pendingTeams.resolve(['new-team']);
      await Promise.all([pendingCostCenters.promise, pendingTeams.promise]);
    });

    await user.click(getFilterToggleButton('Cost center'));
    await user.click(
      await screen.findByRole('button', { name: /Cost center/ }),
    );
    expect(
      await screen.findByRole('option', { name: 'New center' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Old center' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'New center' }));
    await user.click(getFilterToggleButton('Team'));
    await user.click(screen.getByRole('button', { name: /team/i }));
    expect(
      await screen.findByRole('option', { name: 'new-team' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'old-team' }),
    ).not.toBeInTheDocument();
  });

  it('supports organization cost centers when enterprise and organization are configured', async () => {
    const api = createApi({
      costCenters: [{ id: 'cc-platform', name: 'Platform' }],
    });
    const user = userEvent.setup();
    await renderDashboard(api, {
      enterprise: 'enterprise-1',
      organization: 'org-1',
      defaultView: 'organization',
      ingestCostCenters: true,
      ingestTeams: false,
    });

    expect(
      await screen.findByRole('button', { name: /Cost center/ }),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Cost center/ }));
    await user.click(await screen.findByRole('option', { name: 'Platform' }));

    await waitFor(() =>
      expect(api.fetchCostCenters).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'organization', entityId: 'org-1' }),
      ),
    );
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'organization',
          entityId: 'org-1',
          team: undefined,
          costCenter: 'cc-platform',
        }),
      ),
    );
  });

  it('keeps real cost-center IDs distinct from the No cost center option', async () => {
    const api = createApi({
      costCenters: [{ id: '__none__', name: 'Real center' }],
      hasUsersWithoutCostCenter: true,
    });
    const user = userEvent.setup();
    await renderDashboard(api);

    await user.click(getFilterToggleButton('Cost center'));
    await user.click(
      await screen.findByRole('button', { name: /Cost center/ }),
    );
    await user.click(
      await screen.findByRole('option', { name: 'Real center' }),
    );

    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({ costCenter: '__none__' }),
      ),
    );
    expect(api.getNoCostCenterDashboardData).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Cost center/ }));
    await user.click(
      await screen.findByRole('option', { name: 'No cost center' }),
    );
    await waitFor(() =>
      expect(api.getNoCostCenterDashboardData).toHaveBeenCalled(),
    );
  });

  it('orders cost-center options by name and places No cost center last', async () => {
    const api = createApi({
      costCenters: [
        { id: 'cc-product', name: 'Product' },
        { id: 'cc-platform', name: 'Platform' },
      ],
      hasUsersWithoutCostCenter: true,
    });
    const user = userEvent.setup();
    await renderDashboard(api);

    await user.click(getFilterToggleButton('Cost center'));
    await user.click(
      await screen.findByRole('button', { name: /Cost center/ }),
    );
    const options = await screen.findAllByRole('option');

    expect(options.map(option => option.textContent)).toEqual([
      'All cost centers',
      'Platform',
      'Product',
      'No cost center',
    ]);
  });

  it('keeps the Consumption tab for selected cost centers, including No cost center', async () => {
    const api = createApi({
      costCenters: [{ id: 'cc-platform', name: 'Platform' }],
      hasUsersWithoutCostCenter: true,
    });
    const user = userEvent.setup();
    await renderDashboard(api);

    await user.click(getFilterToggleButton('Cost center'));
    await user.click(
      await screen.findByRole('button', { name: /Cost center/ }),
    );
    await user.click(await screen.findByRole('option', { name: 'Platform' }));
    expect(
      await screen.findByRole('tab', { name: 'Consumption' }),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: /Cost center/ }));
    await user.click(
      await screen.findByRole('option', { name: 'No cost center' }),
    );
    expect(
      await screen.findByRole('tab', { name: 'Consumption' }),
    ).toBeVisible();
    await waitFor(() =>
      expect(api.getNoCostCenterDashboardData).toHaveBeenLastCalledWith({
        type: 'enterprise',
        entityId: 'enterprise-1',
        from: expect.any(String),
        to: expect.any(String),
      }),
    );
  });
});
