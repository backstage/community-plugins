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

import { ReactNode } from 'react';
import { Tag, TagGroup, Text } from '@backstage/ui';
import { parseEntityRef } from '@backstage/catalog-model';
import { Link } from '@backstage/core-components';
import { AdrDocument } from '@backstage-community/plugin-adr-common';
import { humanizeEntityRef } from '@backstage/plugin-catalog-react';
import { ResultHighlight } from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import styles from './AdrSearchResultListItem.module.css';

/**
 * @public
 */
export type AdrSearchResultListItemProps = {
  lineClamp?: number;
  highlight?: ResultHighlight;
  icon?: ReactNode;
  rank?: number;
  result?: AdrDocument;
};

/**
 * A component to display an ADR search result.
 * @public
 */
export function AdrSearchResultListItem(props: AdrSearchResultListItemProps) {
  const { lineClamp = 5, highlight, icon, result } = props;

  if (!result) return null;

  return (
    <div className={styles.item}>
      {icon && <div>{icon}</div>}
      <div className={styles.flexContainer}>
        <div className={styles.itemText}>
          <Text variant="title-small" as="div">
            <Link noTrack to={result.location}>
              {highlight?.fields.title ? (
                <HighlightedSearchResultText
                  text={highlight?.fields.title || ''}
                  preTag={highlight?.preTag || ''}
                  postTag={highlight?.postTag || ''}
                />
              ) : (
                result.title
              )}
            </Link>
          </Text>
          <Text
            as="div"
            color="secondary"
            variant="body-small"
            className={styles.snippet}
            style={{ WebkitLineClamp: lineClamp }}
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
        </div>
        <TagGroup className={styles.tags}>
          <Tag size="small">
            {`Entity: ${
              result.entityTitle ??
              humanizeEntityRef(parseEntityRef(result.entityRef))
            }`}
          </Tag>
          {result.status && (
            <Tag size="small">{`Status: ${result.status}`}</Tag>
          )}
          {result.date && <Tag size="small">{`Date: ${result.date}`}</Tag>}
        </TagGroup>
      </div>
    </div>
  );
}
