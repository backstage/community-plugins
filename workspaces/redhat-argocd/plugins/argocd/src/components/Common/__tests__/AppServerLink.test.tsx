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
import { render, screen } from '@testing-library/react';

import { mockApplication } from '../../../../dev/__data__';
import { Application } from '@backstage-community/plugin-redhat-argocd-common';
import AppServerLink from '../AppServerLink';
import { mockUseTranslation } from '../../../test-utils/mockTranslations';

jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe('AppServerLink', () => {
  test('should not render the server link if the application is not available', () => {
    render(<AppServerLink application={null as unknown as Application} />);
    expect(
      screen.queryByText(mockApplication.spec.destination.server),
    ).not.toBeInTheDocument();
  });

  test('should render the server link', () => {
    render(<AppServerLink application={mockApplication} />);

    expect(
      screen.queryByText(mockApplication.spec.destination.server),
    ).toBeInTheDocument();
  });

  test('should render remote cluster url as server link', () => {
    const remoteApplication: Application = {
      ...mockApplication,
      spec: {
        ...mockApplication.spec,
        destination: {
          server: 'https://remote-url.com',
          namespace: 'remote-ns',
        },
      },
    };
    render(<AppServerLink application={remoteApplication} />);

    expect(screen.queryByText('(in-cluster)')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('local-cluster-tooltip'),
    ).not.toBeInTheDocument();

    screen.getByText('https://remote-url.com');
  });
});
