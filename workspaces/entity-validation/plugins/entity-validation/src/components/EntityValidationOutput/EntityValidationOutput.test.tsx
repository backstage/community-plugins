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

import { identityApiRef } from '@backstage/core-plugin-api';
import { CatalogApi, catalogApiRef } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { EntityValidationOutput } from './EntityValidationOutput';
import { CatalogProcessorResult } from '../../types';

describe('EntityValidationOutput', () => {
  const validateEntity = jest.fn(async entity => {
    if (entity.kind) {
      return {
        valid: false as const,
        errors: [
          {
            name: 'InputError',
            message: 'metadata.name is missing',
          },
        ],
      };
    }

    return {
      valid: false as const,
      errors: [
        {
          name: 'InputError',
          message: 'kind is missing',
        },
      ],
    };
  });

  const catalogApi: Partial<CatalogApi> = {
    validateEntity,
  };

  const identityApi = {
    getCredentials: jest.fn().mockResolvedValue({ token: 'token' }),
  };

  const processorResults: CatalogProcessorResult[] = [
    {
      type: 'entity',
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {},
      },
      location: {
        type: 'url',
        target: 'http://localhost/catalog-info.yaml',
      },
    },
    {
      type: 'entity',
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        metadata: {},
      },
      location: {
        type: 'url',
        target: 'http://localhost/catalog-info.yaml',
      },
    },
  ];

  beforeEach(() => {
    validateEntity.mockClear();
    identityApi.getCredentials.mockClear();
  });

  it('renders invalid entities with fallback labels instead of crashing', async () => {
    const rendered = await renderInTestApp(
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApi],
          [identityApiRef, identityApi],
        ]}
      >
        <EntityValidationOutput
          processorResults={processorResults}
          locationUrl=""
        />
      </TestApiProvider>,
    );

    expect(
      await rendered.findByText('Component:unnamed entity'),
    ).toBeInTheDocument();
    expect(
      await rendered.findByText('Unknown kind:unnamed entity'),
    ).toBeInTheDocument();
    expect(
      rendered.getByText('One or more entities have validation errors'),
    ).toBeInTheDocument();
    expect(rendered.getByText('metadata.name is missing')).toBeInTheDocument();
    expect(validateEntity).toHaveBeenCalledTimes(2);
  });
});
