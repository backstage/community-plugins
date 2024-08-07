import React from 'react';

import { Content, PageWithHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import { GlobalPageContent } from './GlobalPageContent';

export type ReportPortalGlobalPageProps = {
  title?: string;
  subtitle?: string;
  theme?: string;
};

export const ReportPortalGlobalPage = (props: ReportPortalGlobalPageProps) => {
  const config = useApi(configApiRef);
  const emailTemplate = config.getOptionalString(
    'reportPortal.supportEmailTemplate',
  );
  return (
    <PageWithHeader
      themeId={props.theme ?? 'app'}
      subtitle={props.subtitle ?? 'View all report portals'}
      title={props.title ?? 'Report Portal'}
    >
      <Content>
        <Grid container>
          {emailTemplate && (
            <Grid
              xs={12}
              item
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'right',
              }}
            >
              Don't see your instance here? &nbsp;
              <Button
                style={{ textTransform: 'none', padding: '5px 10px' }}
                color="primary"
                variant="outlined"
                target="_blank"
                href={emailTemplate}
              >
                Request to add
              </Button>
            </Grid>
          )}
          <Grid xs={12} item>
            <GlobalPageContent />
          </Grid>
        </Grid>
      </Content>
    </PageWithHeader>
  );
};
