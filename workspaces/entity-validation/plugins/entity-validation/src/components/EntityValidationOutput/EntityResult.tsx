/*
 * Copyright 2023 The Backstage Authors
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
import { useState } from 'react';
import type { ComponentType } from 'react';
import { ValidateEntityResponse } from '@backstage/catalog-client';
import { useApp } from '@backstage/core-plugin-api';
import { Box, ButtonIcon, Flex, ListRow } from '@backstage/ui';
import { EntityDisplayName } from '@backstage/plugin-catalog-react';
import { safeEntityKind } from './safeEntityDisplayName';
import { RiArrowUpSLine, RiArrowDownSLine } from '@remixicon/react';
import { MarkdownContent } from '@backstage/core-components';
import { ValidationOutputOk } from '../../types';
import styles from './EntityResult.module.css';

type EntityResultProps = {
  isFirstError?: boolean;
  item: ValidationOutputOk;
};

export const EntityResult = ({
  isFirstError = false,
  item,
}: EntityResultProps) => {
  const app = useApp();
  const [expanded, setExpanded] = useState(isFirstError);

  const Icon = app.getSystemIcon(`kind:${safeEntityKind(item.entity)}`) as
    | ComponentType<{ className?: string }>
    | undefined;

  const fetchErrorMessages = (response: ValidateEntityResponse) => {
    if (!response.valid) {
      return response.errors.map(err => err.message).join('\n\n');
    }
    return '';
  };

  const entityId = `${item.entity.kind}:${
    item.entity.metadata.namespace ?? 'default'
  }/${item.entity.metadata.name}`;

  return (
    <ListRow
      id={entityId}
      icon={
        Icon ? (
          <Icon
            className={
              item.response.valid ? styles.validationOk : styles.validationNotOk
            }
          />
        ) : undefined
      }
      customActions={
        !item.response.valid ? (
          <ButtonIcon
            aria-label={expanded ? 'collapse' : 'expand'}
            onPress={() => setExpanded(!expanded)}
            icon={
              expanded ? (
                <RiArrowUpSLine size={20} />
              ) : (
                <RiArrowDownSLine size={20} />
              )
            }
            variant="secondary"
          />
        ) : undefined
      }
    >
      <Flex direction="column">
        <EntityDisplayName entityRef={item.entity} />
        {!item.response.valid && expanded && (
          <Box className={styles.errorContainer}>
            <MarkdownContent content={fetchErrorMessages(item.response)} />
          </Box>
        )}
      </Flex>
    </ListRow>
  );
};
