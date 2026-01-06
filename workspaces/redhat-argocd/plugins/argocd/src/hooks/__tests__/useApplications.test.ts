/*
 * Copyright 2024 The Backstage Authors
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
import { useApi } from '@backstage/core-plugin-api';

import { renderHook, waitFor } from '@testing-library/react';

import {
  mockApplication,
  mockQuarkusApplication,
  preProdApplication,
} from '../../../dev/__data__';
import { useApplications } from '../useApplications';
import { useArgocdConfig } from '../useArgocdConfig';
import { SearchApplicationsOptions } from '../../api';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('../useArgocdConfig', () => ({
  useArgocdConfig: jest.fn(),
}));

describe('useApplications', () => {
  beforeEach(() => {
    (useApi as any).mockReturnValue({
      searchApplications: async (
        _instanceNames: string[],
        options: SearchApplicationsOptions,
      ) => {
        if (options.appName) {
          return Promise.resolve([mockApplication]);
        } else if (options.appSelector) {
          return Promise.resolve([mockQuarkusApplication, preProdApplication]);
        }
        return Promise.resolve([]);
      },
    });
    (useArgocdConfig as any).mockReturnValue({
      instances: [{ name: 'main', url: 'https://kubernetes.default.svc' }],
      intervalMs: 10000,
    });
  });

  test('should return empty if no applications are available', async () => {
    (useApi as any).mockReturnValue({
      searchApplications: async () => {
        return Promise.resolve([]);
      },
    });
    const { result } = renderHook(() =>
      useApplications({
        instanceNames: ['main'],
        appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
      }),
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(0);
    });
  });

  test('should return the applications and loading state when the appSelector is passed', async () => {
    const { result } = renderHook(() =>
      useApplications({
        instanceNames: ['main'],
        appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
      }),
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(2);
      expect(result.current.apps[0]).toEqual(mockQuarkusApplication);
      expect(result.current.apps[1]).toEqual(preProdApplication);
    });
  });

  test('should return the applications and loading state when the app selector updates', async () => {
    const { result, rerender } = renderHook(prop => useApplications(prop), {
      initialProps: {
        instanceNames: ['main'],
        appSelector: 'rht.gitops.com/quarkus-app-test',
      },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(2);
    });

    rerender({
      instanceNames: ['main'],
      appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(2);
    });
  });

  test('should return the applications and loading state when the appName is passed', async () => {
    const { result } = renderHook(prop => useApplications(prop), {
      initialProps: {
        instanceNames: ['main'],
        appSelector: null as unknown as string,
        appName: 'quarkus-app-test',
      },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(1);
    });
  });

  test('should return the applications and loading state when the app name updates', async () => {
    const { result, rerender } = renderHook(prop => useApplications(prop), {
      initialProps: {
        instanceNames: ['main'],
        appSelector: null as unknown as string,
        appName: 'quarkus-app',
      },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(1);
    });

    rerender({
      instanceNames: ['main'],
      appSelector: null as unknown as string,
      appName: 'quarkus-test-app',
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(1);
    });
  });
});
