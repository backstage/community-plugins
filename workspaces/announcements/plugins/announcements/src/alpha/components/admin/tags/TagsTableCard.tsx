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
import { useState, useMemo } from 'react';
import { Tag } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import {
  Button,
  TablePagination,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Text,
  Flex,
} from '@backstage/ui';

import { TagsTable } from './TagsTable';

/**
 * @internal
 */
type TagsTableCardProps = {
  tags: Tag[];
  onCreateClick: () => void;
  onDeleteClick: (tag: Tag) => void;
  canCreate: boolean;
  canDelete: boolean;
};

/**
 * @internal
 */
export const TagsTableCard = (props: TagsTableCardProps) => {
  const { tags, onCreateClick, onDeleteClick, canCreate, canDelete } = props;

  const [pageSize, setPageSize] = useState(5);
  const [offset, setOffset] = useState(0);
  const { t } = useAnnouncementsTranslation();

  const paginatedTags = useMemo(() => {
    const start = offset;
    const end = offset + pageSize;
    return tags.slice(start, end);
  }, [tags, offset, pageSize]);

  const title = `${t('tagsPage.title')} (${tags.length})`;

  return (
    <Card>
      <CardHeader>
        <Flex justify="between" align="center">
          <Text variant="title-x-small">{title}</Text>
          <Button isDisabled={!canCreate} onClick={onCreateClick}>
            {t('admin.tagsContent.createButton')}
          </Button>
        </Flex>
      </CardHeader>

      <CardBody>
        <TagsTable
          data={paginatedTags}
          onDeleteClick={canDelete ? onDeleteClick : undefined}
        />
      </CardBody>

      {tags.length > 0 && (
        <CardFooter>
          <TablePagination
            offset={offset}
            pageSize={pageSize}
            setOffset={setOffset}
            setPageSize={setPageSize}
            rowCount={tags.length}
          />
        </CardFooter>
      )}
    </Card>
  );
};
