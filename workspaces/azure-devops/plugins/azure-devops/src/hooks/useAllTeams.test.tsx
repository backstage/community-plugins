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

import { renderHook, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { AzureDevOpsApi, azureDevOpsApiRef } from '../api';
import { useAllTeams } from './useAllTeams';

describe('useAllTeams', () => {
  const getAllTeamsMock = jest.fn();
  const azureDevOpsApi = {
    getAllTeams: getAllTeamsMock,
  } as Partial<AzureDevOpsApi> as AzureDevOpsApi;

  const Wrapper = (props: { children?: React.ReactNode }) => (
    <TestApiProvider apis={[[azureDevOpsApiRef, azureDevOpsApi]]}>
      {props.children}
    </TestApiProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not call getAllTeams when host is undefined', async () => {
    const { result } = renderHook(() => useAllTeams(undefined, 'myOrg'), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getAllTeamsMock).not.toHaveBeenCalled();
  });

  it('should not call getAllTeams when org is undefined', async () => {
    const { result } = renderHook(() => useAllTeams('host.com', undefined), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getAllTeamsMock).not.toHaveBeenCalled();
  });

  it('should call getAllTeams when both host and org are provided', async () => {
    getAllTeamsMock.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAllTeams('host.com', 'myOrg'), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getAllTeamsMock).toHaveBeenCalledWith(
      undefined,
      'host.com',
      'myOrg',
    );
    expect(result.current.teams).toEqual([]);
  });
});
