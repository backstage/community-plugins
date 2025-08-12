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

import {
  Breadcrumbs,
  Content,
  Header,
  Link,
  Page,
  useQueryParamState,
  LinkButton,
} from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import Launch from '@mui/icons-material/Launch';
import { styled, Theme } from '@mui/material/styles';

import { projectsRouteRef, rootRouteRef } from '../../routes';
import { LaunchesPageContent } from './LaunchesPageContent/LaunchesPageContent';
import Grid from '@mui/material/Grid';
import { ReportPortalSearchBar } from '../ReportPortalSearchBar';

const StyledButton = styled(LinkButton)(({ theme }: { theme: Theme }) => ({
  backdropFilter: 'blur(10px)',
  marginTop: theme.spacing(4),
  alignItems: 'initial',
  textTransform: 'none',
  fontSize: '1rem',
}));

export const LaunchesPage = (props: { themeId?: string }) => {
  const rootPage = useRouteRef(rootRouteRef);
  const projectsPage = useRouteRef(projectsRouteRef);
  const hostName = useQueryParamState('host')[0] as string;
  const projectName = useQueryParamState('project')[0] as string;

  return (
    <Page themeId={props.themeId ?? 'app'}>
      <Header
        pageTitleOverride="Launches"
        title={
          <>
            <Breadcrumbs style={{ marginBottom: '8px' }}>
              <Link to={rootPage()}>Report Portal</Link>
              <Link to={projectsPage().concat(`?host=${hostName}`)}>
                {hostName}
              </Link>
              {projectName}
            </Breadcrumbs>
            <div>{projectName}</div>
          </>
        }
      >
        <StyledButton
          endIcon={<Launch />}
          variant="text"
          style={{ marginRight: '16px' }}
          to={`https://${hostName}/ui/#${projectName}/launches/all`}
        >
          All Launches
        </StyledButton>
      </Header>
      <Content>
        <Grid container justifyContent="space-around">
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
          <Grid item xs={12}>
            <LaunchesPageContent host={hostName} project={projectName} />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
