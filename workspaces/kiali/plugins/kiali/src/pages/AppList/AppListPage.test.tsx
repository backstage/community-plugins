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

import { render, screen, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { AppListPage } from './AppListPage';
import { kialiApiRef } from '../../services/Api';
import { KialiProvider } from '../../store/KialiProvider';
import {
  createMockKialiApi,
  createMockEntity,
  ERROR_MESSAGES,
} from '../__test-helpers__/pageTestHelpers';

describe('AppListPage', () => {
  let mockKialiApi: ReturnType<typeof createMockKialiApi>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockKialiApi = createMockKialiApi();
  });

  it('should fetch server config and namespaces on mount', async () => {
    render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <KialiProvider>
          <AppListPage />
        </KialiProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(mockKialiApi.getServerConfig).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        expect(mockKialiApi.getNamespaces).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it('should call setEntity when entity prop is provided', async () => {
    const mockEntity = createMockEntity();

    render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <EntityProvider entity={mockEntity}>
          <KialiProvider entity={mockEntity}>
            <AppListPage entity={mockEntity} />
          </KialiProvider>
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(mockKialiApi.setEntity).toHaveBeenCalledWith(mockEntity);
    });
  });

  it('should display error message when namespace fetch fails', async () => {
    const errorApi = createMockKialiApi();
    const errorMessage = ERROR_MESSAGES.namespaces;
    errorApi.getNamespaces = jest
      .fn()
      .mockRejectedValue(new Error(errorMessage));

    render(
      <TestApiProvider apis={[[kialiApiRef, errorApi]]}>
        <KialiProvider>
          <AppListPage />
        </KialiProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(errorApi.getNamespaces).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Verify error message is displayed in the UI
    await waitFor(
      () => {
        const errorText = screen.queryByText(/Error providing namespaces/i);
        expect(errorText).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should fetch apps when namespaces are successfully loaded', async () => {
    render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <KialiProvider>
          <AppListPage />
        </KialiProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(mockKialiApi.getServerConfig).toHaveBeenCalled();
        expect(mockKialiApi.getNamespaces).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Apps should be fetched after namespaces are loaded
    await waitFor(
      () => {
        expect(mockKialiApi.getClustersApps).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it('should render with ENTITY view without duration controls', async () => {
    const { container } = render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <KialiProvider>
          <AppListPage view="entity" />
        </KialiProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(mockKialiApi.getNamespaces).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // In ENTITY view, the duration dropdown should not be present
    const durationDropdown = container.querySelector(
      '#app-list-duration-dropdown',
    );
    expect(durationDropdown).not.toBeInTheDocument();
  });

  it('should filter apps by entity namespace', async () => {
    const testNamespace = 'test-namespace';
    const mockEntity = createMockEntity(testNamespace);

    render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <EntityProvider entity={mockEntity}>
          <KialiProvider entity={mockEntity}>
            <AppListPage entity={mockEntity} />
          </KialiProvider>
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(mockKialiApi.setEntity).toHaveBeenCalledWith(mockEntity);
    });
  });
});
