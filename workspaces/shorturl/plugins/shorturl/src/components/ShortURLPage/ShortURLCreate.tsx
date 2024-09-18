// code based on https://github.com/shailahir/backstage-plugin-shorturl
import { Link } from '@backstage/core-components';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import {
  useApi,
  alertApiRef,
  discoveryApiRef,
  configApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { DefaultShortURLApi } from '../../api';
import useAsync from 'react-use/lib/useAsync';

interface ShortURLCreateProps {
  onCreate: () => void;
}

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

  const { value: baseUrl } = useAsync(async () => {
    return await configApi.getString('app.baseUrl');
  }, []);

  const validateUrl = (url: string): boolean => {
    try {
      const validUrl = new URL(url);
      return !!validUrl;
    } catch (_) {
      return false;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alertApi.post({
          message: 'Short URL copied to clipboard',
          display: 'transient',
        });
      },
      () => {
        alertApi.post({
          message: `Failed to copy short URL to clipboard`,
          severity: 'error',
        });
      },
    );
  };

  const handleCopyClick = async () => {
    copyToClipboard(shortUrl);
  };

  const handleCreateClick = async () => {
    let error: Error | undefined;
    if (!validateUrl(longUrl)) {
      alertApi.post({
        message: 'Invalid URL',
        severity: 'error',
      });
      return;
    }
    const response = await shortURLApi
      .createOrRetrieveShortUrl({
        fullUrl: longUrl,
        usageCount: 0,
      })
      .then(res => {
        if (res.status === 200 || res.status === 201) {
          // retrieved or created
          return res.json();
        }
        throw new Error(`API returned status ${res.status}`);
      })
      .catch(err => {
        error = err;
      });
    if (response && response.status === 'ok') {
      const newLink = `${baseUrl}/go/${response.shortUrl}`;
      setShortUrl(newLink);
    } else {
      alertApi.post({
        message: `Failed to create short URL: ${error}`,
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
