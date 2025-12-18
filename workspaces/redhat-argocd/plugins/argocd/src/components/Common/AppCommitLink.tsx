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
import type { FC, MouseEvent } from 'react';
import {
  Application,
  RevisionInfo,
  History,
} from '@backstage-community/plugin-redhat-argocd-common';
import {
  Chip,
  Typography,
  Tooltip,
  makeStyles,
  Theme,
} from '@material-ui/core';
import GitLabIcon from '@patternfly/react-icons/dist/esm/icons/gitlab-icon';
import { Skeleton } from '@material-ui/lab';
import { getCommitUrl } from '../../utils/utils';
import { Entity } from '@backstage/catalog-model';

interface CommitLinkProps {
  entity: Entity;
  application: Application;
  revisions: RevisionInfo[];
  latestRevision: History;
  showAuthor?: boolean;
}

const useCommitStyles = makeStyles<Theme>(theme => ({
  commitContainer: {
    maxWidth: theme.spacing(35),
  },
  commitMessage: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
}));

const AppCommitLink: FC<CommitLinkProps> = ({
  entity,
  application,
  revisions,
  latestRevision,
  showAuthor = false,
}) => {
  const classes = useCommitStyles();

  // If we have a multi-source application,
  // lets only use the first source to keep things simple for now.
  const latestRevisionSha =
    latestRevision?.revisions?.[0] ?? latestRevision?.revision ?? '';

  const revisionInfo = latestRevisionSha
    ? revisions?.find(r => r?.revisionID === latestRevisionSha)
    : undefined;

  const repoUrl =
    application?.spec?.sources?.[0]?.repoURL ??
    application?.spec?.source?.repoURL ??
    '';

  const revisionMessage = revisionInfo?.message || '';
  const revisionAuthor = revisionInfo?.author || '';
  const authorInfo = showAuthor && revisionAuthor ? `by ${revisionAuthor}` : '';

  const commitMessage = authorInfo
    ? `${revisionMessage} ${authorInfo}`.trim()
    : revisionMessage;

  const handleClick = (e: MouseEvent) => {
    if (!repoUrl) return;
    e.stopPropagation();
    const annotations = entity?.metadata?.annotations || {};
    window.open(
      getCommitUrl(repoUrl, latestRevisionSha, annotations),
      '_blank',
    );
  };

  return revisions && latestRevision ? (
    <div className={classes.commitContainer}>
      <Chip
        data-testid={`${latestRevisionSha.slice(0, 5)}-commit-link`}
        size="small"
        variant="outlined"
        onClick={handleClick}
        icon={<GitLabIcon />}
        color="primary"
        label={latestRevisionSha.slice(0, 7)}
        disabled={!repoUrl}
      />
      <Typography
        variant="body2"
        color="textSecondary"
        className={classes.commitMessage}
      >
        {!!revisionInfo ? (
          <Tooltip
            data-testid={`${latestRevisionSha?.slice(0, 5)}-commit-message`}
            title={commitMessage}
          >
            <Typography>{commitMessage}</Typography>
          </Tooltip>
        ) : (
          <Skeleton />
        )}
      </Typography>
    </div>
  ) : (
    <>-</>
  );
};

export default AppCommitLink;
