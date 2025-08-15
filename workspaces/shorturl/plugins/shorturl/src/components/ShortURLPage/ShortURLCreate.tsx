import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
} from '@material-ui/core';
import { Link } from '@backstage/core-components';
import { useCreateShortUrl } from '../../hooks/useCreateShortUrl';

interface ShortURLCreateProps {
  onCreate: () => void;
}

export const ShortURLCreate: React.FC<ShortURLCreateProps> = ({ onCreate }) => {
  const { longUrl, setLongUrl, shortUrl, createClick, copyToClipboard } =
    useCreateShortUrl(onCreate);

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
            <Button variant="contained" color="primary" onClick={createClick}>
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
                <Button onClick={() => copyToClipboard(shortUrl)}>Copy</Button>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
