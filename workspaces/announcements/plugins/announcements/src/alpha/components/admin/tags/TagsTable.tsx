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

const TagsTableEmptyState = () => {
  const { t } = useAnnouncementsTranslation();

  return (
    <Row>
      <CellText colSpan={3} title={t('admin.tagsContent.table.noTagsFound')} />
    </Row>
  );
};

type TagTableRowProps = {
  tag: Tag;
  onDeleteClick?: (tag: Tag) => void;
};

const TagTableRow = (props: TagTableRowProps) => {
  const { tag, onDeleteClick } = props;

  return (
    <Row key={tag.slug}>
      <CellText title={tag.title} />
      <CellText title={tag.slug} />
      <Cell>
        <ButtonIcon
          icon={<RiDeleteBinLine />}
          variant="tertiary"
          onClick={() => onDeleteClick!(tag)}
        />
      </Cell>
    </Row>
  );
};

/**
 * @internal
 */
type TagsTableProps = {
  data: Tag[];
  onDeleteClick?: (tag: Tag) => void;
};

/**
 * @internal
 */
export const TagsTable = (props: TagsTableProps) => {
  const { data, onDeleteClick } = props;
  const { t } = useAnnouncementsTranslation();

  return (
    <Table>
      <TableHeader>
        <Column id="title" isRowHeader>
          {t('admin.tagsContent.table.title')}
        </Column>
        <Column id="slug">{t('admin.tagsContent.table.slug')}</Column>
        <Column id="actions">{t('admin.tagsContent.table.actions')}</Column>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map(tag => (
            <TagTableRow
              key={tag.slug}
              tag={tag}
              onDeleteClick={onDeleteClick}
            />
          ))
        ) : (
          <TagsTableEmptyState />
        )}
      </TableBody>
    </Table>
  );
};
