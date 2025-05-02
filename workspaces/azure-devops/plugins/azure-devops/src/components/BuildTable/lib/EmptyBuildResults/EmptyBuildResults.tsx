/*
 * Copyright 2025 The Backstage Authors
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
import { Entity } from '@backstage/catalog-model';
import {
  AZURE_DEVOPS_BUILD_DEFINITION_ANNOTATION,
  AZURE_DEVOPS_REPO_ANNOTATION,
} from '@backstage-community/plugin-azure-devops-common';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

export const EmptyBuildResults = ({ entity }: { entity?: Entity }) => {
  const buildDefinitionName =
    entity?.metadata?.annotations?.[AZURE_DEVOPS_BUILD_DEFINITION_ANNOTATION] ??
    'unknown';
  const repoName =
    entity?.metadata?.annotations?.[AZURE_DEVOPS_REPO_ANNOTATION] ?? 'unknown';

  return (
    <Box padding={2}>
      <Typography component="p" align="center" variant="body1">
        No records to display
      </Typography>
      <Typography component="p" align="center" variant="body2">
        The repo name "{repoName}" or build definition "{buildDefinitionName}"
        you have specified could not be found.
      </Typography>
    </Box>
  );
};
