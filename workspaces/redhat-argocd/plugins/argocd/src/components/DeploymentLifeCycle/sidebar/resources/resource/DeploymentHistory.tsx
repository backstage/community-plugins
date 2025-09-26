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
import type { FC } from 'react';
import { getCommitUrl } from '../../../../../utils/utils';
import {
  Application,
  RevisionInfo,
  History,
} from '@backstage-community/plugin-redhat-argocd-common';
import { DeploymentHistoryCommit } from './DeploymentHistoryCommit';
import { useTranslation } from '../../../../../hooks/useTranslation';

type DeploymentHistoryProps = {
  application: Application;
  revisions: RevisionInfo[];
  appHistory: History[];
  styleClasses: ClassNameMap<'commitMessage' | 'deploymentHistory'>;
  annotations: any;
  showFullDeploymentHistory?: boolean;
};

export const DeploymentHistory: FC<DeploymentHistoryProps> = ({
  application,
  revisions,
  appHistory,
  styleClasses,
  annotations,
  showFullDeploymentHistory,
}) => {
  const history = appHistory?.slice()?.reverse() || [];
  const { spec } = application || {};
  const sources = spec?.sources || (spec?.source ? [spec.source] : []);
  const displayedRevisions = new Set<string>();
  const { t } = useTranslation();

  return (
    <>
      <Typography color="textPrimary" variant="body1">
        {t(
          'deploymentLifecycle.sidebar.resources.resource.deploymentHistory.bodyText',
        )}
      </Typography>
      <Box className={styleClasses.deploymentHistory}>
        {history.flatMap(dep => {
          const revisionShas =
            dep?.revisions || (dep?.revision ? [dep.revision] : []);

          return revisionShas
            .filter((rev): rev is string => typeof rev === 'string')
            .filter(rev => {
              // If this option is set, don't filter duplicates
              if (showFullDeploymentHistory) {
                return true;
              }

              // Only show each revision once
              if (displayedRevisions.has(rev)) {
                return false;
              }
              displayedRevisions.add(rev);
              return true;
            })
            .map((revision, index) => {
              // Match revisions to sources by index
              // First revision should always be the main one.
              const repoSource = sources[index];

              const commitUrl = repoSource?.repoURL
                ? getCommitUrl(repoSource.repoURL, revision, annotations)
                : null;

              const commitMessage =
                revisions?.find(r => r.revisionID === revision)?.message || '';
              return (
                <DeploymentHistoryCommit
                  // When we have duplicate revisions allowed, we want to prevent
                  // duplicate keys for the components.
                  // The deployment and index should be different for each duplicate revision
                  key={`rev-${revision}-${index}-dep-${dep?.id}`}
                  deploymentHistory={dep}
                  styleClasses={styleClasses}
                  application={application}
                  commitMessage={commitMessage}
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
