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
type TagsTableProps = {
  data: Tag[];
  onDeleteClick?: (tag: Tag) => void;
  showEmptyState?: boolean;
};

/**
 * @internal
 */
export const TagsTable = (props: TagsTableProps) => {
  const { data, onDeleteClick, showEmptyState = false } = props;
  const { t } = useAnnouncementsTranslation();

  const hasActions = onDeleteClick !== undefined;

  return (
    <Table>
      <TableHeader>
        <Column id="title" isRowHeader>
          {t('admin.tagsContent.table.title')}
        </Column>
        <Column id="slug">{t('admin.tagsContent.table.slug')}</Column>
        {hasActions && (
          <Column id="actions">{t('admin.tagsContent.table.actions')}</Column>
        )}
      </TableHeader>
      <TableBody>
        {showEmptyState || data.length === 0 ? (
          <Row>
            <CellText
              colSpan={hasActions ? 3 : 2}
              title={t('admin.tagsContent.table.noTagsFound')}
            />
          </Row>
        ) : (
          data.map(tag => (
            <Row key={tag.slug} id={tag.slug}>
              <CellText title={tag.title} />
              <CellText title={tag.slug} />
              {hasActions && (
                <Cell>
                  <ButtonIcon
                    icon={<RiDeleteBinLine />}
                    variant="tertiary"
                    onClick={() => onDeleteClick!(tag)}
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
