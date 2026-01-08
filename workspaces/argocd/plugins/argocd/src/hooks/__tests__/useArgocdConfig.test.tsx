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
import type { ReactNode } from 'react';

import { configApiRef } from '@backstage/core-plugin-api';
import { MockConfigApi, TestApiProvider } from '@backstage/test-utils';

import { renderHook } from '@testing-library/react';

import { useArgocdConfig } from '../useArgocdConfig';

describe('useArgocdConfig', () => {
  it('should return default instance and refreshInterval', () => {
    const wrapper = ({ children }: { children: ReactNode }) => {
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
    const wrapper = ({ children }: { children: ReactNode }) => {
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
    const wrapper = ({ children }: { children: ReactNode }) => {
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

    const wrapper = ({ children }: { children: ReactNode }) => {
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
