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
import { Text, Tag, TagGroup } from '@backstage/ui';
import { RiDiscussLine, RiGithubLine } from '@remixicon/react';
import { Link } from '@backstage/core-components';
import { ResultHighlight } from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import { type GithubDiscussionsSearchDocument } from '@backstage-community/plugin-github-discussions-common';
import styles from './GithubDiscussionsSearchResultListItem.module.css';

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
  if (!result) return null;

  return (
    <div className={styles.item}>
      {(icon && <div className={styles.listItemIcon}>{icon}</div>) ?? (
        <div className={styles.listItemIcon}>
          <RiDiscussLine />
        </div>
      )}
      <div className={styles.flexContainer}>
        <div className={styles.itemText}>
          <Text variant="title-small">
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
          </Text>
          <Text
            variant="body-small"
            color="secondary"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: props.lineClamp,
              overflow: 'hidden',
            }}
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
        <div>
          <TagGroup aria-label="Discussion metadata">
            {result.author ? (
              <Tag id={`author-${result.author}`} size="small">
                <a
                  href={`https://github.com/${result.author}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RiGithubLine size={14} />
                  {result.author}
                </a>
              </Tag>
            ) : null}
            {result.category ? (
              <Tag id={`category-${result.category}`} size="small">
                {result.category}
              </Tag>
            ) : null}
            {result.labels.map(({ name }) => (
              <Tag key={name} id={name} size="small">
                {name}
              </Tag>
            ))}
          </TagGroup>
        </div>
      </div>
    </div>
  );
}
