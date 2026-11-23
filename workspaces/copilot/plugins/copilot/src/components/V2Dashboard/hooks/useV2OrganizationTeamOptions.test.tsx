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
import { copilotApiV2Ref } from '../../../api';
import type { CopilotApiV2, V2OrganizationTeamOptions } from '../../../api';
import { useV2OrganizationTeamOptions } from './useV2OrganizationTeamOptions';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('useV2OrganizationTeamOptions', () => {
  it('refetches for the selected date range without showing stale team options', async () => {
    const firstOptions: V2OrganizationTeamOptions = {
      organizations: ['org-1'],
      teams: [{ organization: 'org-1', team: 'eligible-team' }],
      hasPendingOrganizations: false,
    };
    const nextOptions: V2OrganizationTeamOptions = {
      organizations: ['org-1'],
      teams: [],
      hasPendingOrganizations: false,
    };
    const pending = deferred<V2OrganizationTeamOptions>();
    const api = {
      getOrganizationTeamOptions: jest
        .fn()
        .mockResolvedValueOnce(firstOptions)
        .mockReturnValueOnce(pending.promise),
    } as unknown as jest.Mocked<CopilotApiV2>;
    const wrapper = ({ children }: PropsWithChildren) => (
      <TestApiProvider apis={[[copilotApiV2Ref, api]]}>
        {children}
      </TestApiProvider>
    );
    const to = '2026-05-20';
    const { result, rerender } = renderHook(
      ({ from }: { from: string }) =>
        useV2OrganizationTeamOptions('org-1', from, to),
      { initialProps: { from: '2026-05-01' }, wrapper },
    );

    await waitFor(() =>
      expect(result.current.teams).toEqual(firstOptions.teams),
    );
    rerender({ from: '2026-05-10' });

    expect(api.getOrganizationTeamOptions).toHaveBeenCalledWith({
      organization: 'org-1',
      from: '2026-05-10',
      to,
    });
    expect(result.current.loading).toBe(true);
    expect(result.current.teams).toEqual([]);

    await act(async () => pending.resolve(nextOptions));
    await waitFor(() => expect(result.current.teams).toEqual([]));
    expect(result.current.loading).toBe(false);
  });
});
