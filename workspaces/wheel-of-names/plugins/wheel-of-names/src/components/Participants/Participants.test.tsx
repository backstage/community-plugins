/*
 * Copyright 2026 The Backstage Authors
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
import { Entity } from '@backstage/catalog-model';
import { configApiRef } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  mockApis,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Participants } from './Participants';

const SEARCH_LABEL = 'Search users and groups';

const jane: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'User',
  metadata: { name: 'jane', uid: 'user-jane' },
  spec: { profile: { displayName: 'Jane Doe' } },
};

const renderParticipants = async (items: Entity[]) => {
  const catalogApi = {
    queryEntities: jest
      .fn()
      .mockResolvedValue({ items, totalItems: items.length, pageInfo: {} }),
  };

  await renderInTestApp(
    <TestApiProvider
      apis={[
        [catalogApiRef, catalogApi],
        [configApiRef, mockApis.config()],
      ]}
    >
      <Participants onParticipantsChange={jest.fn()} />
    </TestApiProvider>,
  );

  return catalogApi;
};

describe('Participants', () => {
  beforeAll(() => {
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  it('labels the search field and searches the catalog for what is typed', async () => {
    const catalogApi = await renderParticipants([jane]);

    await userEvent.type(
      screen.getByRole('textbox', { name: SEARCH_LABEL }),
      'jane',
    );

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    expect(catalogApi.queryEntities).toHaveBeenCalledWith(
      expect.objectContaining({
        fullTextFilter: expect.objectContaining({ term: 'jane' }),
      }),
    );
  });

  it('shows a hint when the search matches no users or groups', async () => {
    const catalogApi = await renderParticipants([]);

    await userEvent.type(screen.getByLabelText(SEARCH_LABEL), 'nobody');

    // The hint also shows for a moment before the search starts; wait for the
    // search so the assertion is about its empty result.
    await waitFor(() =>
      expect(catalogApi.queryEntities).toHaveBeenCalledWith(
        expect.objectContaining({
          fullTextFilter: expect.objectContaining({ term: 'nobody' }),
        }),
      ),
    );
    expect(
      await screen.findByText(
        'No users or groups found. Try a different search term.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/results$/)).not.toBeInTheDocument();
  });
});
