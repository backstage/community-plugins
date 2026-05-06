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
import { FunctionComponent } from 'react';
import {
  Text,
  Flex,
  Tag,
  TagGroup,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { getElapsedTime, decorateCommitStatus } from '../../utils/functions';
import { UserHeader } from '../UserHeader';
import { DraftPrIcon } from '../icons/DraftPr';
import { RiInboxUnarchiveLine } from '@remixicon/react';
import { Label, Status } from '../../utils/types';

type Props = {
  title: string;
  createdAt: string;
  updatedAt?: string;
  authorName: string;
  authorAvatar?: string;
  repositoryName: string;
  isDraft: boolean;
  repositoryIsArchived: boolean;
  labels?: Label[];
  status?: Status[];
};

const CardHeader: FunctionComponent<Props> = (props: Props) => {
  const {
    title,
    createdAt,
    updatedAt,
    authorName,
    authorAvatar,
    repositoryName,
    isDraft,
    repositoryIsArchived,
    labels,
    status,
  } = props;

  return (
    <>
      <Flex justify="between">
        <Text variant="body-small" color="secondary">
          {repositoryName}
        </Text>
        <UserHeader name={authorName} avatar={authorAvatar} />
      </Flex>
      <Flex justify="start">
        {isDraft && (
          <TooltipTrigger>
            <span title="Draft PR">
              <Flex justify="center" align="center">
                <DraftPrIcon />
              </Flex>
            </span>
            <Tooltip>Draft PR</Tooltip>
          </TooltipTrigger>
        )}
        {repositoryIsArchived && (
          <TooltipTrigger>
            <span title="Repository is archived">
              <Flex justify="center" align="center">
                <RiInboxUnarchiveLine size={20} />
              </Flex>
            </span>
            <Tooltip>Repository is archived</Tooltip>
          </TooltipTrigger>
        )}
      </Flex>
      <Text>
        <b>{title}</b>
      </Text>
      <Flex
        justify="between"
        style={{
          marginTop: 'var(--bui-space-2)',
          marginBottom: 'var(--bui-space-2)',
        }}
      >
        <Text variant="body-small">
          Created: <strong>{getElapsedTime(createdAt)}</strong>
        </Text>
        {updatedAt && (
          <Text variant="body-small">
            Last update: <strong>{getElapsedTime(updatedAt)}</strong>
          </Text>
        )}
      </Flex>
      {status && (
        <Flex
          align="center"
          style={{ flexWrap: 'wrap', paddingTop: 'var(--bui-space-2)' }}
        >
          <Text variant="body-small">
            Commit Status: <strong>{decorateCommitStatus(status)}</strong>
          </Text>
        </Flex>
      )}
      {labels && (
        <TagGroup
          aria-label="Labels"
          style={{ paddingTop: 'var(--bui-space-2)' }}
        >
          {labels.map(data => (
            <Tag key={data.id} id={data.id} size="small">
              {data.name}
            </Tag>
          ))}
        </TagGroup>
      )}
    </>
  );
};

export default CardHeader;
