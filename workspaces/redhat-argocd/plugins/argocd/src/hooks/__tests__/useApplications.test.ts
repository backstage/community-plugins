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
      getApplication: async () => {
        return Promise.resolve(mockApplication);
      },
      listApps: async () => {
        return Promise.resolve({ items: [mockApplication] });
      },
    });
    (useArgocdConfig as any).mockReturnValue({
      instances: [{ name: 'main', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
    });
  });

  test('should return empty if appselector is not passed', async () => {
    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({});
      },
    });
    const { result } = renderHook(() =>
      useApplications({
        instanceNames: ['main'],
        appSelector: null as unknown as string,
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
      expect(result.current.apps).toHaveLength(0);
    });
  });

  test('should return empty if no applications are available', async () => {
    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({});
      },
    });
    const { result } = renderHook(() =>
      useApplications({
        instanceNames: ['main'],
        intervalMs: 10000,
        appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
      }),
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(0);
    });
  });

  test('should return the applications and loading state', async () => {
    const { result } = renderHook(() =>
      useApplications({
        instanceNames: ['main'],
        intervalMs: 10000,
        appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
      }),
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(1);
    });
  });

  test('should return the applications and loading state when the app selector updates', async () => {
    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({ items: [mockApplication] });
      },
    });

    const { result, rerender } = renderHook(prop => useApplications(prop), {
      initialProps: {
        instanceNames: ['main'],
        intervalMs: 10000,
        appSelector: 'rht.gitops.com/quarkus-app-test',
      },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(1);
    });

    rerender({
      instanceNames: ['main'],
      intervalMs: 10000,
      appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(1);
    });
  });

  test('should invoke listApps method when appSelector is passed', async () => {
    const mockListApps = jest.fn();
    const mockgetApplication = jest.fn();

    (useApi as any).mockReturnValue({
      getApplication: mockgetApplication,
      listApps: mockListApps,
    });

    renderHook(() =>
      useApplications({
        instanceNames: ['main'],
        intervalMs: 10000,
        appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
      }),
    );

    await waitFor(() => {
      expect(mockListApps).toHaveBeenCalled();
      expect(mockgetApplication).not.toHaveBeenCalled();
    });
  });

  test('should invoke getApplication method if appName is passed', async () => {
    const mockListApps = jest.fn();
    const mockgetApplication = jest.fn();
    (useApi as any).mockReturnValue({
      getApplication: mockgetApplication,
      listApps: mockListApps,
    });

    renderHook(() =>
      useApplications({
        instanceNames: ['main'],
        intervalMs: 10000,
        appSelector: null as unknown as string,
        appName: 'quarkus-app-bootstrap',
      }),
    );

    await waitFor(() => {
      expect(mockgetApplication).toHaveBeenCalled();
      expect(mockListApps).not.toHaveBeenCalled();
    });
  });

  test('should return single application and loading state when the appName is passed', async () => {
    (useApi as any).mockReturnValue({
      getApplication: async () => {
        return Promise.resolve({ items: [mockApplication] });
      },
    });

    const { result } = renderHook(prop => useApplications(prop), {
      initialProps: {
        instanceNames: ['main'],
        intervalMs: 10000,
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

  test('should add instance to single application if missing from response when the appName is passed', async () => {
    (useApi as any).mockReturnValue({
      getApplication: async () => {
        return Promise.resolve({
          ...mockApplication,
          metadata: { ...mockApplication.metadata, instance: {} },
        });
      },
    });

    const { result } = renderHook(prop => useApplications(prop), {
      initialProps: {
        instanceNames: ['main'],
        intervalMs: 10000,
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
      expect(result.current.apps[0].metadata.instance).toEqual({
        name: 'main',
        url: 'https://main-instance-url.com',
      });
    });
  });

  test('should return the applications and loading state when the app name updates', async () => {
    (useApi as any).mockReturnValue({
      getApplication: async () => {
        return Promise.resolve(mockApplication);
      },
    });

    const { result, rerender } = renderHook(prop => useApplications(prop), {
      initialProps: {
        instanceNames: ['main'],
        intervalMs: 10000,
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
      intervalMs: 10000,
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

  describe('multiple instances', () => {
    test('should invoke listApps method for each instance when appSelector is passed', async () => {
      const mockListApps = jest.fn().mockResolvedValue({ items: [] });

      (useApi as any).mockReturnValue({
        listApps: mockListApps,
      });

      renderHook(() =>
        useApplications({
          instanceNames: ['main', 'secondary'],
          intervalMs: 10000,
          appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
        }),
      );

      await waitFor(() => {
        expect(mockListApps).toHaveBeenCalledTimes(2);
        expect(mockListApps).toHaveBeenCalledWith(
          expect.objectContaining({ url: '/argoInstance/main' }),
        );
        expect(mockListApps).toHaveBeenCalledWith(
          expect.objectContaining({ url: '/argoInstance/secondary' }),
        );
      });
    });

    test('should invoke getApplication method for each instance if appName is passed', async () => {
      const mockGetApplication = jest.fn().mockResolvedValue(mockApplication);

      (useApi as any).mockReturnValue({
        getApplication: mockGetApplication,
      });

      renderHook(() =>
        useApplications({
          instanceNames: ['main', 'secondary'],
          intervalMs: 10000,
          appSelector: null as unknown as string,
          appName: 'quarkus-app-dev',
        }),
      );

      await waitFor(() => {
        expect(mockGetApplication).toHaveBeenCalledTimes(2);
        expect(mockGetApplication).toHaveBeenCalledWith(
          expect.objectContaining({ url: '/argoInstance/main' }),
        );
        expect(mockGetApplication).toHaveBeenCalledWith(
          expect.objectContaining({ url: '/argoInstance/secondary' }),
        );
      });
    });

    test('should combine applications from multiple instances when using appSelector', async () => {
      (useApi as any).mockReturnValue({
        listApps: jest
          .fn()
          .mockResolvedValueOnce({ items: [mockApplication] })
          .mockResolvedValueOnce({ items: [] })
          .mockResolvedValueOnce({
            items: [mockQuarkusApplication, preProdApplication],
          }),
      });

      const { result } = renderHook(() =>
        useApplications({
          instanceNames: ['main', 'secondary', 'tertiary'],
          intervalMs: 10000,
          appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
        }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.apps).toHaveLength(3);
        expect(result.current.apps[0].metadata?.name).toBe('quarkus-app-dev');
        expect(result.current.apps[1].metadata?.name).toBe('quarkus-app');
        expect(result.current.apps[2].metadata?.name).toBe(
          'quarkus-app-preprod',
        );
      });
    });

    test('should combine applications from multiple instances when using appName', async () => {
      (useApi as any).mockReturnValue({
        getApplication: jest
          .fn()
          .mockResolvedValueOnce(mockApplication)
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({
            mockQuarkusApplication,
          }),
      });

      const { result } = renderHook(() =>
        useApplications({
          instanceNames: ['main', 'secondary', 'tertiary'],
          intervalMs: 10000,
          appSelector: null as unknown as string,
          appName: 'quarkus-app',
        }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.apps).toHaveLength(2);
        expect(result.current.apps[0].metadata?.name).toBe('quarkus-app-dev');
        expect(result.current.apps[1].metadata?.name).toBe('quarkus-app');
      });
    });

    test('should return empty array when no applications are found across multiple instances', async () => {
      (useApi as any).mockReturnValue({
        listApps: jest.fn().mockResolvedValue({ items: [] }),
      });

      const { result } = renderHook(() =>
        useApplications({
          instanceNames: ['main', 'secondary', 'tertiary'],
          intervalMs: 10000,
          appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
        }),
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.apps).toHaveLength(0);
      });
    });
  });
});
