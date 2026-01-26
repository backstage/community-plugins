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

import { Tag } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
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

/**
 * @internal
 */
type TagsTableProps = {
  data: Tag[];
  onDeleteClick?: (tag: Tag) => void;
};

type TagTableItem = TableItem & Tag;

/**
 * @internal
 */
export const TagsTable = (props: TagsTableProps) => {
  const { data, onDeleteClick } = props;
  const { t } = useAnnouncementsTranslation();

  const columns: ColumnConfig<TagTableItem>[] = [
    {
      id: 'title',
      label: t('admin.tagsContent.table.title'),
      isRowHeader: true,
      cell: tag => <CellText title={tag.title} />,
    },
    {
      id: 'slug',
      label: t('admin.tagsContent.table.slug'),
      cell: tag => <CellText title={tag.slug} />,
    },
    {
      id: 'actions',
      label: t('admin.tagsContent.table.actions'),
      cell: tag => (
        <Cell>
          <ButtonIcon
            icon={<RiDeleteBinLine />}
            variant="tertiary"
            onClick={() => onDeleteClick?.(tag)}
          />
        </Cell>
      ),
    },
  ];

  const { tableProps } = useTable({
    mode: 'complete',
    getData: () => data.map(tag => ({ ...tag, id: tag.slug })),
  });

  return <Table columnConfig={columns} {...tableProps} />;
};
