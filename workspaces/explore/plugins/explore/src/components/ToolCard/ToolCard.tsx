/*
 * Copyright 2020 The Backstage Authors
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

import { ExploreTool } from '@backstage-community/plugin-explore-react';
import { ButtonLink, Card, CardBody, CardFooter, Text } from '@backstage/ui';
import classNames from 'classnames';
import styles from './ToolCard.module.css';

type Props = {
  card: ExploreTool;
  objectFit?: 'cover' | 'contain';
};

export const ToolCard = ({ card, objectFit }: Props) => {
  const { title, description, url, image } = card;

  return (
    <Card>
      <div
        role="img"
        aria-label={title}
        title={title}
        className={classNames(styles.media, {
          [styles.mediaContain]: objectFit === 'contain',
        })}
        style={{ backgroundImage: image ? `url(${image})` : undefined }}
      />
      <CardBody>
        <Text as="h5" variant="title-medium" weight="bold">
          {title}
        </Text>
        <Text style={{ marginTop: 'var(--bui-space-2)' }}>
          {description || 'Description missing'}
        </Text>
      </CardBody>
      <CardFooter style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ButtonLink variant="primary" href={url ?? ''} isDisabled={!url}>
          Explore
        </ButtonLink>
      </CardFooter>
    </Card>
  );
};
