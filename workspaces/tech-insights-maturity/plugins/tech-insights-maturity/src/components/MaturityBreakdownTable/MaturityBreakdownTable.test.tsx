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
import { GetEntitiesByRefsRequest } from '@backstage/catalog-client';
import {
  Entity,
  RELATION_CHILD_OF,
  RELATION_HAS_PART,
  RELATION_OWNED_BY,
  RELATION_OWNER_OF,
  RELATION_PARENT_OF,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import {
  CatalogApi,
  catalogApiRef,
  EntityProvider,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import React from 'react';

import { MaturityBreakdownTable } from './MaturityBreakdownTable';
import { ScoringDataApi, scoringDataApiRef } from '../../api';

const childlessCompanyEntity: Entity = {
  apiVersion: 'v1',
  kind: 'Group',
  metadata: {
    name: 'medidata',
    namespace: 'test',
    title: 'Medidata',
    entityRef: 'group:test/medidata',
  },
  spec: {
    type: 'organization',
  },
};

const companyEntity: Entity = {
  ...childlessCompanyEntity,
  relations: [
    {
      type: RELATION_PARENT_OF,
      targetRef: 'group:test/organization-name',
    },
  ],
};

const orgEntity: Entity = {
  apiVersion: 'v1',
  kind: 'Group',
  metadata: {
    name: 'organization-name',
    namespace: 'test',
    title: 'Testing',
    entityRef: 'group:test/organization-name',
  },
  spec: {
    type: 'solution-line',
  },
  relations: [
    {
      type: RELATION_CHILD_OF,
      targetRef: 'group:test/medidata',
    },
    {
      type: RELATION_OWNER_OF,
      targetRef: 'domain:test/product-family-name',
    },
  ],
};

const familyEntity: Entity = {
  apiVersion: 'v1',
  kind: 'Domain',
  metadata: {
    name: 'product-family-name',
    namespace: 'test',
    title: 'Testing Platform',
    entityRef: 'domain:test/product-family-name',
  },
  relations: [
    {
      type: RELATION_OWNED_BY,
      targetRef: 'group:test/organization-name',
    },
    {
      type: RELATION_HAS_PART,
      targetRef: 'system:test/product-name',
    },
  ],
};

const productEntity: Entity = {
  apiVersion: 'v1',
  kind: 'System',
  metadata: {
    name: 'product-name',
    namespace: 'test',
    title: 'Test Product',
    entityRef: 'system:test/product-name',
  },
  relations: [
    {
      type: RELATION_PART_OF,
      targetRef: 'domain:test/product-family-name',
    },
    {
      type: RELATION_HAS_PART,
      targetRef: 'component:test/service-name',
    },
    {
      type: RELATION_HAS_PART,
      targetRef: 'api:test/api-name',
    },
  ],
};

const componentEntity: Entity = {
  apiVersion: 'v1',
  kind: 'Component',
  metadata: {
    name: 'service-name',
    namespace: 'test',
    title: 'Test Service',
    entityRef: 'component:test/service-name',
    description: 'This is the description for a service.',
  },
  relations: [
    {
      type: RELATION_PART_OF,
      targetRef: 'system:test/product-name',
    },
    {
      type: RELATION_OWNED_BY,
      targetRef: 'group:test/team-name',
    },
  ],
};

const apiEntity: Entity = {
  apiVersion: 'v1',
  kind: 'API',
  metadata: {
    name: 'api-name',
    namespace: 'test',
    title: 'Test API',
    entityRef: 'api:test/api-name',
    description: 'This is the description for an API.',
  },
  relations: [
    {
      type: RELATION_PART_OF,
      targetRef: 'system:test/product-name',
    },
    {
      type: RELATION_OWNED_BY,
      targetRef: 'group:test/team-name',
    },
  ],
};

const teamEntity: Entity = {
  apiVersion: 'v1',
  kind: 'Group',
  metadata: {
    name: 'team-name',
    namespace: 'test',
    title: 'Test Team',
    entityRef: 'group:test/team-name',
  },
  spec: {
    type: 'team',
  },
  relations: [
    {
      type: RELATION_OWNER_OF,
      targetRef: 'component:test/service-name',
    },
    {
      type: RELATION_OWNER_OF,
      targetRef: 'api:test/api-name',
    },
  ],
};

const allEntities: Entity[] = [
  childlessCompanyEntity,
  companyEntity,
  orgEntity,
  familyEntity,
  productEntity,
  componentEntity,
  apiEntity,
  teamEntity,
];

const catalogApi: Partial<CatalogApi> = {
  getEntities: () =>
    Promise.resolve({
      items: allEntities,
    }),
  getEntitiesByRefs: (request: GetEntitiesByRefsRequest) =>
    Promise.resolve({
      items: allEntities.filter(e =>
        request.entityRefs.includes(String(e.metadata.entityRef!)),
      ),
    }),
};

const scoringApi: Partial<ScoringDataApi> = {
  getMaturitySummary: jest.fn().mockResolvedValue({}),
};

describe('<MaturityBreakdownTable />', () => {
  afterEach(() => jest.resetAllMocks());

  it('indicates when no children are present', async () => {
    const { getByText } = await renderInTestApp(
      <TestApiProvider apis={[[catalogApiRef, catalogApi]]}>
        <EntityProvider entity={childlessCompanyEntity}>
          <MaturityBreakdownTable />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(getByText(/No records to display/)).toBeInTheDocument();
  });

  it('shows Organizations in a Company', async () => {
    const { getByText, queryByText } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApi],
          [scoringDataApiRef, scoringApi],
        ]}
      >
        <EntityProvider entity={companyEntity}>
          <MaturityBreakdownTable />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(getByText(/Organizations/)).toBeInTheDocument(); // Table title
    expect(getByText(/Name/)).toBeInTheDocument(); // Table column
    expect(getByText(/Product Families/)).toBeInTheDocument(); // Table column
    expect(getByText(/Maturity/)).toBeInTheDocument(); // Table column
    expect(getByText(/Testing/)).toBeInTheDocument(); // Name value
    expect(getByText(/domain:test\/product-family-name/)).toBeInTheDocument(); // Product Families value
    expect(queryByText(/Test Team/)).not.toBeInTheDocument(); // Bad name value
  });

  it('shows Product Families in an Organization', async () => {
    const { getByText, queryByText } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApi],
          [scoringDataApiRef, scoringApi],
        ]}
      >
        <EntityProvider entity={orgEntity}>
          <MaturityBreakdownTable />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(getByText(/Product Families/)).toBeInTheDocument(); // Table title
    expect(getByText(/Name/)).toBeInTheDocument(); // Table column
    expect(getByText(/Products/)).toBeInTheDocument(); // Table column
    expect(getByText(/Maturity/)).toBeInTheDocument(); // Table column
    expect(getByText(/Testing Platform/)).toBeInTheDocument(); // Name value
    expect(getByText(/test\/product-name/)).toBeInTheDocument(); // Products value
    expect(queryByText(/Test Team/)).not.toBeInTheDocument(); // Bad name value
  });

  it('shows Products in a Product Family', async () => {
    const { getByText, queryByText } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApi],
          [scoringDataApiRef, scoringApi],
        ]}
      >
        <EntityProvider entity={familyEntity}>
          <MaturityBreakdownTable />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(getByText(/Products/)).toBeInTheDocument(); // Table title
    expect(getByText(/Name/)).toBeInTheDocument(); // Table column
    expect(getByText(/Maturity/)).toBeInTheDocument(); // Table column
    expect(getByText(/Test Product/)).toBeInTheDocument(); // Name value
    expect(queryByText(/Test Team/)).not.toBeInTheDocument(); // Bad name value
  });

  it('shows Components in a Product', async () => {
    const { getByText, queryByText } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApi],
          [scoringDataApiRef, scoringApi],
        ]}
      >
        <EntityProvider entity={productEntity}>
          <MaturityBreakdownTable />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(getByText(/Components/)).toBeInTheDocument(); // Table title
    expect(getByText(/Name/)).toBeInTheDocument(); // Table column
    expect(getByText(/Maturity/)).toBeInTheDocument(); // Table column
    expect(getByText(/Test Service/)).toBeInTheDocument(); // Name value
    expect(queryByText(/Test Team/)).not.toBeInTheDocument(); // Bad name value
  });

  it('shows Components owned by a Team', async () => {
    const { getByText, queryByText } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApi],
          [scoringDataApiRef, scoringApi],
        ]}
      >
        <EntityProvider entity={teamEntity}>
          <MaturityBreakdownTable />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(getByText(/Components/)).toBeInTheDocument(); // Table title
    expect(getByText(/Name/)).toBeInTheDocument(); // Table column
    expect(getByText(/Product/)).toBeInTheDocument(); // Table column
    expect(getByText(/Description/)).toBeInTheDocument(); // Table column
    expect(getByText(/Maturity/)).toBeInTheDocument(); // Table column
    expect(getByText(/Test Service/)).toBeInTheDocument(); // Name value
    expect(getByText(/product-name/)).toBeInTheDocument(); // Product value
    expect(
      getByText(/This is the description for a service/),
    ).toBeInTheDocument(); // Description column
    expect(queryByText(/Testing Platform/)).not.toBeInTheDocument(); // Bad name value
  });
});
