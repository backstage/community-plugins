import React from 'react';

import { configApiRef } from '@backstage/core-plugin-api';
import { MockConfigApi, TestApiProvider } from '@backstage/test-utils';

import { fireEvent, render, screen } from '@testing-library/react';

import { mockApplication } from '../../../../dev/__data__';
import DeploymentLifecycleHeader from '../DeploymentLifecycleHeader';

describe('DeploymentLifecycleCardHeader', () => {
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
    const apiProviderWrapper = ({
      children,
    }: {
      children: React.ReactNode;
    }) => {
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
