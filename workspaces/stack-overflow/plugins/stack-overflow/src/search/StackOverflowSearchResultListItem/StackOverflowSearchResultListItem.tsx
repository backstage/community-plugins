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

import type { ReactNode, CSSProperties } from 'react';
import { Link } from '@backstage/core-components';
import { Text } from '@backstage/ui';
import { useAnalytics } from '@backstage/core-plugin-api';
import type { ResultHighlight } from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import { decodeHtml } from '../../util';

/**
 * Props for {@link StackOverflowSearchResultListItem}
 *
 * @public
 */
export type StackOverflowSearchResultListItemProps = {
  result?: any; // TODO(emmaindal): type to StackOverflowDocument.
  icon?: ReactNode;
  rank?: number;
  highlight?: ResultHighlight;
};

export const StackOverflowSearchResultListItem = (
  props: StackOverflowSearchResultListItemProps,
) => {
  const { result, highlight } = props;

  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.captureEvent('discover', result.title, {
      attributes: { to: result.location },
      value: props.rank,
    });
  };

  if (!result) {
    return null;
  }

  const chipStyles: CSSProperties = {
    display: 'inline-block',
    padding: '4px 8px',
    margin: '4px 4px 4px 0',
    backgroundColor: 'var(--bui-bg-muted)',
    borderRadius: '4px',
    fontSize: '12px',
    border: '1px solid var(--bui-border-1)',
  };

  return (
    <>
      <div
        role="listitem"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '8px 0',
        }}
      >
        {props.icon && <div style={{ flexShrink: 0 }}>{props.icon}</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text weight="bold" as="h3">
            <Link to={result.location} noTrack onClick={handleClick}>
              {highlight?.fields?.title ? (
                <HighlightedSearchResultText
                  text={decodeHtml(highlight.fields.title)}
                  preTag={highlight.preTag}
                  postTag={highlight.postTag}
                />
              ) : (
                decodeHtml(result.title)
              )}
            </Link>
          </Text>
          <Text style={{ opacity: 0.7 }}>
            Author:{' '}
            {highlight?.fields?.text ? (
              <HighlightedSearchResultText
                text={decodeHtml(highlight.fields.text)}
                preTag={highlight.preTag}
                postTag={highlight.postTag}
              />
            ) : (
              decodeHtml(result.text)
            )}
          </Text>
          <div style={{ marginTop: '8px' }}>
            <div style={chipStyles}>
              <Text>Answer(s): {result.answers}</Text>
            </div>
            {result.tags &&
              result.tags.map((tag: string) => (
                <div key={tag} style={chipStyles}>
                  <Text>Tag: {tag}</Text>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div
        style={{
          borderBottom: '1px solid var(--bui-border-1)',
          margin: '8px 0',
        }}
      />
    </>
  );
};
