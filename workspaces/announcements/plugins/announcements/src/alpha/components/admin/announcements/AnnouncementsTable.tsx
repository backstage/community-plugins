/*
 * Copyright 2026 The Backstage Authors
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
import { DateTime } from 'luxon';
import { Announcement } from '@backstage-community/plugin-announcements-common';
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
  Flex,
} from '@backstage/ui';
import { RiEyeLine, RiEditLine, RiDeleteBinLine } from '@remixicon/react';

const AnnouncementsTableEmptyState = () => {
  const { t } = useAnnouncementsTranslation();

  return (
    <Row>
      <CellText
        colSpan={11}
        title={t('admin.announcementsContent.noAnnouncementsFound')}
      />
    </Row>
  );
};

type AnnouncementTableRowProps = {
  announcement: Announcement;
  onPreviewClick?: (announcement: Announcement) => void;
  onEditClick?: (announcement: Announcement) => void;
  onDeleteClick?: (announcement: Announcement) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  editingAnnouncementId?: string | null;
};

const AnnouncementTableRow = (props: AnnouncementTableRowProps) => {
  const {
    announcement,
    onPreviewClick,
    onEditClick,
    onDeleteClick,
    canEdit,
    canDelete,
    editingAnnouncementId,
  } = props;
  const { t } = useAnnouncementsTranslation();

  const isCurrentlyEditing = editingAnnouncementId === announcement.id;
  const isEditDisabled = editingAnnouncementId !== null && !isCurrentlyEditing;

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <Row key={announcement.id}>
      <CellText title={announcement.title} />
      <CellText title={truncateText(announcement.body)} />
      <CellText title={announcement.publisher} />
      <CellText title={announcement.on_behalf_of || '-'} />
      <CellText title={announcement.category?.title ?? '-'} />
      <CellText
        title={announcement.tags?.map(tag => tag.title).join(', ') || '-'}
      />
      <CellText
        title={
          announcement.active
            ? t('admin.announcementsContent.table.active')
            : t('admin.announcementsContent.table.inactive')
        }
      />
      <CellText
        title={DateTime.fromISO(announcement.created_at).toFormat('M/d/yyyy')}
      />
      <CellText
        title={DateTime.fromISO(announcement.start_at).toFormat('M/d/yyyy')}
      />
      <CellText
        title={
          announcement.until_date
            ? DateTime.fromISO(announcement.until_date).toFormat('M/d/yyyy')
            : '-'
        }
      />
      <Cell>
        <Flex gap="small">
          <ButtonIcon
            icon={<RiEyeLine />}
            variant="tertiary"
            onClick={() => onPreviewClick?.(announcement)}
            aria-label="preview"
            data-testid="preview"
          />
          <ButtonIcon
            icon={<RiEditLine />}
            variant="tertiary"
            onClick={() => onEditClick?.(announcement)}
            aria-label="edit"
            data-testid="edit-icon"
            isDisabled={!canEdit || isEditDisabled}
          />
          <ButtonIcon
            icon={<RiDeleteBinLine />}
            variant="tertiary"
            onClick={() => onDeleteClick?.(announcement)}
            aria-label="delete"
            data-testid="delete-icon"
            isDisabled={!canDelete}
          />
        </Flex>
      </Cell>
    </Row>
  );
};

/**
 * @internal
 */
type AnnouncementsTableProps = {
  data: Announcement[];
  onPreviewClick?: (announcement: Announcement) => void;
  onEditClick?: (announcement: Announcement) => void;
  onDeleteClick?: (announcement: Announcement) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  editingAnnouncementId?: string | null;
};

/**
 * @internal
 */
export const AnnouncementsTable = (props: AnnouncementsTableProps) => {
  const {
    data,
    onPreviewClick,
    onEditClick,
    onDeleteClick,
    canEdit,
    canDelete,
    editingAnnouncementId,
  } = props;
  const { t } = useAnnouncementsTranslation();

  return (
    <Table>
      <TableHeader>
        <Column id="title" isRowHeader>
          {t('admin.announcementsContent.table.title')}
        </Column>
        <Column id="body">{t('admin.announcementsContent.table.body')}</Column>
        <Column id="publisher">
          {t('admin.announcementsContent.table.publisher')}
        </Column>
        <Column id="on_behalf_of">
          {t('admin.announcementsContent.table.onBehalfOf')}
        </Column>
        <Column id="category">
          {t('admin.announcementsContent.table.category')}
        </Column>
        <Column id="tags">{t('admin.announcementsContent.table.tags')}</Column>
        <Column id="status">
          {t('admin.announcementsContent.table.status')}
        </Column>
        <Column id="created_at">
          {t('admin.announcementsContent.table.created_at')}
        </Column>
        <Column id="start_at">
          {t('admin.announcementsContent.table.start_at')}
        </Column>
        <Column id="until_date">
          {t('admin.announcementsContent.table.until_date')}
        </Column>
        <Column id="actions">
          {t('admin.announcementsContent.table.actions')}
        </Column>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map(announcement => (
            <AnnouncementTableRow
              key={announcement.id}
              announcement={announcement}
              onPreviewClick={onPreviewClick}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
              canEdit={canEdit}
              canDelete={canDelete}
              editingAnnouncementId={editingAnnouncementId}
            />
          ))
        ) : (
          <AnnouncementsTableEmptyState />
        )}
      </TableBody>
    </Table>
  );
};
