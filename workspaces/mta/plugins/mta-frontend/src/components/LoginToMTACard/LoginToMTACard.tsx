import React from 'react';
import { Grid, Button } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';

type loginPageProps = {
  url: URL;
};

export const LoginToMTACard = ({ url }: loginPageProps) => {
  return (
    <Grid item>
      <InfoCard title="Please Login">
        <Button
          variant="outlined"
          color="primary"
          size="large"
          href={url.toString()}
        >
          Login To MTA
        </Button>
      </InfoCard>
    </Grid>
  );
};
