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

import { fireEvent, render, screen } from '@testing-library/react';

import { mockApplication } from '../../../../dev/__data__';
import DeploymentLifecycleHeader from '../DeploymentLifecycleHeader';

describe('DeploymentLifecycleCardHeader', () => {
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
                    instances: [
                      {
                        name: 'main',
                        url: 'https://test.com',
                      },
                    ],
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

  test('should render the deployment lifecylce appliction header', () => {
    render(<DeploymentLifecycleHeader app={mockApplication} />, { wrapper });

    expect(screen.queryByText('quarkus-app-dev')).toBeInTheDocument();
    expect(screen.queryByTestId('quarkus-app-dev-link')).toBeInTheDocument();
  });

  test('should render the deployment lifecylce appliction header link with instance url', () => {
    render(<DeploymentLifecycleHeader app={mockApplication} />, { wrapper });
    const link = screen.queryByTestId(
      'quarkus-app-dev-link',
    ) as HTMLLinkElement;

    fireEvent.click(link);

    expect(link).toHaveAttribute(
      'href',
      'https://test.com/applications/quarkus-app-dev',
    );
  });

  test('should render the deployment lifecylce appliction header with base url', () => {
    const apiProviderWrapper = ({ children }: { children: ReactNode }) => {
      return (
        <TestApiProvider
          apis={[
            [
              configApiRef,
              new MockConfigApi({
                argocd: {
                  baseUrl: 'https://baseurl.com',
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

    render(<DeploymentLifecycleHeader app={mockApplication} />, {
      wrapper: apiProviderWrapper,
    });
    const link = screen.queryByTestId(
      'quarkus-app-dev-link',
    ) as HTMLLinkElement;

    expect(link).toHaveAttribute(
      'href',
      'https://baseurl.com/applications/quarkus-app-dev',
    );
  });
});
