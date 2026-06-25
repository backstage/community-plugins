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
import { PropsWithChildren, FunctionComponent } from 'react';
import { Card as BUICard, CardBody } from '@backstage/ui';
import CardHeader from './CardHeader';
import { Label, Status } from '../../utils/types';

type Props = {
  title: string;
  createdAt: string;
  updatedAt?: string;
  prUrl: string;
  authorName: string;
  authorAvatar?: string;
  repositoryName: string;
  isDraft: boolean;
  repositoryIsArchived: boolean;
  labels?: Label[];
  status?: Status[];
};

const Card: FunctionComponent<PropsWithChildren<Props>> = (
  props: PropsWithChildren<Props>,
) => {
  const {
    title,
    createdAt,
    updatedAt,
    prUrl,
    authorName,
    authorAvatar,
    repositoryName,
    isDraft,
    repositoryIsArchived,
    labels,
    status,
    children,
  } = props;

  return (
    <BUICard
      href={prUrl}
      target="_blank"
      rel="noopener noreferrer"
      label={title}
      style={{
        background: 'transparent',
        border: '1px solid var(--bui-border-1)',
      }}
    >
      <CardBody style={{ paddingBlockStart: 'var(--bui-space-4)' }}>
        <CardHeader
          title={title}
          createdAt={createdAt}
          updatedAt={updatedAt}
          authorName={authorName}
          authorAvatar={authorAvatar}
          repositoryName={repositoryName}
          isDraft={isDraft}
          repositoryIsArchived={repositoryIsArchived}
          labels={labels}
          status={status}
        />
        {children}
      </CardBody>
    </BUICard>
  );
};

export default Card;
