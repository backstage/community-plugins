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

export const ShortURLCreate = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  const handleCreateClick = async () => {
    const newShortUrl = 'https://example.com/short-url';

    setShortUrl(newShortUrl);
  };

  const handleCopyClick = async () => {
    navigator.clipboard
      .writeText(shortUrl)
      .then(() => {
        // todo(avila-m-6): add a toast notification
      })
      .catch(() => {
        // console.error('Failed to copy short URL to clipboard:', error);
      });
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
