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

import { default as React } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useTopActiveItems } from './useTopActiveItems';
import { rollbarApiRef } from '../api';
import { TestApiProvider } from '@backstage/test-utils';
import { Entity } from '@backstage/catalog-model';
import { configApiRef } from '@backstage/core-plugin-api';

describe('useTopActiveItems', () => {
  const mockApi = {
    getTopActiveItems: jest.fn(),
  };

  const entity: Entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'test-service',
      annotations: {
        'rollbar.com/project-slug': 'foo/bar',
        'rollbar.com/environment': 'qa',
      },
    },
    spec: {},
  };

  it('should use the environment annotation', async () => {
    mockApi.getTopActiveItems.mockResolvedValueOnce([
      { item: { occurrences: 2 } },
      { item: { occurrences: 5 } },
    ]);
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestApiProvider
        apis={[
          [rollbarApiRef, mockApi],
          [configApiRef, {}],
        ]}
      >
        {children}
      </TestApiProvider>
    );
    const { result, waitForNextUpdate } = renderHook(
      () => useTopActiveItems(entity),
      { wrapper },
    );
    await waitForNextUpdate();
    expect(mockApi.getTopActiveItems).toHaveBeenCalledWith('bar', 168, 'qa');
    expect(result.current.items[0].item.occurrences).toBe(5);
    expect(result.current.items[1].item.occurrences).toBe(2);
  });
});
