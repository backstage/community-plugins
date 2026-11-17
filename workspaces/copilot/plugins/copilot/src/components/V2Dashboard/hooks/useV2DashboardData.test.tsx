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

import type { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import type { V2DashboardData } from '@backstage-community/plugin-copilot-common';
import { copilotApiV2Ref } from '../../../api';
import type { CopilotApiV2, V2MetricsParams } from '../../../api';
import { useV2DashboardData } from './useV2DashboardData';

const emptyDashboard = (): V2DashboardData => ({
  daily: [],
  byFeature: [],
  byLanguage: [],
  byModelFeature: [],
  byLanguageModel: [],
  prMetrics: [],
  customizationMetrics: [],
  customizationSummaries: [],
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('useV2DashboardData', () => {
  it('hides data from the previous scope until the current query resolves', async () => {
    const firstParams: V2MetricsParams = {
      type: 'organization',
      entityId: 'org-1',
      from: '2026-05-01',
      to: '2026-05-20',
      team: 'platform',
    };
    const secondParams = { ...firstParams, entityId: 'org-2' };
    const firstData = emptyDashboard();
    const secondData = emptyDashboard();
    const pending = deferred<V2DashboardData>();
    const api = {
      getDashboardData: jest.fn(),
      getNoCostCenterDashboardData: jest.fn(),
    } as unknown as jest.Mocked<CopilotApiV2>;
    api.getDashboardData.mockImplementation(async params =>
      params.entityId === firstParams.entityId ? firstData : pending.promise,
    );
    const wrapper = ({ children }: PropsWithChildren) => (
      <TestApiProvider apis={[[copilotApiV2Ref, api]]}>
        {children}
      </TestApiProvider>
    );
    const { result, rerender } = renderHook(
      ({ params }: { params: V2MetricsParams }) => useV2DashboardData(params),
      { initialProps: { params: firstParams }, wrapper },
    );

    await waitFor(() => expect(result.current.data).toBe(firstData));
    rerender({ params: secondParams });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).not.toBe(firstData);

    await act(async () => pending.resolve(secondData));
    await waitFor(() => expect(result.current.data).toBe(secondData));
  });
});
