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
import React from 'react';
import { Application, RevisionInfo, History } from '../../types/application';
import {
  Chip,
  Typography,
  Tooltip,
  makeStyles,
  Theme,
} from '@material-ui/core';
import GitlabIcon from '../icons/GitlabIcon';

import { Skeleton } from '@material-ui/lab';
import { getCommitUrl } from '../../utils/utils';
import { Entity } from '@backstage/catalog-model';

interface CommitLinkProps {
  entity: Entity;
  application: Application;
  revisionsMap: { [key: string]: RevisionInfo };
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
  gitIcon: {},
}));

const AppCommitLink: React.FC<CommitLinkProps> = ({
  entity,
  application,
  revisionsMap,
  latestRevision,
  showAuthor = false,
}) => {
  const classes = useCommitStyles();

  const revisionInfo = revisionsMap?.[latestRevision?.revision];
  const revisionMessage = revisionInfo?.message;
  const revisionAuthor = revisionInfo?.author;
  const authorInfo = showAuthor ? `by ${revisionAuthor}` : '';

  const commitMessage = `${revisionMessage} ${authorInfo}`;
  return revisionsMap && latestRevision ? (
    <div className={classes.commitContainer}>
      <Chip
        data-testid={`${latestRevision?.revision?.slice(0, 5)}-commit-link`}
        size="small"
        variant="outlined"
        onClick={e => {
          e.stopPropagation();
          const repoUrl = application?.spec?.source?.repoURL ?? '';
          const annotations = entity?.metadata?.annotations ?? {};
          if (repoUrl.length) {
            window.open(
              getCommitUrl(repoUrl, latestRevision?.revision, annotations),
              '_blank',
            );
          }
        }}
        icon={<GitlabIcon style={{ marginLeft: '8px' }} />}
        color="primary"
        label={latestRevision?.revision.slice(0, 7)}
      />
      <Typography
        variant="body2"
        color="textSecondary"
        className={classes.commitMessage}
      >
        {!!revisionInfo ? (
          <Tooltip
            data-testid={`${latestRevision?.revision?.slice(
              0,
              5,
            )}-commit-message`}
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
