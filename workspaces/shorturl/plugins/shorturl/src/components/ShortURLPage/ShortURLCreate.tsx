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
import React, { useState } from 'react';
import {
  useApi,
  alertApiRef,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { DefaultShortURLApi } from '../../api';

export const ShortURLCreate = () => {
  const alertApi = useApi(alertApiRef);
  const fetchApi = useApi(fetchApiRef);
  const identityApi = useApi(identityApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const shortURLApi = new DefaultShortURLApi(
    fetchApi,
    discoveryApi,
    identityApi,
  );

  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alertApi.post({ message: 'Short URL copied to clipboard' });
      },
      () => {
        alertApi.post({
          message: 'Failed to copy short URL to clipboard',
          severity: 'error',
        });
      },
    );
  };

  const handleCopyClick = async () => {
    copyToClipboard(shortUrl);
  };

  const handleCreateClick = async () => {
    const response = await shortURLApi
      .createOrRetrieveShortUrl({
        fullUrl: longUrl,
        usageCount: 0,
      })
      .then(res => res.json());
    if (response.error) {
      alertApi.post({ message: response.error, severity: 'error' });
      return;
    }
    setShortUrl(response.shortUrl);
    handleCopyClick(); // auto-trigger copy
  };

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
