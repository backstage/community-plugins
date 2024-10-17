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

import React, { ReactNode } from 'react';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from '@backstage/core-components';
import { ResultHighlight } from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';

const useStyles = makeStyles(
  {
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
  },
  { name: 'GithubDiscussionsSearchResultListItem' },
);

/**
 * Props for {@link GithubDiscussionsSearchResultListItem}.
 *
 * @public
 */
export interface GithubDiscussionsSearchResultListItemProps {
  icon?: ReactNode | ((result: any) => ReactNode);
  result?: any;
  highlight?: ResultHighlight;
  rank?: number;
  lineClamp?: number;
}

/** @public */
export function GithubDiscussionsSearchResultListItem(
  props: GithubDiscussionsSearchResultListItemProps,
) {
  // const { result, highlight } = props;
  // const classes = useStyles();

  // if (!result) return null;

  return <div className={classes.item}>hello</div>;
}
