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
import { DateTime } from 'luxon';
import { Link } from '@backstage/core-components';
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import {
  makeStyles,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';

const useStyles = makeStyles({
  createdAt: {
    display: 'block',
    marginTop: '0.2rem',
    marginBottom: '0.8rem',
  },
  excerpt: {
    lineHeight: '1.55',
  },
  itemText: {
    wordBreak: 'break-all',
  },
});

type IndexableAnnouncement = IndexableDocument & {
  createdAt: string;
};

/** @public */
export interface AnnouncementSearchResultProps {
  result?: IndexableDocument;
  highlight?: ResultHighlight;
  rank?: number;
}

export const AnnouncementSearchResultListItem = ({
  result,
  highlight,
}: AnnouncementSearchResultProps) => {
  const classes = useStyles();
  const { t } = useAnnouncementsTranslation();

  if (!result) {
    return null;
  }

  const document = result as IndexableAnnouncement;

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
      <Typography component="span" className={classes.createdAt}>
        {`${t('announcementSearchResultListItem.published')} `}
        <Typography component="span" title={document.createdAt}>
          {DateTime.fromISO(document.createdAt).toRelative()}
        </Typography>
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
    </>
  );

  return (
    <ListItem alignItems="center">
      <ListItemIcon title={t('announcementSearchResultListItem.announcement')}>
        <RecordVoiceOverIcon />
      </ListItemIcon>
      <ListItemText
        primary={title}
        secondary={excerpt}
        className={classes.itemText}
        primaryTypographyProps={{ variant: 'h6' }}
      />
    </ListItem>
  );
};
