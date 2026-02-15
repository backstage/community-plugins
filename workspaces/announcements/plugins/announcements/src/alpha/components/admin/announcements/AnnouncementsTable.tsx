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
  Table,
  useTable,
  type ColumnConfig,
  ButtonIcon,
  Flex,
  Tag,
  TagGroup,
  Text,
} from '@backstage/ui';
import { RiEyeLine, RiEditLine, RiDeleteBinLine } from '@remixicon/react';
import { EntityRefLink } from '@backstage/plugin-catalog-react';

import { ActiveInactiveAnnouncementIndicatorIcon } from './ActiveInactiveAnnouncementIndicator';
import { useEffect } from 'react';

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

const truncateText = (text: string, maxLength: number = 50) => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
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

  const columns: ColumnConfig<Announcement>[] = [
    {
      id: 'title',
      label: t('admin.announcementsContent.table.title'),
      isRowHeader: true,
      cell: announcement => (
        <Cell>
          <Flex>
            <ActiveInactiveAnnouncementIndicatorIcon
              announcement={announcement}
            />
            <Text variant="body-small" title={announcement.title}>
              {announcement.title}
            </Text>
          </Flex>
        </Cell>
      ),
    },
    {
      id: 'body',
      label: t('admin.announcementsContent.table.body'),
      cell: announcement => (
        <Cell>
          <Text variant="body-small">{truncateText(announcement.body)}</Text>
        </Cell>
      ),
    },
    {
      id: 'publisher',
      label: t('admin.announcementsContent.table.publisher'),
      cell: announcement => {
        const hasValidPublisher =
          announcement.publisher && isValidEntityRef(announcement.publisher);
        const hasValidOnBehalfOf =
          announcement.on_behalf_of &&
          isValidEntityRef(announcement.on_behalf_of);

        return hasValidPublisher ? (
          <Cell>
            <EntityRefLink entityRef={parseEntityRef(announcement.publisher)} />{' '}
            {hasValidOnBehalfOf && (
              <Text variant="body-small">
                {t('admin.announcementsContent.table.onBehalfOf').toLowerCase()}{' '}
                <EntityRefLink
                  entityRef={parseEntityRef(announcement.on_behalf_of!)}
                />
              </Text>
            )}
          </Cell>
        ) : (
          <CellText title="-" />
        );
      },
    },
    {
      id: 'category',
      label: t('admin.announcementsContent.table.category'),
      cell: announcement =>
        announcement.category ? (
          <Cell>
            <Text variant="body-small">{announcement.category.title}</Text>
          </Cell>
        ) : (
          <CellText title="-" />
        ),
    },
    {
      id: 'tags',
      label: t('admin.announcementsContent.table.tags'),
      cell: announcement =>
        announcement.tags && announcement.tags.length > 0 ? (
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
          <CellText title="-" />
        ),
    },
    {
      id: 'created_at',
      label: t('admin.announcementsContent.table.created_at'),
      cell: announcement => (
        <CellText
          title={DateTime.fromISO(announcement.created_at).toFormat('M/d/yy')}
        />
      ),
    },
    {
      id: 'start_at',
      label: t('admin.announcementsContent.table.start_at'),
      cell: announcement => (
        <CellText
          title={DateTime.fromISO(announcement.start_at).toFormat('M/d/yy')}
        />
      ),
    },
    {
      id: 'until_date',
      label: t('admin.announcementsContent.table.until_date'),
      cell: announcement => (
        <CellText
          title={
            announcement.until_date
              ? DateTime.fromISO(announcement.until_date).toFormat('M/d/yy')
              : '-'
          }
        />
      ),
    },
    {
      id: 'actions',
      label: t('admin.announcementsContent.table.actions'),
      cell: announcement => {
        const isCurrentlyEditing = editingAnnouncementId === announcement.id;
        const isEditDisabled =
          editingAnnouncementId !== null && !isCurrentlyEditing;

        return (
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
        );
      },
    },
  ];

  const { tableProps, reload } = useTable({
    mode: 'complete',
    getData: () => data,
  });

  useEffect(() => {
    reload();
  }, [data, reload]);

  return (
    <Table
      columnConfig={columns}
      emptyState={
        <Text>{t('admin.announcementsContent.noAnnouncementsFound')}</Text>
      }
      {...tableProps}
    />
  );
};
