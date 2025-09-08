/*
 * Copyright 2025 The Backstage Authors
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
import { Announcement } from '@backstage-community/plugin-announcements-common';

import { AnnouncementForm } from './AnnouncementForm';
import { screen } from '@testing-library/react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

const mockAnnouncementsApi = {
  announcements: jest.fn().mockResolvedValue({
    count: 0,
    results: [],
  }),
};

const mockCatalogApi = {
  getEntities: async () => ({ items: [] }),
};

const renderAnnouncementForm = async ({ active }: { active?: boolean }) => {
  await renderInTestApp(
    <TestApiProvider
      apis={[
        [announcementsApiRef, mockAnnouncementsApi],
        [catalogApiRef, mockCatalogApi],
      ]}
    >
      <AnnouncementForm
        initialData={{ active } as Announcement}
        onSubmit={jest.fn()}
      />
    </TestApiProvider>,
  );
};

describe('Announcement Form', () => {
  it('should render "active" switch unchecked if initial value is not present', async () => {
    await renderAnnouncementForm({});
    expect(screen.getByRole('checkbox', { name: 'Active' })).not.toBeChecked();
  });

  it('should render "active" switch checked if initial value is true', async () => {
    await renderAnnouncementForm({ active: true });
    expect(screen.getByRole('checkbox', { name: 'Active' })).toBeChecked();
  });
});
