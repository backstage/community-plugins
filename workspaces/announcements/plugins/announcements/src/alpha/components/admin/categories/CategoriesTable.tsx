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
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  Cell,
  ButtonIcon,
} from '@backstage/ui';
import { RiDeleteBinLine } from '@remixicon/react';

import { Category } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';

const CategoriesTableEmptyState = () => {
  const { t } = useAnnouncementsTranslation();

  return (
    <Row>
      <CellText
        colSpan={3}
        title={t('admin.categoriesContent.table.noCategoriesFound')}
      />
    </Row>
  );
};

type CategoryTableRowProps = {
  category: Category;
  onDeleteClick?: (category: Category) => void;
};

const CategoryTableRow = (props: CategoryTableRowProps) => {
  const { category, onDeleteClick } = props;

  return (
    <Row key={category.slug}>
      <CellText title={category.title} />
      <CellText title={category.slug} />
      <Cell>
        <ButtonIcon
          icon={<RiDeleteBinLine />}
          variant="tertiary"
          onClick={() => onDeleteClick!(category)}
        />
      </Cell>
    </Row>
  );
};

/**
 * @internal
 */
type CategoriesTableProps = {
  data: Category[];
  onDeleteClick?: (category: Category) => void;
};

/**
 * @internal
 */
export const CategoriesTable = (props: CategoriesTableProps) => {
  const { data, onDeleteClick } = props;
  const { t } = useAnnouncementsTranslation();

  return (
    <Table>
      <TableHeader>
        <Column id="title" isRowHeader>
          {t('admin.categoriesContent.table.title')}
        </Column>
        <Column id="slug">{t('admin.categoriesContent.table.slug')}</Column>
        <Column id="actions">
          {t('admin.categoriesContent.table.actions')}
        </Column>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map(category => (
            <CategoryTableRow
              key={category.slug}
              category={category}
              onDeleteClick={onDeleteClick}
            />
          ))
        ) : (
          <CategoriesTableEmptyState />
        )}
      </TableBody>
    </Table>
  );
};
