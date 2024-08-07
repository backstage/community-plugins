import React from 'react';

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
          to={`https://${hostName}/ui/#${projectName}`}
        >
          Project Details
        </StyledButton>
      </Header>
      <Content>
        <LaunchesPageContent host={hostName} project={projectName} />
      </Content>
    </Page>
  );
};
