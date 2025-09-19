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
import StatusHeading from '../StatusHeading';
import { mockUseTranslation } from '../../../test-utils/mockTranslations';

jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe('StatusHeading', () => {
  test('should not render if the application is not available', () => {
    render(<StatusHeading app={null as unknown as Application} />);
    expect(screen.queryByText('app-sync-status-chip')).not.toBeInTheDocument();
  });

  test('should render if the application is available', () => {
    render(<StatusHeading app={mockApplication} />);

    expect(screen.queryByTestId('app-health-status-chip')).toBeInTheDocument();
    expect(screen.queryByTestId('app-sync-status-chip')).toBeInTheDocument();
  });
});
