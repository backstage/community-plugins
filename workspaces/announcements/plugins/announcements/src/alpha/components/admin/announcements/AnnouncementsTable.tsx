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
import { parseEntityRef } from '@backstage/catalog-model';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import {
  Cell,
  CellText,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  ButtonIcon,
  Flex,
  Tag,
  TagGroup,
  Text,
} from '@backstage/ui';
import { RiEyeLine, RiEditLine, RiDeleteBinLine } from '@remixicon/react';
import { EntityRefLink } from '@backstage/plugin-catalog-react';

import { ActiveInactiveAnnouncementIndicatorIcon } from './ActiveInactiveAnnouncementIndicator';

const AnnouncementsTableEmptyState = () => {
  const { t } = useAnnouncementsTranslation();

  return (
    <Row>
      <CellText
        colSpan={9}
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

const EmptyPlaceholder = () => {
  return <CellText title="-" />;
};

const isValidEntityRef = (entityRef: string): boolean => {
  if (!entityRef) {
    return false;
  }
  try {
    parseEntityRef(entityRef);
    return true;
  } catch {
    return false;
  }
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
  const isCurrentlyEditing = editingAnnouncementId === announcement.id;
  const isEditDisabled = editingAnnouncementId !== null && !isCurrentlyEditing;

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const hasValidPublisher =
    announcement.publisher && isValidEntityRef(announcement.publisher);

  return (
    <Row key={announcement.id}>
      <Cell>
        <Flex gap="3" align="center">
          <ActiveInactiveAnnouncementIndicatorIcon
            announcement={announcement}
          />
          <Text variant="body-small" title={announcement.title}>
            {announcement.title}
          </Text>
        </Flex>
      </Cell>
      <Cell>
        <Text variant="body-small">{truncateText(announcement.body)}</Text>
      </Cell>

      {hasValidPublisher ? (
        <Cell>
          <EntityRefLink entityRef={parseEntityRef(announcement.publisher)} />
        </Cell>
      ) : (
        <EmptyPlaceholder />
      )}

      {announcement.category ? (
        <Cell>
          <Text variant="body-small">{announcement.category.title}</Text>
        </Cell>
      ) : (
        <EmptyPlaceholder />
      )}
      {announcement.tags && announcement.tags.length > 0 ? (
        <Cell>
          <TagGroup>
            {announcement.tags.map(tag => (
              <Tag key={tag.slug} size="small">
                {tag.title}
              </Tag>
            ))}
          </TagGroup>
        </Cell>
      ) : (
        <EmptyPlaceholder />
      )}

      <CellText
        title={DateTime.fromISO(announcement.created_at).toFormat('M/d/yy')}
      />
      <CellText
        title={DateTime.fromISO(announcement.start_at).toFormat('M/d/yy')}
      />
      <CellText
        title={
          announcement.until_date
            ? DateTime.fromISO(announcement.until_date).toFormat('M/d/yy')
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
        <Column isRowHeader>
          {t('admin.announcementsContent.table.title')}
        </Column>
        <Column>{t('admin.announcementsContent.table.body')}</Column>
        <Column>{t('admin.announcementsContent.table.publisher')}</Column>
        <Column>{t('admin.announcementsContent.table.category')}</Column>
        <Column>{t('admin.announcementsContent.table.tags')}</Column>
        <Column>{t('admin.announcementsContent.table.created_at')}</Column>
        <Column>{t('admin.announcementsContent.table.start_at')}</Column>
        <Column>{t('admin.announcementsContent.table.until_date')}</Column>
        <Column>{t('admin.announcementsContent.table.actions')}</Column>
      </TableHeader>
      <TableBody>
        {data?.length > 0 ? (
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
