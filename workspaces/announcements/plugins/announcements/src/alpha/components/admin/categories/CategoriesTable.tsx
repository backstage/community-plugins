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

import { Category } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
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

/**
 * @internal
 */
type CategoriesTableProps = {
  data: Category[];
  onDeleteClick?: (category: Category) => void;
  showEmptyState?: boolean;
};

/**
 * @internal
 */
export const CategoriesTable = (props: CategoriesTableProps) => {
  const { data, onDeleteClick, showEmptyState = false } = props;
  const { t } = useAnnouncementsTranslation();

  const hasActions = onDeleteClick !== undefined;

  return (
    <Table>
      <TableHeader>
        <Column id="title" isRowHeader>
          {t('admin.categoriesContent.table.title')}
        </Column>
        <Column id="slug">{t('admin.categoriesContent.table.slug')}</Column>
        {hasActions && (
          <Column id="actions">
            {t('admin.categoriesContent.table.actions')}
          </Column>
        )}
      </TableHeader>
      <TableBody>
        {showEmptyState || data.length === 0 ? (
          <Row>
            <CellText
              colSpan={hasActions ? 3 : 2}
              title={t('admin.categoriesContent.table.noCategoriesFound')}
            />
          </Row>
        ) : (
          data.map(category => (
            <Row key={category.slug} id={category.slug}>
              <CellText title={category.title} />
              <CellText title={category.slug} />
              {hasActions && (
                <Cell>
                  <ButtonIcon
                    icon={<RiDeleteBinLine />}
                    variant="tertiary"
                    onClick={() => onDeleteClick!(category)}
                  />
                </Cell>
              )}
            </Row>
          ))
        )}
      </TableBody>
    </Table>
  );
};
