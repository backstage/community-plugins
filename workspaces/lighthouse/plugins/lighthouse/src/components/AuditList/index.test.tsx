/*
 * Copyright 2020 The Backstage Authors
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

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  const mockNavigation = jest.fn();
  return {
    ...actual,
    useNavigate: jest.fn(() => mockNavigation),
  };
});

import {
  setupRequestMockHandlers,
  TestApiRegistry,
  renderInTestApp,
} from '@backstage/test-utils';
import { fireEvent, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import {
  LighthouseRestApi,
  WebsiteListResponse,
} from '@backstage-community/plugin-lighthouse-common';
import { lighthouseApiRef } from '../../api';
import * as data from '../../__fixtures__/website-list-response.json';
import AuditList from './index';
import { ApiProvider } from '@backstage/core-app-api';

const { useNavigate } = jest.requireMock('react-router-dom');
const websiteListResponse = data as WebsiteListResponse;

describe('AuditList', () => {
  let apis: TestApiRegistry;

  const server = setupServer();
  setupRequestMockHandlers(server);

  beforeEach(() => {
    apis = TestApiRegistry.from([
      lighthouseApiRef,
      new LighthouseRestApi('http://lighthouse'),
    ]);
  });

  it('should render the table', async () => {
    server.use(rest.get('*', (_req, res, ctx) => res(ctx.json(data))));
    await renderInTestApp(
      <ApiProvider apis={apis}>
        <AuditList />
      </ApiProvider>,
    );
    const element = await screen.findByText('https://anchor.fm');
    expect(element).toBeInTheDocument();
  });

  it('renders a button to create a new audit', async () => {
    await renderInTestApp(
      <ApiProvider apis={apis}>
        <AuditList />
      </ApiProvider>,
    );
    const button = await screen.findByText('Create Audit');
    expect(button).toBeInTheDocument();
  });

  describe('pagination', () => {
    describe('when only one page is needed', () => {
      it('hides pagination elements', async () => {
        await renderInTestApp(
          <ApiProvider apis={apis}>
            <AuditList />
          </ApiProvider>,
        );
        expect(screen.queryByLabelText(/Go to page/)).not.toBeInTheDocument();
      });
    });

    describe('when multiple pages are needed', () => {
      beforeEach(() => {
        const response = { ...websiteListResponse };
        response.limit = 5;
        response.offset = 5;
        response.total = 7;
        server.use(rest.get('*', (_req, res, ctx) => res(ctx.json(response))));
        server.use(rest.post('*', (_req, res, ctx) => res(ctx.json(response))));
      });

      it('shows pagination elements', async () => {
        await renderInTestApp(
          <ApiProvider apis={apis}>
            <AuditList />
          </ApiProvider>,
        );
        expect(await screen.findByLabelText(/Go to page/)).toBeInTheDocument();
      });

      it('changes the page on click', async () => {
        await renderInTestApp(
          <ApiProvider apis={apis}>
            <AuditList />
          </ApiProvider>,
          { routeEntries: ['?page=2'] },
        );
        const element = await screen.findByLabelText(/Go to page 1/);
        fireEvent.click(element);

        expect(useNavigate()).toHaveBeenCalledWith(`?page=1`);
      });
    });
  });

  describe('when waiting on the request', () => {
    it('should render the loader', async () => {
      server.use(rest.get('*', (_req, res, ctx) => res(ctx.delay(20000))));
      await renderInTestApp(
        <ApiProvider apis={apis}>
          <AuditList />
        </ApiProvider>,
      );
      const element = await screen.findByTestId('progress');
      expect(element).toBeInTheDocument();
    });
  });

  describe('when the audits fail', () => {
    it('should render an error', async () => {
      server.use(
        rest.get('*', (_req, res, ctx) =>
          res(ctx.status(500, 'something broke')),
        ),
      );
      await renderInTestApp(
        <ApiProvider apis={apis}>
          <AuditList />
        </ApiProvider>,
      );
      const element = await screen.findByText(/Could not load audit list./);
      expect(element).toBeInTheDocument();
    });
  });
});
