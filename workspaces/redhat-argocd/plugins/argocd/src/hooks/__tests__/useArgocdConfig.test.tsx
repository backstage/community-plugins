import React from 'react';

import { configApiRef } from '@backstage/core-plugin-api';
import { MockConfigApi, TestApiProvider } from '@backstage/test-utils';

import { renderHook } from '@testing-library/react';

import { useArgocdConfig } from '../useArgocdConfig';

describe('useArgocdConfig', () => {
  it('should return default instance and refreshInterval', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <TestApiProvider
          apis={[
            [
              configApiRef,
              new MockConfigApi({
                argocd: {
                  appLocatorMethods: [],
                },
              }),
            ],
          ]}
        >
          {children}
        </TestApiProvider>
      );
    };

    const { result } = renderHook(() => useArgocdConfig(), { wrapper });

    expect(result.current.instances).toHaveLength(0);
    expect(result.current.intervalMs).toBe(10000);
    expect(result.current.baseUrl).toBeUndefined();
  });

  it('should return default name and url', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <TestApiProvider
          apis={[
            [
              configApiRef,
              new MockConfigApi({
                argocd: {
                  appLocatorMethods: [
                    {
                      instances: [{}],
                      type: 'config',
                    },
                  ],
                },
              }),
            ],
          ]}
        >
          {children}
        </TestApiProvider>
      );
    };

    const { result } = renderHook(() => useArgocdConfig(), { wrapper });

    expect(result.current.instances).toHaveLength(1);
    expect(result.current.instances[0].name).toBe('');
    expect(result.current.instances[0].url).toBe('');
  });

  it('should return base url', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <TestApiProvider
          apis={[
            [
              configApiRef,
              new MockConfigApi({
                argocd: {
                  baseUrl: 'https://argo-base-url.com',
                  appLocatorMethods: [
                    {
                      instances: [{}],
                      type: 'config',
                    },
                  ],
                },
              }),
            ],
          ]}
        >
          {children}
        </TestApiProvider>
      );
    };

    const { result } = renderHook(() => useArgocdConfig(), { wrapper });

    expect(result.current.baseUrl).toBe('https://argo-base-url.com');
  });

  it('should return configured instance and refreshInterval', () => {
    const mockConfig = new MockConfigApi({
      argocd: {
        refreshInterval: 50000,
        appLocatorMethods: [
          {
            instances: [
              {
                name: 'test',
                url: 'https://test.com',
              },
            ],
            type: 'config',
          },
        ],
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <TestApiProvider apis={[[configApiRef, mockConfig]]}>
          {children}
        </TestApiProvider>
      );
    };

    const { result } = renderHook(() => useArgocdConfig(), { wrapper });

    expect(result.current.instances).toHaveLength(1);
    expect(result.current.instances[0].url).toBe('https://test.com');
    expect(result.current.intervalMs).toBe(50000);
  });
});
