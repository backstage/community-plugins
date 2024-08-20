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

import { rootRouteRef } from '../../routes';
import { ProjectsPageContent } from './ProjectsPageContent/ProjectsPageContent';

const StyledButton = styled(LinkButton)(({ theme }: { theme: Theme }) => ({
  backdropFilter: 'blur(10px)',
  marginTop: theme.spacing(4),
  alignItems: 'initial',
  textTransform: 'none',
  fontSize: '1rem',
}));

export const ProjectsPage = (props: { themeId?: string }) => {
  const rootPage = useRouteRef(rootRouteRef);
  const hostName = useQueryParamState('host')[0] as string;
  return (
    <Page themeId={props.themeId ?? 'app'}>
      <Header
        pageTitleOverride="Projects"
        title={
          <>
            <Breadcrumbs style={{ marginBottom: '8px' }}>
              <Link to={rootPage()}>Report Portal</Link>
              {hostName}
            </Breadcrumbs>
            <div>{hostName}</div>
          </>
        }
      >
        <StyledButton
          endIcon={<Launch />}
          variant="text"
          to={`https://${hostName}`}
        >
          Report Portal
        </StyledButton>
      </Header>
      <Content>
        <ProjectsPageContent host={hostName} />
      </Content>
    </Page>
  );
};
