import React from 'react';
import { Application, RevisionInfo, History } from '../../types/application';
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
        icon={<GitLabIcon />}
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
            <span>{commitMessage}</span>
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
