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

import { EntityProvider, catalogApiRef } from '@backstage/plugin-catalog-react';
import { render, screen, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { ServiceAnnotationFieldName } from '@backstage-community/plugin-servicenow-common';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { serviceNowApiRef } from '../../api/ServiceNowBackendClient';

import userEvent from '@testing-library/user-event';
import { ServicenowContent } from './ServicenowContent';
import {
  identityApiRef,
  alertApiRef,
  errorApiRef,
} from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { of } from 'rxjs';
import { mockRefinedIncidentData } from '../../__fixtures__/mockRefinedIncidentData';

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'mock-component',
    annotations: {
      [ServiceAnnotationFieldName]: 'service-id-123',
    },
  },
};

const mockCatalogApi = {
  getEntityByRef: jest.fn().mockResolvedValue({
    spec: { profile: { email: 'mock@example.com' } },
  }),
};

const mockIdentityApi = {
  getProfileInfo: async () => ({ email: 'mock@example.com' }),
  getBackstageIdentity: async () => ({
    type: 'user' as const,
    userEntityRef: 'user:default/mockuser',
    ownershipEntityRefs: ['user:default/mockuser'],
  }),
};

const mockAlertApi = {
  post: jest.fn(),
  alert$: jest.fn(),
};

const mockErrorApi = {
  post: jest.fn(),
  error$: jest.fn(),
};

const mockTranslationApi = {
  getTranslation: jest.fn().mockReturnValue({
    ready: true,
    t: (key: string) => key,
  }),
  translation$: jest.fn().mockReturnValue(
    of({
      ready: true,
      t: (key: string) => key,
    }),
  ),
};

const theme = createTheme();

describe('ServicenowContent', () => {
  const mockServiceNowApi = {
    getIncidents: jest.fn(),
  };

  beforeEach(() => {
    mockServiceNowApi.getIncidents.mockReset();
    mockServiceNowApi.getIncidents.mockResolvedValue({
      incidents: mockRefinedIncidentData,
      totalCount: mockRefinedIncidentData.length,
    });
  });

  it('renders the table with incident rows', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <TestApiProvider
            apis={[
              [serviceNowApiRef, mockServiceNowApi],
              [catalogApiRef, mockCatalogApi],
              [identityApiRef, mockIdentityApi],
              [alertApiRef, mockAlertApi],
              [errorApiRef, mockErrorApi],
              [translationApiRef, mockTranslationApi as any],
            ]}
          >
            <EntityProvider entity={mockEntity}>
              <ServicenowContent />
            </EntityProvider>
          </TestApiProvider>
        </ThemeProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockServiceNowApi.getIncidents).toHaveBeenCalled();
    });

    expect(mockServiceNowApi.getIncidents).toHaveBeenCalledTimes(1);

    expect(
      await screen.findByText(mockRefinedIncidentData[0].number),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `ServiceNow tickets (${mockRefinedIncidentData.length})`,
      ),
    ).toBeInTheDocument();

    // First page of incidents
    mockRefinedIncidentData.slice(0, 5).forEach(incident => {
      expect(screen.getByText(incident.number)).toBeInTheDocument();
    });
  });

  it('displays pagination dropdown', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <TestApiProvider
            apis={[
              [serviceNowApiRef, mockServiceNowApi],
              [catalogApiRef, mockCatalogApi],
              [identityApiRef, mockIdentityApi],
              [alertApiRef, mockAlertApi],
              [errorApiRef, mockErrorApi],
              [translationApiRef, mockTranslationApi as any],
            ]}
          >
            <EntityProvider entity={mockEntity}>
              <ServicenowContent />
            </EntityProvider>
          </TestApiProvider>
        </ThemeProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          `ServiceNow tickets (${mockRefinedIncidentData.length})`,
        ),
      ).toBeInTheDocument();
    });

    const dropdowns = screen.getAllByRole('combobox');
    const paginationDropdown = dropdowns.find(el =>
      el.textContent?.includes('5 rows'),
    );
    expect(paginationDropdown).toBeInTheDocument();
  });

  it('shows empty content placeholder when no incidents are available', async () => {
    mockServiceNowApi.getIncidents.mockResolvedValue({
      incidents: [],
      totalCount: 0,
    });

    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <TestApiProvider
            apis={[
              [serviceNowApiRef, mockServiceNowApi],
              [catalogApiRef, mockCatalogApi],
              [identityApiRef, mockIdentityApi],
              [alertApiRef, mockAlertApi],
              [errorApiRef, mockErrorApi],
              [translationApiRef, mockTranslationApi as any],
            ]}
          >
            <EntityProvider entity={mockEntity}>
              <ServicenowContent />
            </EntityProvider>
          </TestApiProvider>
        </ThemeProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockServiceNowApi.getIncidents).toHaveBeenCalled();
    });
    expect(mockServiceNowApi.getIncidents).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByTestId('no-incidents-found')).toBeInTheDocument();
    });
  });

  it('handles search input updates', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <TestApiProvider
            apis={[
              [serviceNowApiRef, mockServiceNowApi],
              [catalogApiRef, mockCatalogApi],
              [identityApiRef, mockIdentityApi],
              [alertApiRef, mockAlertApi],
              [errorApiRef, mockErrorApi],
              [translationApiRef, mockTranslationApi as any],
            ]}
          >
            <EntityProvider entity={mockEntity}>
              <ServicenowContent />
            </EntityProvider>
          </TestApiProvider>
        </ThemeProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockServiceNowApi.getIncidents).toHaveBeenCalled();
    });

    expect(
      await screen.findByText(mockRefinedIncidentData[0].number),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Search');
    await user.type(input, 'INC001');
    expect(input).toHaveValue('INC001');
  });
});
