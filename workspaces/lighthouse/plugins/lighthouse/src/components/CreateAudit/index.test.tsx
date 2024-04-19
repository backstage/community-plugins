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
  const mockNavigate = jest.fn();
  return {
    ...actual,
    useNavigate: jest.fn(() => mockNavigate),
  };
});

import {
  setupRequestMockHandlers,
  TestApiRegistry,
  renderInTestApp,
} from '@backstage/test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import {
  Audit,
  LighthouseRestApi,
} from '@backstage-community/plugin-lighthouse-common';
import { lighthouseApiRef } from '../../api';
import * as data from '../../__fixtures__/create-audit-response.json';
import CreateAudit from './index';

import { ApiProvider } from '@backstage/core-app-api';
import { ErrorApi, errorApiRef } from '@backstage/core-plugin-api';

const { useNavigate }: { useNavigate: jest.Mock } =
  jest.requireMock('react-router-dom');
const createAuditResponse = data as Audit;

// TODO add act() to these tests without breaking them!
describe('CreateAudit', () => {
  let apis: TestApiRegistry;
  let errorApi: ErrorApi;
  const server = setupServer();
  setupRequestMockHandlers(server);

  beforeEach(() => {
    errorApi = { post: jest.fn(), error$: jest.fn() };
    apis = TestApiRegistry.from(
      [lighthouseApiRef, new LighthouseRestApi('http://lighthouse')],
      [errorApiRef, errorApi],
    );
  });

  it('renders the form', async () => {
    await renderInTestApp(
      <ApiProvider apis={apis}>
        <CreateAudit />
      </ApiProvider>,
    );
    expect(screen.getByLabelText(/URL/)).toBeEnabled();
    expect(screen.getByLabelText(/URL/)).toHaveAttribute('value', '');
    expect(screen.getByText(/Create Audit/)).toBeEnabled();
  });

  describe('when the location contains a url', () => {
    it('prefills the url into the form', async () => {
      const url = 'https://spotify.com';
      await renderInTestApp(
        <ApiProvider apis={apis}>
          <CreateAudit />
        </ApiProvider>,
        {
          routeEntries: [`/create-audit?url=${encodeURIComponent(url)}`],
        },
      );
      expect(screen.getByLabelText(/URL/)).toHaveAttribute('value', url);
    });
  });

  describe('when waiting on the request', () => {
    it('disables the form fields', async () => {
      server.use(rest.get('*', (_req, res, ctx) => res(ctx.delay(20000))));

      await renderInTestApp(
        <ApiProvider apis={apis}>
          <CreateAudit />
        </ApiProvider>,
      );

      fireEvent.change(screen.getByLabelText(/URL/), {
        target: { value: 'https://spotify.com' },
      });
      fireEvent.click(screen.getByText(/Create Audit/));

      expect(screen.getByLabelText(/URL/)).toBeDisabled();
      expect(screen.getByText(/Create Audit/).parentElement).toBeDisabled();
    });
  });

  describe('when creating the audit', () => {
    it('sends the correct payload for mobile', async () => {
      let triggerAuditPayload: {} | undefined = undefined;
      server.use(
        rest.post('http://lighthouse/v1/audits', async (req, res, ctx) => {
          triggerAuditPayload = await req.json();
          return res(ctx.json(createAuditResponse));
        }),
      );

      await renderInTestApp(
        <ApiProvider apis={apis}>
          <CreateAudit />
        </ApiProvider>,
      );

      fireEvent.change(screen.getByLabelText(/URL/), {
        target: { value: 'https://spotify.com' },
      });
      fireEvent.click(screen.getByText(/Create Audit/));

      await waitFor(() =>
        expect(triggerAuditPayload).toMatchObject({
          options: {
            lighthouseConfig: {
              settings: { formFactor: 'mobile', emulatedFormFactor: 'mobile' },
            },
          },
          url: 'https://spotify.com',
        }),
      );
    });

    it('sends the correct payload for desktop', async () => {
      let triggerAuditPayload: {} | undefined = undefined;
      server.use(
        rest.post('http://lighthouse/v1/audits', async (req, res, ctx) => {
          triggerAuditPayload = await req.json();
          return res(ctx.json(createAuditResponse));
        }),
      );

      await renderInTestApp(
        <ApiProvider apis={apis}>
          <CreateAudit />
        </ApiProvider>,
      );

      fireEvent.change(screen.getByLabelText(/URL/), {
        target: { value: 'https://spotify.com' },
      });
      fireEvent.mouseDown(screen.getByText(/Mobile/));
      fireEvent.click(screen.getByText(/Desktop/));
      fireEvent.click(screen.getByText(/Create Audit/));

      await waitFor(() =>
        expect(triggerAuditPayload).toMatchObject({
          options: {
            lighthouseConfig: {
              settings: {
                formFactor: 'desktop',
                screenEmulation: {
                  mobile: false,
                  width: 1350,
                  height: 940,
                  deviceScaleFactor: 1,
                  disabled: false,
                },
                emulatedFormFactor: 'desktop',
              },
            },
          },
          url: 'https://spotify.com',
        }),
      );
    });
  });

  describe('when the audit is successfully created', () => {
    it('triggers a location change to the table', async () => {
      useNavigate.mockClear();
      server.use(
        rest.post('http://lighthouse/v1/audits', (_req, res, ctx) =>
          res(ctx.json(createAuditResponse)),
        ),
      );

      await renderInTestApp(
        <ApiProvider apis={apis}>
          <CreateAudit />
        </ApiProvider>,
      );

      fireEvent.change(screen.getByLabelText(/URL/), {
        target: { value: 'https://spotify.com' },
      });
      fireEvent.click(screen.getByText(/Create Audit/));

      await waitFor(() => expect(screen.getByLabelText(/URL/)).toBeEnabled());

      expect(useNavigate()).toHaveBeenCalledWith('..');
    });
  });

  describe('when the audits fail', () => {
    it('should render an error', async () => {
      server.use(
        rest.post('http://lighthouse/v1/audits', (_req, res, ctx) =>
          res(ctx.status(500, 'failed to post')),
        ),
      );
      await renderInTestApp(
        <ApiProvider apis={apis}>
          <CreateAudit />
        </ApiProvider>,
      );

      fireEvent.change(screen.getByLabelText(/URL/), {
        target: { value: 'https://spotify.com' },
      });
      fireEvent.click(screen.getByText(/Create Audit/));

      await waitFor(() => expect(screen.getByLabelText(/URL/)).toBeEnabled());

      expect(errorApi.post).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
