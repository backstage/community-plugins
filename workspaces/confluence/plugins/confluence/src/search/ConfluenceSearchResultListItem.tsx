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
import { format } from 'date-fns';
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
  ListItemIcon,
  ListItemText,
  makeStyles,
  Typography,
} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

export const maxExcerptLength = 290;

const useStyles = makeStyles({
  lastUpdated: {
    display: 'block',
    marginTop: '0.2rem',
    marginBottom: '0.8rem',
    fontSize: '0.8rem',
  },
  breadcrumbs: {
    marginTop: '1rem',
  },
  itemText: {
    wordBreak: 'break-all',
    width: '100%',
    marginBottom: '1rem',
  },
  item: {
    display: 'flex',
  },
  flexContainer: {
    flexWrap: 'wrap',
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
  lineClamp?: number;
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
  icon,
  lineClamp = 5,
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
  // Calculate the start index of the excerpt based on the first index of the pretag, defaulting to 0
  // if not found. We use this to ensure the excerpt displayed includes the found search term.
  const firstPreTagIndex = highlight?.fields.text?.indexOf(highlight.preTag);
  const excerptStartIndex = firstPreTagIndex === -1 ? 0 : firstPreTagIndex ?? 0;
  const textLength = highlight?.fields.text?.length;
  // Calculate the end index so the slice doesn't overflow past the end of the text result.
  const excerptEndIndex = textLength
    ? Math.min(textLength, excerptStartIndex + maxExcerptLength)
    : undefined;
  const excerpt = (
    <>
      <Typography className={classes.lastUpdated}>
        Last Updated:{' '}
        {document.lastModifiedFriendly ??
          format(new Date(document.lastModified), 'PPPppp')}{' '}
        by {document.lastModifiedBy}
      </Typography>
      <Typography
        component="span"
        style={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: lineClamp,
          overflow: 'hidden',
        }}
        color="textSecondary"
        variant="body2"
      >
        {highlight?.fields.text ? (
          <HighlightedSearchResultText
            text={`${
              highlight.fields.text
                .slice(excerptStartIndex, excerptEndIndex)
                .trim() +
              (highlight.fields.text.length > maxExcerptLength ? '...' : '')
            }`}
            preTag={highlight.preTag}
            postTag={highlight.postTag}
          />
        ) : (
          `${
            result.text
              .slice(0, Math.min(result.text.length, maxExcerptLength))
              .trim() + (result.text.length > maxExcerptLength ? '...' : '')
          }`
        )}
      </Typography>

      <Box className={classes.breadcrumbs}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          maxItems={4}
          itemsBeforeCollapse={1}
          itemsAfterCollapse={2}
          aria-label="breadcrumb"
        >
          {document.ancestors?.map(ancestor => (
            <Chip
              size="small"
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
    <div className={classes.item}>
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <div className={classes.flexContainer}>
        <ListItemText
          primary={title}
          secondary={excerpt}
          className={classes.itemText}
          primaryTypographyProps={{ variant: 'h6' }}
        />
      </div>
    </div>
  );
};
