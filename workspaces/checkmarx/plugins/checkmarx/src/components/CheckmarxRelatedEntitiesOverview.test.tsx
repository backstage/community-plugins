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
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { Entity } from '@backstage/catalog-model';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import {
  catalogApiRef,
  entityRouteRef,
  EntityProvider,
} from '@backstage/plugin-catalog-react';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import { checkmarxApiRef } from '../apiRef';
import { CheckmarxRelatedEntitiesOverview } from './CheckmarxRelatedEntitiesOverview';

const parentEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'System',
  metadata: {
    name: 'payments',
    namespace: 'default',
  },
  relations: [
    {
      type: 'hasPart',
      targetRef: 'component:default/payments-service',
    },
  ],
};

const relatedEntities: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'payments-service',
      namespace: 'default',
      annotations: {
        'checkmarx.org/project-id': 'project-123',
      },
    },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: 'guests',
    },
  },
];

describe('CheckmarxRelatedEntitiesOverview', () => {
  it('fetches summaries once for a stable set of related entities', async () => {
    const getEntitySummaries = jest.fn().mockResolvedValue([undefined]);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApiMock({ entities: relatedEntities })],
          [checkmarxApiRef, { getEntitySummaries }],
        ]}
      >
        <EntityProvider entity={parentEntity}>
          <CheckmarxRelatedEntitiesOverview
            relationType="hasPart"
            entityKind="component"
          />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(await screen.findByText('Checkmarx (1)')).toBeInTheDocument();
    expect(screen.getByText(/payments-service/)).toBeInTheDocument();
    expect(getEntitySummaries).toHaveBeenCalledTimes(1);
    expect(getEntitySummaries).toHaveBeenCalledWith(relatedEntities);
  });
});
