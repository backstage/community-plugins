import React from 'react';
import { screen } from '@testing-library/react';
import { ShortURLPage } from './ShortURLPage';
import { DefaultShortURLApi, shorturlApiRef } from '../../api';
import {
  TestApiProvider,
  mockApis,
  renderInTestApp,
} from '@backstage/test-utils';
import {
  AnyApiRef,
  configApiRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

describe('ShortURLPage', () => {
  const fetchApi = { fetch: jest.fn() };
  const discoveryApi = {
    getBaseUrl: jest.fn().mockResolvedValue('http://example.com'),
  };
  const identityApi = {
    getCredentials: jest.fn().mockResolvedValue({ token: 'token' }),
    getProfileInfo: jest.fn().mockResolvedValue({}),
    getBackstageIdentity: jest.fn().mockResolvedValue({
      identity: {
        userEntityRef: 'user:default/guest',
        ownershipEntityRefs: [],
      },
    }),
    signOut: jest.fn(),
  };

  const rawDiscoveryApi = mockApis.discovery();
  const CREATE_URL = 'Create URL';
  const LONG_URL = 'Long URL';

  const config = mockApis.config({
    data: {
      shorturl: {
        length: 6,
        alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      },
      app: {
        title: 'ShortURL Example App',
        baseUrl: 'http://localhost:3000',
      },
      backend: {
        baseUrl: 'http://localhost:7007',
        auth: {
          dangerouslyDisableDefaultAuthPolicy: true,
        },
        cors: {
          origin: 'http://localhost:3000',
        },
      },
    },
  });

  const api = new DefaultShortURLApi(fetchApi, discoveryApi, identityApi);

  const allApis: [AnyApiRef, Partial<unknown>][] = [
    [shorturlApiRef, api],
    [configApiRef, config],
    [discoveryApiRef, rawDiscoveryApi],
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the ShortURLPage component', async () => {
    await renderInTestApp(
      <TestApiProvider apis={allApis}>
        <ShortURLPage />
      </TestApiProvider>,
    );
    expect(screen.getByText('URL Shortener')).toBeInTheDocument();
  });

  it('should have an input field for the URL', async () => {
    await renderInTestApp(
      <TestApiProvider apis={allApis}>
        <ShortURLPage />
      </TestApiProvider>,
    );
    expect(screen.getAllByText(LONG_URL)[0]).toBeInTheDocument();
  });

  it('should have a button to shorten the URL', async () => {
    await renderInTestApp(
      <TestApiProvider apis={allApis}>
        <ShortURLPage />
      </TestApiProvider>,
    );
    expect(screen.getByText(CREATE_URL)).toBeInTheDocument();
  });
});
