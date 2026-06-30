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
import {
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardFooter,
  Tag,
  TagGroup,
  Text,
} from '@backstage/ui';
import classNames from 'classnames';
import styles from './ToolCard.module.css';

type Props = {
  card: ExploreTool;
  objectFit?: 'cover' | 'contain';
};

export const ToolCard = ({ card, objectFit }: Props) => {
  const { title, description, url, image, lifecycle, tags } = card;
  const showLifecycle =
    !!lifecycle && lifecycle.toLocaleLowerCase('en-US') !== 'ga';

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
        <div className={styles.titleRow}>
          <Text as="h5" variant="title-medium" weight="bold">
            {title}
          </Text>
          {showLifecycle && (
            <TagGroup>
              <Tag size="small" className={styles.lifecycle}>
                {lifecycle}
              </Tag>
            </TagGroup>
          )}
        </div>
        <Text style={{ marginTop: 'var(--bui-space-2)' }}>
          {description || 'Description missing'}
        </Text>
        {tags && tags.length > 0 && (
          <TagGroup className={styles.tags}>
            {tags.map(tag => (
              <Tag key={tag} size="small">
                {tag}
              </Tag>
            ))}
          </TagGroup>
        )}
      </CardBody>
      <CardFooter style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {url ? (
          <ButtonLink variant="primary" href={url}>
            Explore
          </ButtonLink>
        ) : (
          <Button variant="primary" isDisabled>
            Explore
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
