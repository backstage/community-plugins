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
import type { FC } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import type { SxProps, Theme } from '@mui/material/styles';
import moment from 'moment';
import {
  Application,
  History,
} from '@backstage-community/plugin-argocd-common';
import { useTranslation } from '../../../../../hooks/useTranslation';

type DeploymentHistoryCommitProps = {
  deploymentHistory: History;
  styleClasses: Record<'commitMessage', SxProps<Theme>>;
  application: Application;
  commitMessage: string;
  commitUrl: string | null;
  revisionSha: string;
};
export const DeploymentHistoryCommit: FC<DeploymentHistoryCommitProps> = ({
  deploymentHistory,
  styleClasses,
  commitMessage,
  commitUrl,
  revisionSha,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      elevation={2}
      key={deploymentHistory.id}
      style={{
        margin: '1px',
        padding: 0,
        width: '50rem',
        marginBottom: '5px',
      }}
      data-testid={`commit-sha-${revisionSha}`}
    >
      <CardContent>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={styleClasses.commitMessage}
        >
          {commitMessage}{' '}
          <Link
            aria-disabled={!!commitUrl}
            href={commitUrl ?? ''}
            target="_blank"
            rel="noopener"
          >
            {revisionSha.slice(0, 7)}
          </Link>{' '}
          {t(
            'deploymentLifecycle.sidebar.resources.resource.deploymentHistoryCommit.deployedText',
          )}{' '}
          {moment(deploymentHistory.deployedAt).local().fromNow()}
        </Typography>
      </CardContent>
    </Card>
  );
};
