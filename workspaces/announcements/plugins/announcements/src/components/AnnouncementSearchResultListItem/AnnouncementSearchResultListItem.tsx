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
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { Flex, Link, List, ListRow, Text } from '@backstage/ui';
import { RiMegaphoneLine } from '@remixicon/react';
import styles from './AnnouncementSearchResultListItem.module.css';

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
  const { t } = useAnnouncementsTranslation();

  if (!result) {
    return null;
  }

  const document = result as IndexableAnnouncement;

  return (
    <List aria-label={t('announcementSearchResultListItem.announcement')}>
      <ListRow
        id={result.location}
        textValue={result.title}
        icon={<RiMegaphoneLine />}
      >
        <Flex direction="column" gap="0" className={styles.itemText}>
          <Link noTrack href={result.location} variant="title-x-small">
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
          <Text
            variant="body-small"
            color="secondary"
            className={styles.createdAt}
          >
            {`${t('announcementSearchResultListItem.published')} `}
            <Text as="span" variant="body-small" title={document.createdAt}>
              {DateTime.fromISO(document.createdAt).toRelative()}
            </Text>
          </Text>
          <Text
            variant="body-small"
            color="secondary"
            className={styles.excerpt}
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
          </Text>
        </Flex>
      </ListRow>
    </List>
  );
};
