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

import { ReactNode } from 'react';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import GitHubIcon from '@material-ui/icons/GitHub';
import { Link } from '@backstage/core-components';
import { ResultHighlight } from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import { type GithubDiscussionsSearchDocument } from '@backstage-community/plugin-github-discussions-common';

const useStyles = makeStyles({
  item: {
    display: 'flex',
  },
  flexContainer: {
    flexWrap: 'wrap',
  },
  itemText: {
    width: '100%',
    wordBreak: 'break-all',
    marginBottom: '1rem',
  },
});

/**
 * Props for {@link GithubDiscussionsSearchResultListItem}.
 *
 * @public
 */
export interface GithubDiscussionsSearchResultListItemProps {
  icon?: ReactNode;
  result?: GithubDiscussionsSearchDocument;
  highlight?: ResultHighlight;
  rank?: number;
  lineClamp?: number;
}

/**
 * @internal
 */
export function GithubDiscussionsSearchResultListItem(
  props: GithubDiscussionsSearchResultListItemProps,
) {
  const { result, highlight, icon } = props;
  const classes = useStyles();
  if (!result) return null;

  return (
    <div className={classes.item}>
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <div className={classes.flexContainer}>
        <ListItemText
          className={classes.itemText}
          primaryTypographyProps={{ variant: 'h6' }}
          primary={
            <Link noTrack to={result.location}>
              {highlight?.fields.title ? (
                <HighlightedSearchResultText
                  text={highlight.fields.title}
                  preTag={highlight.preTag}
                  postTag={highlight.postTag}
                />
              ) : (
                result.title
              )}
            </Link>
          }
          secondary={
            <Typography
              component="span"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: props.lineClamp,
                overflow: 'hidden',
              }}
              color="textSecondary"
              variant="body2"
            >
              {highlight?.fields.text ? (
                <HighlightedSearchResultText
                  text={highlight.fields.text}
                  preTag={highlight.preTag}
                  postTag={highlight.postTag}
                />
              ) : (
                result.text
              )}
            </Typography>
          }
        />
        <Box>
          {result.author && (
            <Chip
              label={result.author}
              size="small"
              component="a"
              href={`https://github.com/${result.author}`}
              clickable
              icon={<GitHubIcon />}
            />
          )}
          {result.category && <Chip label={result.category} size="small" />}
          {result.labels.length > 0 &&
            result.labels.map(({ name }) => {
              return <Chip key={name} label={name} size="small" />;
            })}
        </Box>
      </div>
    </div>
  );
}
