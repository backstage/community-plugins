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
import { Route, Routes } from 'react-router-dom';
import { githubActionsJobRouteRef, jenkinsJobRunRouteRef } from '../routes';
import { useEntity } from '@backstage/plugin-catalog-react';
import { ApiRef } from '@backstage/core-plugin-api/index';
import { Entity } from '@backstage/catalog-model';
import { mssvJenkinsApiRef } from '../api/jenkins';
import { isJenkinsAvailable } from '@backstage-community/plugin-jenkins';
import { mssvGithubActionsApiRef } from '../api/github';
import { isGithubActionsAvailable } from '@backstage-community/plugin-github-actions';
import { mssvGitlabCIApiRef } from '../api/gitlab';
import { isGitlabAvailable } from '@immobiliarelabs/backstage-plugin-gitlab';
import { MultiCIConfig } from '../types/multiCI';
import { SecurityViewerMultiCIPipelines } from './SecurityViewer/SecurityViewerMultiCIPipelines';
import { mssvAzureDevopsApiRef } from '../api/azure';
import { isAzurePipelinesAvailable } from '@backstage-community/plugin-azure-devops';

type ApiItem = {
  title: string;
  apiRef: ApiRef<any>;
  availabilityCallback: (entity: Entity) => boolean;
};

const AVAILABLE_APIS: ApiItem[] = [
  {
    title: 'Jenkins',
    apiRef: mssvJenkinsApiRef,
    availabilityCallback: isJenkinsAvailable,
  },
  {
    title: 'Github Actions',
    apiRef: mssvGithubActionsApiRef,
    availabilityCallback: isGithubActionsAvailable,
  },
  {
    title: 'Gitlab CI',
    apiRef: mssvGitlabCIApiRef,
    availabilityCallback: isGitlabAvailable,
  },
  {
    title: 'Azure Pipelines',
    apiRef: mssvAzureDevopsApiRef,
    availabilityCallback: isAzurePipelinesAvailable,
  },
];

export const Router = () => {
  const { entity } = useEntity();
  const multiCIConfig = AVAILABLE_APIS.reduce((acc, api: ApiItem) => {
    if (api.availabilityCallback(entity)) {
      acc.push({ title: api.title, apiRef: api.apiRef });
    }
    return acc;
  }, [] as MultiCIConfig[]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <SecurityViewerMultiCIPipelines multiCIConfig={multiCIConfig} />
        }
      />
      <Route
        path={`${jenkinsJobRunRouteRef.path}`}
        element={
          <SecurityViewerMultiCIPipelines
            multiCIConfig={multiCIConfig}
            isJenkinsDetail
          />
        }
      />
      <Route
        path={`${githubActionsJobRouteRef.path}`}
        element={
          <SecurityViewerMultiCIPipelines
            multiCIConfig={multiCIConfig}
            isGithubActionsDetail
          />
        }
      />
    </Routes>
  );
};
