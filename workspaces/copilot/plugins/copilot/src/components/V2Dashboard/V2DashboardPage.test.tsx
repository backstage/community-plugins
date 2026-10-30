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
import { V2DashboardData } from '@backstage-community/plugin-copilot-common';
import { CopilotApiV2, copilotApiV2Ref } from '../../api';
import { V2DashboardPage } from './V2DashboardPage';

jest.mock('./charts', () => {
  const Noop = () => null;
  return {
    IDEActiveUsersChart: Noop,
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

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

const createApi = () =>
  ({
    getTeams: jest.fn().mockResolvedValue(['old-team']),
    getDashboardData: jest.fn().mockResolvedValue(EMPTY_DASHBOARD),
  } as unknown as jest.Mocked<CopilotApiV2>);

const createDashboard = (
  api: jest.Mocked<CopilotApiV2>,
  defaultView: 'enterprise' | 'organization',
) => (
  <TestApiProvider
    apis={[
      [
        configApiRef,
        new ConfigReader({
          copilot: {
            enterprise: 'enterprise-1',
            organization: 'org-1',
            defaultView,
          },
        }),
      ],
      [copilotApiV2Ref, api],
    ]}
  >
    <V2DashboardPage />
  </TestApiProvider>
);

describe('V2DashboardPage team selection', () => {
  it('clears a scoped team selection and hides stale team options while loading a new scope', async () => {
    const api = createApi();
    const user = userEvent.setup();
    const rendered = await renderInTestApp(createDashboard(api, 'enterprise'));

    await user.click(await screen.findByRole('button', { name: /Team/ }));
    await user.click(await screen.findByRole('option', { name: 'old-team' }));
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'enterprise',
          entityId: 'enterprise-1',
          team: 'old-team',
        }),
      ),
    );

    const pendingTeams = createDeferred<string[]>();
    api.getTeams.mockImplementation(({ entityId }) =>
      entityId === 'org-1'
        ? pendingTeams.promise
        : Promise.resolve(['old-team']),
    );
    rendered.rerender(createDashboard(api, 'organization'));

    await waitFor(() =>
      expect(api.getTeams).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'organization',
          entityId: 'org-1',
        }),
      ),
    );
    await waitFor(() =>
      expect(api.getDashboardData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'organization',
          entityId: 'org-1',
          team: undefined,
        }),
      ),
    );
    expect(
      screen.queryByRole('button', { name: /Team/ }),
    ).not.toBeInTheDocument();

    await act(async () => {
      pendingTeams.resolve(['new-team']);
      await pendingTeams.promise;
    });

    await user.click(await screen.findByRole('button', { name: /Team/ }));
    expect(
      await screen.findByRole('option', { name: 'new-team' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'old-team' }),
    ).not.toBeInTheDocument();
  });
});
