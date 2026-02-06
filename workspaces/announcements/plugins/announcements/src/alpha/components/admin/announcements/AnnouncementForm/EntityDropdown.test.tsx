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
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EntityDropdown from './EntityDropdown';

jest.mock('@backstage-community/plugin-announcements-react', () => ({
  useAnnouncementsTranslation: () => ({ t: (key: string) => key }),
}));

const mockIdentityApi = {
  getBackstageIdentity: jest.fn().mockResolvedValue({
    userEntityRef: 'user:default/test-user',
    ownershipEntityRefs: ['group:default/team-a'],
  }),
};

const mockCatalogApi = {
  queryEntities: jest.fn().mockResolvedValue({
    items: [
      {
        kind: 'Component',
        metadata: {
          name: 'service-a',
          namespace: 'default',
          title: 'Service A',
        },
      },
      {
        kind: 'System',
        metadata: {
          name: 'system-b',
          namespace: 'default',
        },
      },
      {
        kind: 'API',
        metadata: {
          name: 'api-c',
          namespace: 'default',
          title: 'API C',
        },
      },
    ],
  }),
};

jest.mock('@backstage/core-plugin-api', () => ({
  identityApiRef: {},
  useApi: (ref: any) => {
    if (ref === require('@backstage/core-plugin-api').identityApiRef) {
      return mockIdentityApi;
    }
    if (ref === require('@backstage/plugin-catalog-react').catalogApiRef) {
      return mockCatalogApi;
    }
    return undefined;
  },
}));

jest.mock('@backstage/plugin-catalog-react', () => ({
  catalogApiRef: {},
}));

jest.mock('@backstage/catalog-model', () => ({
  stringifyEntityRef: (entity: any) =>
    `${entity.kind.toLowerCase()}:${entity.metadata.namespace || 'default'}/${
      entity.metadata.name
    }`,
}));

describe('EntityDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display the dropdown with correct entity options', async () => {
    const handleChange = jest.fn();

    render(<EntityDropdown selectedEntity="" onChange={handleChange} />);

    await waitFor(() => {
      expect(mockCatalogApi.queryEntities).toHaveBeenCalledWith({
        filter: [
          {
            kind: ['Component', 'System', 'API', 'Domain', 'Resource'],
            'relations.ownedBy': [
              'user:default/test-user',
              'group:default/team-a',
            ],
          },
        ],
      });
    });

    const dropdown = screen.getByLabelText('announcementForm.entity');
    await userEvent.click(dropdown);

    await waitFor(() => {
      const serviceAOptions = screen.getAllByText(
        'component:default/service-a',
      );
      expect(serviceAOptions.length).toBeGreaterThan(0);

      const systemBOptions = screen.getAllByText('system:default/system-b');
      expect(systemBOptions.length).toBeGreaterThan(0);

      const apiCOptions = screen.getAllByText('api:default/api-c');
      expect(apiCOptions.length).toBeGreaterThan(0);
    });
  });

  it('should call onChange when an entity is selected', async () => {
    const handleChange = jest.fn();

    render(<EntityDropdown selectedEntity="" onChange={handleChange} />);

    await waitFor(() => {
      expect(mockCatalogApi.queryEntities).toHaveBeenCalled();
    });

    const dropdown = screen.getByLabelText('announcementForm.entity');
    await userEvent.click(dropdown);

    const options = await screen.findAllByText('component:default/service-a');
    // Click the visible option (not the hidden select option)
    await userEvent.click(options[1]);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('component:default/service-a');
    });
  });

  it('should handle empty entities list', async () => {
    mockCatalogApi.queryEntities.mockResolvedValueOnce({
      items: [],
    });

    const handleChange = jest.fn();

    render(<EntityDropdown selectedEntity="" onChange={handleChange} />);

    await waitFor(() => {
      expect(mockCatalogApi.queryEntities).toHaveBeenCalled();
    });

    const dropdown = screen.getByLabelText('announcementForm.entity');
    expect(dropdown).toBeDisabled();
  });

  it('should display selected entity', async () => {
    const handleChange = jest.fn();

    render(
      <EntityDropdown
        selectedEntity="component:default/service-a"
        onChange={handleChange}
      />,
    );

    await waitFor(() => {
      expect(mockCatalogApi.queryEntities).toHaveBeenCalled();
    });

    // Check that the selected entity is displayed in the button
    const selectedText = await screen.findAllByText(
      'component:default/service-a',
    );
    expect(selectedText[0]).toBeInTheDocument();
  });
});
