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
import { coreApis } from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { CatalogProcessorResult } from '../../types';
import { EntityValidationOutput } from './EntityValidationOutput';

const entityResult = (entity: unknown) =>
  ({
    type: 'entity',
    entity: entity as Entity,
    location: { type: 'url', target: 'http://localhost' },
  } as CatalogProcessorResult);

describe('EntityValidationOutput', () => {
  it('renders one row per result for repeated and unnamed entities', async () => {
    const named = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'service-a' },
    };
    const unnamed = { apiVersion: 'backstage.io/v1alpha1', kind: 'Component' };
    const catalogApi = {
      validateEntity: jest.fn(async () => ({ valid: true as const })),
    };
    const identityApi = {
      getCredentials: jest.fn(async () => ({ token: 'token' })),
    };

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApi],
          [coreApis.identity, identityApi],
        ]}
      >
        <EntityValidationOutput
          locationUrl="http://localhost/catalog-info.yaml"
          processorResults={[
            entityResult(named),
            entityResult(named),
            entityResult(unnamed),
            entityResult(unnamed),
          ]}
        />
      </TestApiProvider>,
    );

    await screen.findByText('All the entities are valid!');
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4);
    expect(new Set(rows.map(r => r.getAttribute('data-key'))).size).toBe(4);
    rows.forEach(row => expect(row).toHaveAttribute('aria-label'));
  });
});
