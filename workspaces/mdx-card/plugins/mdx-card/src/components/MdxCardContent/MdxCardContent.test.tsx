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
import { screen } from '@testing-library/react';
import {
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import {
  mockApis,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import type { Entity } from '@backstage/catalog-model';
import { MdxCardContent } from './MdxCardContent';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'my-service', namespace: 'default' },
};

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
  });

describe('MdxCardContent', () => {
  const fetch = jest.fn();

  const renderContent = (element: JSX.Element) =>
    renderInTestApp(
      <TestApiProvider
        apis={[
          [discoveryApiRef, mockApis.discovery()],
          [fetchApiRef, { fetch }],
          [
            identityApiRef,
            mockApis.identity({
              userEntityRef: 'user:default/jane',
              displayName: 'Jane Doe',
            }),
          ],
        ]}
      >
        {element}
      </TestApiProvider>,
    );

  beforeEach(() => fetch.mockReset());

  it('exposes data fetcher responses, the entity and the user to the template', async () => {
    fetch.mockResolvedValue(jsonResponse({ owner: 'team-a' }));

    await renderContent(
      <MdxCardContent
        entity={entity}
        template="{props.user.displayName} / {props.entity.metadata.name} / {props.details.owner}"
        dataFetchers={[
          {
            name: 'details',
            pluginId: 'catalog',
            apiUrl:
              '/entities/by-name/{{ entity.kind }}/{{ entity.metadata.namespace }}/{{ entity.metadata.name }}',
          },
        ]}
      />,
    );

    expect(
      await screen.findByText('Jane Doe / my-service / team-a'),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      'http://example.com/api/catalog/entities/by-name/Component/default/my-service',
    );
  });

  it('exposes errors for non-JSON responses to the template', async () => {
    fetch.mockResolvedValue(
      new Response('<html />', { headers: { 'content-type': 'text/html' } }),
    );

    await renderContent(
      <MdxCardContent
        template="{props.page.error}"
        dataFetchers={[{ name: 'page', pluginId: 'proxy', apiUrl: '/page' }]}
      />,
    );

    expect(
      await screen.findByText(
        'Unsupported content type: text/html. Expected application/json.',
      ),
    ).toBeInTheDocument();
  });

  it('reports incomplete data fetchers', async () => {
    await renderContent(
      <MdxCardContent
        template="{props.broken.error}"
        dataFetchers={[{ name: 'broken', pluginId: '', apiUrl: '/x' }]}
      />,
    );

    expect(
      await screen.findByText(
        'Data fetcher "broken" requires both pluginId and apiUrl',
      ),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});
