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
import { fireEvent, screen, waitFor } from '@testing-library/react';
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
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { SWRConfig } from 'swr';
import { MdxCardApi, mdxCardApiRef } from '../../api';
import { MdxCardEditorPage } from './MdxCardEditorPage';

describe('MdxCardEditorPage', () => {
  const mdxCardApi: jest.Mocked<MdxCardApi> = {
    listTemplates: jest.fn(),
    getTemplate: jest.fn(),
    createTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn(),
  };

  const renderPage = (
    path: string,
    authorize:
      | AuthorizeResult.ALLOW
      | AuthorizeResult.DENY = AuthorizeResult.ALLOW,
  ) =>
    renderInTestApp(
      <TestApiProvider
        apis={[
          [mdxCardApiRef, mdxCardApi],
          [permissionApiRef, mockApis.permission({ authorize })],
          [catalogApiRef, catalogApiMock()],
          [discoveryApiRef, mockApis.discovery()],
          [fetchApiRef, { fetch: jest.fn() }],
          [identityApiRef, mockApis.identity({ displayName: 'Jane' })],
        ]}
      >
        <SWRConfig value={{ provider: () => new Map() }}>
          <MdxCardEditorPage />
        </SWRConfig>
      </TestApiProvider>,
      { routeEntries: [path] },
    );

  beforeEach(() => jest.resetAllMocks());

  it('lists stored templates', async () => {
    mdxCardApi.listTemplates.mockResolvedValue([
      {
        id: 'ownership',
        title: 'Ownership',
        createdBy: 'user:default/jane',
        createdAt: '2026-11-19T10:00:00.000Z',
        updatedBy: 'user:default/jane',
        updatedAt: '2026-11-19T10:00:00.000Z',
      },
    ]);

    await renderPage('/');

    expect(await screen.findByText('ownership')).toBeInTheDocument();
    expect(screen.getByText('Ownership')).toBeInTheDocument();
  });

  it('creates a template and previews it', async () => {
    mdxCardApi.createTemplate.mockResolvedValue({
      id: 'my-card',
      template: '',
      dataFetchers: [],
      createdBy: '',
      createdAt: '',
      updatedBy: '',
      updatedAt: '',
    });

    await renderPage('/new');

    expect(await screen.findByText('Hello Jane')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^ID/), {
      target: { value: 'my-card' },
    });
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'My card' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mdxCardApi.createTemplate).toHaveBeenCalledWith('my-card', {
        title: 'My card',
        template: expect.stringContaining('Hello {props.user.displayName}'),
        dataFetchers: [],
      }),
    );
  });

  it('disables saving without permission', async () => {
    await renderPage('/new', AuthorizeResult.DENY);

    fireEvent.change(await screen.findByLabelText(/^ID/), {
      target: { value: 'my-card' },
    });

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('asks for an entity before previewing templates that use one', async () => {
    mdxCardApi.getTemplate.mockResolvedValue({
      id: 'entity-card',
      template: 'Name: {props.entity.metadata.name}',
      dataFetchers: [],
      createdBy: '',
      createdAt: '',
      updatedBy: '',
      updatedAt: '',
    });

    await renderPage('/edit/entity-card');

    expect(
      await screen.findByText(
        'This template uses an entity. Pick one above to preview it.',
      ),
    ).toBeInTheDocument();
  });
});
