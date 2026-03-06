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

import { Link } from '@backstage/core-components';
import CardActionArea from '@material-ui/core/CardActionArea';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import { Text, Flex } from '@backstage/ui';
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

  return (
    <div
      style={{ marginBottom: 'var(--bui-space-2)' }}
      data-testid={`issue-${url}`}
    >
      <Paper variant="outlined">
        <CardActionArea href={url} target="_blank">
          <div style={{ padding: 'var(--bui-space-2)' }}>
            <Flex justify="between">
              <Link to={`${url.substring(0, url.lastIndexOf('/'))}`}>
                {repositoryName}
              </Link>
              <Assignees name={assigneeName} avatar={assigneeAvatar} />
            </Flex>
            <div>
              <Text>
                <b>{title}</b>
              </Text>
            </div>
            <Divider variant="middle" />
            <Flex justify="between">
              <div
                style={{
                  marginTop: 'var(--bui-space-2)',
                  marginBottom: 'var(--bui-space-2)',
                }}
              >
                <Text variant="body-small">
                  Created at: <strong>{getElapsedTime(createdAt)}</strong> by{' '}
                  <strong>{authorName}</strong>
                </Text>
                {updatedAt && (
                  <Text variant="body-small">
                    Last update at: <strong>{getElapsedTime(updatedAt)}</strong>
                  </Text>
                )}
              </div>
              {commentsCount > 0 && (
                <CommentsCount commentsCount={commentsCount} />
              )}
            </Flex>
          </div>
        </CardActionArea>
      </Paper>
    </div>
  );
};
