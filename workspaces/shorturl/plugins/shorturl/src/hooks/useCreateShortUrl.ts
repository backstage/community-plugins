import { useCallback, useEffect, useState } from 'react';
import {
  useApi,
  alertApiRef,
  configApiRef,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { DefaultShortURLApi } from '../api';
import { useAsync } from '@react-hookz/web';

const validateUrl = (url: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export function useCreateShortUrl(onSuccess: () => void) {
  const alertApi = useApi(alertApiRef);
  const fetchApi = useApi(fetchApiRef);
  const configApi = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const discoveryApi = useApi(discoveryApiRef);

  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  const [{ result: baseUrl }, { execute: fetchBaseUrl }] = useAsync(async () =>
    configApi.getString('app.baseUrl'),
  );

  useEffect(() => {
    fetchBaseUrl();
  }, [fetchBaseUrl]);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        alertApi.post({
          message: 'Short URL copied to clipboard',
          display: 'transient',
        });
      } catch {
        alertApi.post({
          message: 'Failed to copy short URL to clipboard',
          severity: 'error',
        });
      }
    },
    [alertApi],
  );

  const createClick = useCallback(async () => {
    if (!validateUrl(longUrl)) {
      alertApi.post({ message: 'Invalid URL', severity: 'error' });
      return;
    }

    const shortURLApi = new DefaultShortURLApi(
      fetchApi,
      discoveryApi,
      identityApi,
    );

    try {
      const res = await shortURLApi.createOrRetrieveShortUrl({
        fullUrl: longUrl,
        usageCount: 0,
      });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error(`API returned status ${res.status}`);
      }

      const json = await res.json();

      if (json.status === 'ok') {
        const newLink = `${baseUrl}/go/${json.shortUrl}`;
        setShortUrl(newLink);
        await copyToClipboard(newLink);
        onSuccess();
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err: any) {
      alertApi.post({
        message: `Failed to create short URL: ${err.message || err}`,
        severity: 'error',
      });
    }
  }, [
    fetchApi,
    discoveryApi,
    identityApi,
    longUrl,
    alertApi,
    baseUrl,
    copyToClipboard,
    onSuccess,
  ]);

  return {
    longUrl,
    setLongUrl,
    shortUrl,
    createClick,
    copyToClipboard,
  };
}
