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
import { useState, useEffect } from 'react';
import { Typography, Box, Avatar, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Table, TableColumn, InfoCard, Link } from '@backstage/core-components';
import { EntityPeekAheadPopover } from '@backstage/plugin-catalog-react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import StopIcon from '@material-ui/icons/Stop';
import { useApi } from '@backstage/core-plugin-api';
import { bitbucketApiRef, PullRequest } from '../../api/BitbucketApi';

const useStyles = makeStyles(theme => ({
  avatar: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    fontSize: '0.8rem',
  },
  authorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  reviewersContainer: {
    display: 'flex',
    flexWrap: 'nowrap',
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(3),
  },
  reviewerAvatar: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    fontSize: '0.8rem',
    marginLeft: theme.spacing(-0.7),
    border: '1px solid white',
    '&:first-child': {
      marginLeft: 0,
    },
  },
  authorSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  moreReviewersText: {
    alignSelf: 'center',
    cursor: 'pointer',
    paddingLeft: theme.spacing(0.6),
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  buildIcon: {
    fontSize: 20,
  },
}));

// This is a React component (capital first letter) so it can use hooks
const BuildIcon = ({ state }: { state: string | undefined }) => {
  const classes = useStyles();

  const getIcon = () => {
    switch (state) {
      case 'SUCCESSFUL':
        return (
          <CheckCircleIcon color="primary" className={classes.buildIcon} />
        );
      case 'FAILED':
        return <ErrorIcon color="error" className={classes.buildIcon} />;
      case 'INPROGRESS':
        return (
          <HourglassEmptyIcon color="action" className={classes.buildIcon} />
        );
      case 'STOPPED':
        return <StopIcon color="error" className={classes.buildIcon} />;
      default:
        return null;
    }
  };

  const statusText = state
    ? state.charAt(0) + state.slice(1).toLowerCase()
    : 'Unknown';

  return (
    <Tooltip title={statusText} arrow>
      <Box display="flex" alignItems="center">
        {getIcon()}
      </Box>
    </Tooltip>
  );
};

export interface BitbucketPullRequestsProps {
  maxItems?: number;
  userRole?: 'REVIEWER' | 'AUTHOR';
  buildStatus?: boolean;
}

export const HomePagePullRequestsTable = ({
  userRole,
  maxItems = 25,
  buildStatus = true,
}: BitbucketPullRequestsProps) => {
  const classes = useStyles();
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const bitbucketApi = useApi(bitbucketApiRef);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPullRequests = async () => {
      try {
        setLoading(true);
        const response = await bitbucketApi.fetchUserPullRequests(
          userRole,
          'OPEN',
          maxItems,
          { includeBuildStatus: buildStatus },
        );
        setPullRequests(response.slice(0, maxItems));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to load pull requests: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadPullRequests();
  }, [maxItems, bitbucketApi, userRole, buildStatus]);

  const baseColumns: TableColumn<PullRequest>[] = [
    {
      title: 'PR ID',
      field: 'id',
      width: '8%',
      render: row => (
        <Box display="flex" alignItems="center">
          <Link to={row.url} target="_blank">
            PR #{row.id}
          </Link>
        </Box>
      ),
    },
    {
      title: 'Title',
      field: 'title',
      render: row => <Typography variant="body2">{row.title}</Typography>,
    },
    {
      title: 'Repository',
      field: 'repository',
      render: row => (
        <Typography variant="body2">
          <Link to={`${row.repoUrl}?at=${row.sourceBranch}`} target="_blank">
            {row.fromRepo}
          </Link>
        </Typography>
      ),
    },
    {
      title: 'Branch',
      field: 'branch',
      render: row => (
        <Typography variant="body2">
          <Link to={`${row.repoUrl}?at=${row.sourceBranch}`} target="_blank">
            {row.sourceBranch}
          </Link>
        </Typography>
      ),
    },
    {
      title: 'Author/Reviewers',
      field: 'author.displayName',
      render: row => {
        const userEntityRef = `user:default/${row.author.slug}`;
        const userAvatarUrl = `https://bitbucket.athenahealth.com/users/${row.author.slug}/avatar.png`;

        return (
          <div className={classes.authorSection}>
            <div className={classes.authorContainer}>
              <EntityPeekAheadPopover entityRef={userEntityRef}>
                <div className={classes.authorContainer}>
                  <Avatar
                    src={userAvatarUrl}
                    alt={row.author.displayName}
                    className={classes.avatar}
                  >
                    {row.author.displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2">
                    {row.author.displayName}
                  </Typography>
                </div>
              </EntityPeekAheadPopover>
            </div>
            {row.reviewers.length > 0 && (
              <div className={classes.reviewersContainer}>
                {row.reviewers.slice(0, 4).map((reviewer: any) => (
                  <Tooltip
                    key={reviewer.slug}
                    title={reviewer.displayName}
                    arrow
                  >
                    <Avatar
                      src={`https://bitbucket.athenahealth.com/users/${reviewer.slug}/avatar.png`}
                      alt={reviewer.displayName}
                      className={classes.reviewerAvatar}
                    >
                      {reviewer.displayName.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))}
                {row.reviewers.length > 4 && (
                  <Tooltip
                    title={
                      <div>
                        {row.reviewers.slice(4).map((reviewer: any) => (
                          <div key={reviewer.slug} style={{ margin: '4px 0' }}>
                            <Avatar
                              src={`https://bitbucket.athenahealth.com/users/${reviewer.slug}/avatar.png`}
                              style={{
                                width: 20,
                                height: 20,
                                display: 'inline-block',
                                marginRight: 8,
                                verticalAlign: 'middle',
                              }}
                            >
                              {reviewer.displayName.charAt(0).toUpperCase()}
                            </Avatar>
                            {reviewer.displayName}
                          </div>
                        ))}
                      </div>
                    }
                    arrow
                    placement="top"
                  >
                    <Typography
                      variant="caption"
                      className={classes.moreReviewersText}
                    >
                      +{row.reviewers.length - 4} more
                    </Typography>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const buildStatusColumn: TableColumn<PullRequest> = {
    title: 'Build Status',
    field: 'buildSummaries',
    width: '5%',
    headerStyle: {
      textAlign: 'center',
      padding: '0 8px',
    },
    cellStyle: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 8px',
      height: '100%',
      minHeight: '48px', // Ensure consistent row height
    },
    render: row => (
      <Box display="flex" justifyContent="center">
        <BuildIcon state={row.buildStatus} />
      </Box>
    ),
  };

  const columns = buildStatus
    ? [...baseColumns, buildStatusColumn]
    : baseColumns;

  if (error) {
    return (
      <InfoCard>
        <Typography color="error">{error}</Typography>
      </InfoCard>
    );
  }

  return (
    <InfoCard noPadding>
      <Table
        options={{
          padding: 'dense',
        }}
        title={`Pull Requests (${pullRequests.length})`}
        data={pullRequests}
        columns={columns}
        isLoading={loading}
      />
    </InfoCard>
  );
};
