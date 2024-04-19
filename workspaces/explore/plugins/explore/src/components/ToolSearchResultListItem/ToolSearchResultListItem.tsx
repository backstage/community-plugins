/*
 * Copyright 2022 The Backstage Authors
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
import { makeStyles } from '@material-ui/core/styles';
import { Link } from '@backstage/core-components';
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';

const useStyles = makeStyles(
  {
    flexContainer: {
      flexWrap: 'wrap',
    },
    itemText: {
      width: '100%',
      wordBreak: 'break-all',
      marginBottom: '1rem',
    },
  },
  { name: 'ExploreToolSearchResultListItem' },
);

/**
 * Props for {@link ToolSearchResultListItem}.
 *
 * @public
 */
export interface ToolSearchResultListItemProps {
  icon?: ReactNode | ((result: IndexableDocument) => ReactNode);
  result?: IndexableDocument;
  highlight?: ResultHighlight;
  rank?: number;
}

/**  @public */
export function ToolSearchResultListItem(props: ToolSearchResultListItemProps) {
  const result = props.result as any;

  const classes = useStyles();

  if (!result) return null;

  return (
    <>
      {props.icon && (
        <ListItemIcon>
          {typeof props.icon === 'function' ? props.icon(result) : props.icon}
        </ListItemIcon>
      )}
      <div className={classes.flexContainer}>
        <ListItemText
          className={classes.itemText}
          primaryTypographyProps={{ variant: 'h6' }}
          primary={
            <Link noTrack to={result.location}>
              {props.highlight?.fields.title ? (
                <HighlightedSearchResultText
                  text={props.highlight.fields.title}
                  preTag={props.highlight.preTag}
                  postTag={props.highlight.postTag}
                />
              ) : (
                result.title
              )}
            </Link>
          }
          secondary={
            props.highlight?.fields.text ? (
              <HighlightedSearchResultText
                text={props.highlight.fields.text}
                preTag={props.highlight.preTag}
                postTag={props.highlight.postTag}
              />
            ) : (
              result.text
            )
          }
        />
        <Box>
          {result.tags?.map((tag: string) => (
            <Chip label={tag} size="small" />
          ))}
        </Box>
      </div>
    </>
  );
}
