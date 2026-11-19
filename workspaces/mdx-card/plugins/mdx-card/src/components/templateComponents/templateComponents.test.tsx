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
import { render, screen } from '@testing-library/react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { catalogApiRef, entityRouteRef } from '@backstage/plugin-catalog-react';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import { DataTable } from './DataTable';
import { EntityRefLinks } from './EntityRefLink';
import { MetadataTable } from './MetadataTable';

describe('template components', () => {
  it('renders DataTable columns and rows', () => {
    render(
      <DataTable
        columns={[
          { title: 'Name', field: 'name' },
          { title: 'Tags', field: 'tags' },
        ]}
        data={[{ name: 'service-a', tags: ['java', 'grpc'] }]}
      />,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('service-a')).toBeInTheDocument();
    expect(screen.getByText('java, grpc')).toBeInTheDocument();
  });

  it('renders the empty text when DataTable has no rows', () => {
    render(
      <DataTable
        columns={[{ title: 'Name', field: 'name' }]}
        data={[]}
        emptyText="Nothing here"
      />,
    );

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders MetadataTable keys and values', () => {
    render(<MetadataTable metadata={{ lifecycle: 'production', count: 3 }} />);

    expect(screen.getByText('lifecycle')).toBeInTheDocument();
    expect(screen.getByText('production')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('links entity refs to their entity pages', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[[catalogApiRef, catalogApiMock()]]}>
        <EntityRefLinks
          entityRefs={['group:default/team-a', 'component:default/service-a']}
        />
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(await screen.findByText('team-a')).toHaveAttribute(
      'href',
      '/catalog/default/group/team-a',
    );
    expect(screen.getByText('service-a')).toHaveAttribute(
      'href',
      '/catalog/default/component/service-a',
    );
  });
});
