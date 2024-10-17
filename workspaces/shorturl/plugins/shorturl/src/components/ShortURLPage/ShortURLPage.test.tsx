import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { ShortURLPage } from './ShortURLPage';
import { DefaultShortURLApi, shorturlApiRef } from '../../api';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { AlertDisplay } from '@backstage/core-components';

describe('ShortURLPage', () => {
  const fetchApi = { fetch: jest.fn() };
  const discoveryApi = {
    getBaseUrl: jest.fn().mockResolvedValue('http://example.com'),
  };
  const identityApi = {
    getCredentials: jest.fn().mockResolvedValue({ token: 'token' }),
    getProfileInfo: jest.fn().mockResolvedValue({}),
    getBackstageIdentity: jest
      .fn()
      .mockResolvedValue({
        identity: {
          userEntityRef: 'user:default/guest',
          ownershipEntityRefs: [],
        },
      }),
    signOut: jest.fn(),
  };
  const api = new DefaultShortURLApi(fetchApi, discoveryApi, identityApi);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the ShortURLPage component', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[[shorturlApiRef, api]]}>
        <ShortURLPage />
      </TestApiProvider>,
    );
    expect(screen.getByText('Short URL Page')).toBeInTheDocument();
  });

  it('should have an input field for the URL', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[[shorturlApiRef, api]]}>
        <ShortURLPage />
      </TestApiProvider>,
    );
    expect(screen.getByPlaceholderText('Enter URL')).toBeInTheDocument();
  });

  it('should have a button to shorten the URL', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[[shorturlApiRef, api]]}>
        <ShortURLPage />
      </TestApiProvider>,
    );
    expect(screen.getByText('Shorten URL')).toBeInTheDocument();
  });

  it('should display the shortened URL after submission', async () => {
    const spy = jest.spyOn(api, 'createOrRetrieveShortUrl');

    await renderInTestApp(
      <TestApiProvider apis={[[shorturlApiRef, api]]}>
        <ShortURLPage />
      </TestApiProvider>,
    );

    const input = screen.getByPlaceholderText('Enter URL');
    const button = screen.getByText('Shorten URL');

    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith('https://example.com');
      expect(screen.getByText('Shortened URL:')).toBeInTheDocument();
    });
  });

  it('should display an error message for invalid URL', async () => {
    jest
      .spyOn(api, 'createOrRetrieveShortUrl')
      .mockRejectedValueOnce(new Error('Invalid URL'));

    await renderInTestApp(
      <>
        <TestApiProvider apis={[[shorturlApiRef, api]]}>
          <AlertDisplay />
          <ShortURLPage />
        </TestApiProvider>
      </>,
    );

    const input = screen.getByPlaceholderText('Enter URL');
    const button = screen.getByText('Shorten URL');

    fireEvent.change(input, { target: { value: 'invalid-url' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Invalid URL')).toBeInTheDocument();
    });
  });

  it('should clear the input field after submission', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[[shorturlApiRef, api]]}>
        <ShortURLPage />
      </TestApiProvider>,
    );

    const input = screen.getByPlaceholderText('Enter URL');
    const button = screen.getByText('Shorten URL');

    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});
