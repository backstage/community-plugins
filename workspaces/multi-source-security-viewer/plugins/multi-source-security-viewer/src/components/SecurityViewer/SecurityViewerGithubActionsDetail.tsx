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
import { useRouteRefParams } from '@backstage/core-plugin-api';
import React from 'react';
import { githubActionsJobRouteRef } from '../../routes';
import { SecurityViewerPipelineDetailList } from './SecurityViewerPipelineDetailList';
import { mssvGithubActionsApiRef } from '../../api/github';

export const SecurityViewerGithubActionsDetail = () => {
  const { id } = useRouteRefParams(githubActionsJobRouteRef);
  return (
    <SecurityViewerPipelineDetailList
      jobRef={`${id}`}
      apiRef={mssvGithubActionsApiRef}
    />
  );
};
