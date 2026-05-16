/*
 * Copyright 2021 The Backstage Authors
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
  Content,
  EmptyState,
  Header,
  Page,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { PullRequestColumnConfig } from './lib/types';
import { useState, useEffect } from 'react';
import { getPullRequestGroupConfigs, getPullRequestGroups } from './lib/utils';
import { FilterType } from './lib/filters';
import { PullRequestGrid } from './lib/PullRequestGrid';
import {
  useDashboardPullRequests,
  useOrganizations,
  useProjects,
} from '../../hooks';
import { useFilterProcessor } from './lib/hooks';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { azureDevOpsPullRequestDashboardReadPermission } from '@backstage-community/plugin-azure-devops-common';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

type PullRequestDashboardProps = {
  projectName?: string;
  pollingInterval?: number;
  columnConfigs: PullRequestColumnConfig[];
  teamsLimit?: number;
  host?: string;
  org?: string;
};

const PullRequestDashboard = ({
  projectName,
  pollingInterval,
  columnConfigs,
  teamsLimit,
  host,
  org,
}: PullRequestDashboardProps) => {
  const { pullRequests, loading, error } = useDashboardPullRequests(
    projectName,
    pollingInterval,
    teamsLimit,
    host,
    org,
  );

  const filterProcessor = useFilterProcessor(host, org);

  const pullRequestGroupConfigs = getPullRequestGroupConfigs(
    columnConfigs,
    filterProcessor,
  );

  const pullRequestGroups = getPullRequestGroups(
    pullRequests,
    pullRequestGroupConfigs,
  );

  if (!projectName) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
        color="text.secondary"
      >
        Please select an Organization and Project to see the related Pull
        Requests
      </Box>
    );
  }

  if (loading && (!pullRequestGroups || pullRequestGroups.length <= 0)) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <PullRequestGrid pullRequestGroups={pullRequestGroups ?? []} />;
};

const DEFAULT_COLUMN_CONFIGS: PullRequestColumnConfig[] = [
  {
    title: 'Created by me',
    filters: [{ type: FilterType.CreatedByCurrentUser }],
    simplified: false,
  },
  {
    title: 'Other PRs',
    filters: [{ type: FilterType.All }],
    simplified: true,
  },
];

type PullRequestsPageProps = {
  projectName?: string;
  pollingInterval?: number;
  defaultColumnConfigs?: PullRequestColumnConfig[];
  teamsLimit?: number;
};

export const PullRequestsPage = (props: PullRequestsPageProps) => {
  const { projectName, pollingInterval, defaultColumnConfigs, teamsLimit } =
    props;

  const organizations = useOrganizations();
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Automatically select organization if there's only one
  useEffect(() => {
    if (organizations.length === 1 && !selectedOrganization) {
      setSelectedOrganization(organizations[0].organization);
    }
  }, [organizations, selectedOrganization]);

  // Find the selected organization's host
  const selectedOrgHost = organizations.find(
    org => org.organization === selectedOrganization,
  )?.host;

  // Fetch projects for the selected organization
  const { projects, loading: projectsLoading } = useProjects(
    selectedOrgHost,
    selectedOrganization || undefined,
  );

  // Automatically select project if there's only one
  useEffect(() => {
    if (
      projects.length === 1 &&
      !projectsLoading &&
      (!selectedProject || !projects.includes(selectedProject))
    ) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject, projectsLoading]);

  const [columnConfigs] = useState(
    defaultColumnConfigs ?? DEFAULT_COLUMN_CONFIGS,
  );

  // Use projectName prop if provided, otherwise use selectedProject from dropdown
  const effectiveProjectName = projectName || selectedProject || undefined;

  return (
    <Page themeId="tool">
      <Header title="Azure Pull Requests" />
      <Content>
        <RequirePermission
          permission={azureDevOpsPullRequestDashboardReadPermission}
        >
          {!projectName && organizations.length === 0 && (
            <EmptyState
              missing="info"
              title="No Azure DevOps organizations configured"
              description="To use the Pull Request Dashboard, you need to configure Azure DevOps organizations in your app-config.yaml file."
              action={
                <Button
                  variant="contained"
                  color="primary"
                  href="https://github.com/backstage/community-plugins/tree/main/workspaces/azure-devops/plugins/azure-devops#azure-pull-request-dashboard-page"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Documentation
                </Button>
              }
            />
          )}
          {!projectName && organizations.length > 0 && (
            <Box mb={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="organization-select-label">
                      Organization
                    </InputLabel>
                    <Select
                      labelId="organization-select-label"
                      id="organization-select"
                      value={selectedOrganization}
                      onChange={event => {
                        setSelectedOrganization(event.target.value as string);
                        setSelectedProject(''); // Reset project when organization changes
                      }}
                      label="Organization"
                    >
                      {organizations.map(org => (
                        <MenuItem
                          key={`${org.organization}-${org.host}`}
                          value={org.organization}
                        >
                          {org.organization}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    disabled={!selectedOrganization}
                  >
                    <InputLabel id="project-select-label">Project</InputLabel>
                    <Select
                      labelId="project-select-label"
                      id="project-select"
                      value={selectedProject}
                      onChange={event =>
                        setSelectedProject(event.target.value as string)
                      }
                      label="Project"
                    >
                      {projectsLoading ? (
                        <MenuItem disabled>
                          <em>Loading...</em>
                        </MenuItem>
                      ) : (
                        projects.map(project => (
                          <MenuItem key={project} value={project}>
                            {project}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
          {(projectName || organizations.length > 0) && (
            <PullRequestDashboard
              projectName={effectiveProjectName}
              pollingInterval={pollingInterval}
              columnConfigs={columnConfigs}
              teamsLimit={teamsLimit}
              host={selectedOrgHost}
              org={selectedOrganization || undefined}
            />
          )}
        </RequirePermission>
      </Content>
    </Page>
  );
};
