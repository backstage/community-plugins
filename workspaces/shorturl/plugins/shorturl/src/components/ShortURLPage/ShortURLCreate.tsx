import React, { useCallback, useEffect, useState } from 'react';
import {
  useApi,
  alertApiRef,
  discoveryApiRef,
  configApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { DefaultShortURLApi } from '../../api';
import { useAsync } from '@react-hookz/web';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
} from '@material-ui/core';
import { Link } from '@backstage/core-components';

interface ShortURLCreateProps {
  onCreate: () => void;
}

const validateUrl = (url: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const ShortURLCreate: React.FC<ShortURLCreateProps> = ({ onCreate }) => {
  const alertApi = useApi(alertApiRef);
  const fetchApi = useApi(fetchApiRef);
  const configApi = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const shortURLApi = new DefaultShortURLApi(
    fetchApi,
    discoveryApi,
    identityApi,
  );

  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  const [{ result: baseUrl }, { execute: fetchBaseUrl }] = useAsync(
    async () => {
      return configApi.getString('app.baseUrl');
    },
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
          message: `Failed to copy short URL to clipboard`,
          severity: 'error',
        });
      }
    },
    [alertApi],
  );

  const handleCopyClick = async () => {
    copyToClipboard(shortUrl);
  };

  const handleCreateClick = async () => {
    if (!validateUrl(longUrl)) {
      alertApi.post({
        message: 'Invalid URL',
        severity: 'error',
      });
      return;
    }

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
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err: any) {
      alertApi.post({
        message: `Failed to create short URL: ${err.message || err}`,
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    if (shortUrl) {
      copyToClipboard(shortUrl);
      onCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortUrl]);

  return (
    <Card>
      <CardContent>
        <Box />
        <Grid container spacing={2}>
          <Grid item md={10} xs={12}>
            <TextField
              label="Long URL"
              variant="outlined"
              fullWidth
              value={longUrl}
              onChange={e => setLongUrl(e.target.value)}
            />
          </Grid>
          <Grid item md={2} xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateClick}
            >
              Create URL
            </Button>
          </Grid>
          {shortUrl && (
            <>
              <Grid item md={10} xs={12}>
                <Link target="_blank" rel="noreferrer" to={shortUrl}>
                  {shortUrl}
                </Link>
              </Grid>
              <Grid item md={2} xs={12}>
                <Button variant="contained" onClick={handleCopyClick}>
                  Copy
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
