/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Content, PageWithHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import { GlobalPageContent } from './GlobalPageContent';
import { ReportPortalSearchBar } from '../ReportPortalSearchBar';

/** @public */
export type ReportPortalGlobalPageProps = {
  title?: string;
  subtitle?: string;
  theme?: string;
};

/** @public */
export const ReportPortalGlobalPage = (props: ReportPortalGlobalPageProps) => {
  const config = useApi(configApiRef);
  const emailTemplate = config.getOptionalString(
    'reportPortal.supportEmailTemplate',
  );
  return (
    <PageWithHeader
      themeId={props.theme ?? 'app'}
      subtitle={props.subtitle}
      title={props.title ?? 'Report Portal'}
    >
      <Content>
        <Grid container>
          <Grid item xs={8}>
            <ReportPortalSearchBar
              initialState={{
                term: '',
                filters: {},
                types: ['report-portal'],
                pageLimit: 10,
              }}
            />
          </Grid>
          {emailTemplate && (
            <Grid
              xs={4}
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
