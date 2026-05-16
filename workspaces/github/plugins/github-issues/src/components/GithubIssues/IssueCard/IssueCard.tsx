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

import { Text, Flex, Link } from '@backstage/ui';
import { DateTime } from 'luxon';
import { Assignees } from './Assignees';
import { CommentsCount } from './CommentsCount';

type IssueCardProps = {
  title: string;
  createdAt: string;
  updatedAt?: string;
  url: string;
  authorName: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  authorAvatar?: string;
  repositoryName: string;
  commentsCount: number;
  even: boolean;
};

const getElapsedTime = (isoDate: string) =>
  DateTime.fromISO(isoDate).toRelative();

export const IssueCard = (props: IssueCardProps) => {
  const {
    title,
    createdAt,
    updatedAt,
    url,
    assigneeName,
    assigneeAvatar,
    authorName,
    repositoryName,
    commentsCount,
  } = props;

  const handleCardClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      style={{
        marginBottom: 'var(--bui-space-2)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
      data-testid={`issue-${url}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div style={{ padding: 'var(--bui-space-2)' }}>
        <Flex justify="between">
          <Link
            href={`${url.substring(0, url.lastIndexOf('/'))}`}
            target="_blank"
            color="primary"
            onClick={e => e.stopPropagation()}
          >
            {repositoryName}
          </Link>
          <Assignees name={assigneeName} avatar={assigneeAvatar} />
        </Flex>
        <div>
          <Link
            href={url}
            target="_blank"
            color="primary"
            onClick={e => e.stopPropagation()}
          >
            <Text>
              <b>{title}</b>
            </Text>
          </Link>
        </div>
        <Flex justify="between">
          <div
            style={{
              marginTop: 'var(--bui-space-2)',
              marginBottom: 'var(--bui-space-2)',
            }}
          >
            <Text variant="body-small" style={{ display: 'block' }}>
              Created at: <strong>{getElapsedTime(createdAt)}</strong> by{' '}
              <strong>{authorName}</strong>
            </Text>
            {updatedAt && (
              <Text
                variant="body-small"
                style={{
                  display: 'block',
                  marginTop: 'var(--bui-space-1)',
                }}
              >
                Last update at: <strong>{getElapsedTime(updatedAt)}</strong>
              </Text>
            )}
          </div>
          {commentsCount > 0 && <CommentsCount commentsCount={commentsCount} />}
        </Flex>
      </div>
    </div>
  );
};
