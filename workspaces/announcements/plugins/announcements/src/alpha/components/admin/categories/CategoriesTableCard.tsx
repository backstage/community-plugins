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
import { Category } from '@backstage-community/plugin-announcements-common';
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

import { CategoriesTable } from './CategoriesTable';

/**
 * @internal
 */
type CategoriesTableCardProps = {
  categories: Category[];
  onCreateClick: () => void;
  onDeleteClick: (category: Category) => void;
  canCreate: boolean;
  canDelete: boolean;
};

/**
 * @internal
 */
export const CategoriesTableCard = (props: CategoriesTableCardProps) => {
  const { categories, onCreateClick, onDeleteClick, canCreate, canDelete } =
    props;

  const [pageSize, setPageSize] = useState(5);
  const [offset, setOffset] = useState(0);
  const { t } = useAnnouncementsTranslation();

  const paginatedCategories = useMemo(() => {
    const start = offset;
    const end = offset + pageSize;
    return categories.slice(start, end);
  }, [categories, offset, pageSize]);

  const title = `${t('categoriesPage.title')} (${categories.length})`;

  return (
    <Card>
      <CardHeader>
        <Flex justify="between" align="center">
          <Text variant="title-x-small">{title}</Text>
          <Button isDisabled={!canCreate} onClick={onCreateClick}>
            {t('admin.categoriesContent.createButton')}
          </Button>
        </Flex>
      </CardHeader>

      <CardBody>
        <CategoriesTable
          data={paginatedCategories}
          onDeleteClick={canDelete ? onDeleteClick : undefined}
        />
      </CardBody>

      {categories.length > 0 && (
        <CardFooter>
          <TablePagination
            offset={offset}
            pageSize={pageSize}
            setOffset={setOffset}
            setPageSize={setPageSize}
            rowCount={categories.length}
          />
        </CardFooter>
      )}
    </Card>
  );
};
