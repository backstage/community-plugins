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
import { render } from '@testing-library/react';
import {
  healthStatusMenuItems,
  syncStatusMenuItems,
  kindFilterMenuItems,
} from '../Filters';
import { FiltersType } from '../../../../../../types/resources';
import { mockUseTranslation } from '../../../../../../test-utils/mockTranslations';

jest.mock('../../../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe('Filters', () => {
  let filters: FiltersType;

  beforeEach(() => {
    filters = {
      Kind: ['Pod'],
      HealthStatus: ['Healthy'],
      SyncStatus: ['Synced'],
      SearchByName: [],
    };
  });

  it('should render with selected health status menu items', () => {
    const { t } = mockUseTranslation();
    const { getByText } = render(healthStatusMenuItems(filters, t as any));
    expect(getByText('Healthy')).toBeInTheDocument();
  });

  it('should render with selected sync status menu items', () => {
    const { t } = mockUseTranslation();
    const { getByText } = render(syncStatusMenuItems(filters, t as any));
    expect(getByText('Synced')).toBeInTheDocument();
  });

  it('should render with selected kind filter menu items', () => {
    const { getByText } = render(
      kindFilterMenuItems(['Pod', 'Service'], filters),
    );
    expect(getByText('Pod')).toBeInTheDocument();
  });
});
