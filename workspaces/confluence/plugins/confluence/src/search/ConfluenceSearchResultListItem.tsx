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
import { Link } from '@backstage/core-components';
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import {
  Box,
  Breadcrumbs,
  Chip,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Typography,
} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { ConfluenceSearchIcon } from '../icons';

const useStyles = makeStyles({
  lastUpdated: {
    display: 'block',
    marginTop: '0.2rem',
    marginBottom: '0.8rem',
    fontSize: '0.8rem',
  },
  excerpt: {
    lineHeight: '1.55',
  },
  breadcrumbs: {
    marginTop: '1rem',
  },
  itemText: {
    wordBreak: 'break-all',
  },
});

/**
 * @public
 */
export type IndexableConfluenceDocument = IndexableDocument & {
  spaceName: string;
  lastModified: string;
  lastModifiedFriendly: string;
  lastModifiedBy: string;
  ancestors: {
    id?: number;
    title: string;
    location: string;
  }[];
};

/**
 * @public
 */
export interface ConfluenceResultItemProps {
  result?: IndexableDocument;
  highlight?: ResultHighlight;
  icon?: ReactNode;
}

/**
 * A component to display an Confluence search result.
 *
 * @public
 */
export const ConfluenceSearchResultListItem = ({
  result,
  highlight,
}: ConfluenceResultItemProps) => {
  const classes = useStyles();
  const document = result as IndexableConfluenceDocument;

  if (!result) {
    return null;
  }

  const title = (
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
  );
  const excerpt = (
    <>
      <Typography className={classes.lastUpdated}>
        Last Updated: {document.lastModifiedFriendly} by{' '}
        {document.lastModifiedBy}
      </Typography>
      <>
        {highlight?.fields.text ? (
          <HighlightedSearchResultText
            text={highlight.fields.text}
            preTag={highlight.preTag}
            postTag={highlight.postTag}
          />
        ) : (
          result.text
        )}
      </>

      <Box className={classes.breadcrumbs}>
        <Breadcrumbs
          separator={<NavigateNextIcon />}
          maxItems={4}
          itemsBeforeCollapse={1}
          itemsAfterCollapse={2}
          aria-label="breadcrumb"
        >
          {document.ancestors?.map(ancestor => (
            <Chip
              label={ancestor.title}
              component="a"
              href={ancestor.location}
              target="blank"
              rel="noopener noreferrer"
              clickable
              key={ancestor.id}
            />
          ))}
        </Breadcrumbs>
      </Box>
    </>
  );

  return (
    <>
      <ListItem alignItems="center">
        <ListItemIcon title="Confluence document">
          <ConfluenceSearchIcon />
        </ListItemIcon>
        <ListItemText
          primary={title}
          secondary={excerpt}
          className={classes.itemText}
          primaryTypographyProps={{ variant: 'h6' }}
        />
      </ListItem>

      <Divider component="li" />
    </>
  );
};
