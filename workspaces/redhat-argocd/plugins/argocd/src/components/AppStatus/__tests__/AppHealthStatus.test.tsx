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
import { mockUseTranslation } from '../../../test-utils/mockTranslations';
import AppHealthStatus from '../AppHealthStatus';

jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe('AppHealthStatus', () => {
  test('should return default component', () => {
    render(<AppHealthStatus app={mockApplication} />);

    expect(screen.queryByTestId('healthy-icon')).toBeInTheDocument();
    expect(screen.queryByText('Healthy')).toBeInTheDocument();
  });

  test('should return application health chip component', () => {
    render(<AppHealthStatus app={mockApplication} isChip />);

    expect(screen.getByTestId('app-health-status-chip')).toBeInTheDocument();
  });
});
