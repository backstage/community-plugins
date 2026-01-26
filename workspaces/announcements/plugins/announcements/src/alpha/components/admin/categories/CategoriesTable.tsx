/*
 * Copyright 2025 The Backstage Authors
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
import {
  CellText,
  Cell,
  ButtonIcon,
  Table,
  useTable,
  type ColumnConfig,
  TableItem,
} from '@backstage/ui';
import { RiDeleteBinLine } from '@remixicon/react';

import { Category } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { useEffect } from 'react';

/**
 * @internal
 */
type CategoriesTableProps = {
  data: Category[];
  onDeleteClick?: (category: Category) => void;
};

type CategoryTableItem = TableItem & Category;

/**
 * @internal
 */
export const CategoriesTable = (props: CategoriesTableProps) => {
  const { data, onDeleteClick } = props;
  const { t } = useAnnouncementsTranslation();

  const columns: ColumnConfig<CategoryTableItem>[] = [
    {
      id: 'title',
      label: t('admin.categoriesContent.table.title'),
      isRowHeader: true,
      cell: category => <CellText title={category.title} />,
    },
    {
      id: 'slug',
      label: t('admin.categoriesContent.table.slug'),
      cell: category => <CellText title={category.slug} />,
    },
    {
      id: 'actions',
      label: t('admin.categoriesContent.table.actions'),
      cell: category => (
        <Cell>
          <ButtonIcon
            icon={<RiDeleteBinLine />}
            variant="tertiary"
            onClick={() => onDeleteClick?.(category)}
          />
        </Cell>
      ),
    },
  ];

  const { tableProps, reload } = useTable({
    mode: 'complete',
    getData: () => data.map(category => ({ ...category, id: category.slug })),
  });

  useEffect(() => {
    reload();
  }, [data, reload]);

  return <Table columnConfig={columns} {...tableProps} />;
};
