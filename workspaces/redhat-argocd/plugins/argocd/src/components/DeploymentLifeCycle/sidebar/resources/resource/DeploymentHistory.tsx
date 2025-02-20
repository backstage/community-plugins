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
import { Box, Typography } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/styles';
import React from 'react';
import { getCommitUrl } from '../../../../../utils/utils';
import {
  Application,
  RevisionInfo,
  History,
} from '../../../../../types/application';
import { DeploymentHistoryCommit } from './DeploymentHistoryCommit';

type DeploymentHistoryProps = {
  application: Application;
  revisionsMap: { [key: string]: RevisionInfo };
  appHistory: History[];
  styleClasses: ClassNameMap<'commitMessage' | 'deploymentHistory'>;
  annotations: any;
};

export const DeploymentHistory: React.FC<DeploymentHistoryProps> = ({
  application,
  revisionsMap,
  appHistory,
  styleClasses,
  annotations,
}) => {
  const history = appHistory?.slice()?.reverse();
  return (
    <>
      <Typography color="textPrimary" variant="body1">
        Deployment history
      </Typography>
      <Box className={styleClasses.deploymentHistory}>
        {history?.flatMap(dep => {
          const appSpec = application?.spec;
          const sources = appSpec?.sources
            ? appSpec.sources
            : [appSpec?.source];
          const revisions = dep?.revisions ? dep.revisions : [dep?.revision];

          // Match revisions to sources by index
          // First revision should always be the main one.
          return revisions.map((revision, index) => {
            // X revision -> X source
            const repoSource = sources[index];

            const commitUrl = repoSource?.repoURL
              ? getCommitUrl(repoSource.repoURL, revision, annotations ?? {})
              : null;

            return (
              <DeploymentHistoryCommit
                key={`${revision}`}
                deploymentHistory={dep}
                styleClasses={styleClasses}
                application={application}
                commitMessage={revisionsMap[revision]?.message ?? ''}
                commitUrl={commitUrl}
                revisionSha={revision}
              />
            );
          });
        })}
      </Box>
    </>
  );
};
