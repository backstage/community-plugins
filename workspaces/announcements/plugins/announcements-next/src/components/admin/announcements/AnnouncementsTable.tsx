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
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import {
  announcementsApiRef,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import {
  Text,
  Box,
  ButtonIcon,
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  TablePagination,
  useTable,
  CellText,
  Cell,
  Switch,
  Flex,
  TagGroup,
  Tag,
} from '@backstage/ui';
import type { SortDescriptor } from 'react-aria-components';

// todo: figure out how we are supposed to migrate to bui icons
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import PreviewIcon from '@material-ui/icons/Visibility';

import {
  DeleteConfirmationDialog,
  useDeleteConfirmationDialogState,
  useAnnouncementsPermissions,
} from '../shared';

import { parseEntityRef } from '@backstage/catalog-model';
import { RiCheckboxCircleLine, RiCloseCircleLine } from '@remixicon/react';

type AnnouncementsTableProps = {
  announcements: Announcement[];
  searchText: string;
  onPreview: (announcement: Announcement) => void;
  onEdit: (announcement: Announcement) => void;
};

export const AnnouncementsTable = (props: AnnouncementsTableProps) => {
  const { announcements, searchText, onPreview, onEdit } = props;

  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const { t } = useAnnouncementsTranslation();

  const [sortDescriptor, setSortDescriptor] = useState<
    SortDescriptor | undefined
  >(undefined);

  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog,
    item: announcementToDelete,
  } = useDeleteConfirmationDialogState<Announcement>();

  const permissions = useAnnouncementsPermissions();

  const onCancelDelete = () => {
    closeDeleteDialog();
  };

  const onConfirmDelete = async () => {
    closeDeleteDialog();

    try {
      await announcementsApi.deleteAnnouncementByID(announcementToDelete!.id);

      alertApi.post({ message: 'Announcement deleted.', severity: 'success' });
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }

    // retry();
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data = announcements ?? [];

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      data = data.filter(announcement => {
        const searchableFields = [
          announcement.title,
          announcement.body,
          announcement.publisher,
          announcement.on_behalf_of,
          announcement.category?.title,
          announcement.tags?.map(tag => tag.title).join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableFields.includes(searchLower);
      });
    }

    // Apply sorting
    if (sortDescriptor?.column) {
      data = [...data].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortDescriptor.column) {
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'body':
            aValue = a.body;
            bValue = b.body;
            break;
          case 'publisher':
            aValue = a.publisher;
            bValue = b.publisher;
            break;
          case 'on_behalf_of':
            aValue = a.on_behalf_of;
            bValue = b.on_behalf_of;
            break;
          case 'category':
            aValue = a.category?.title ?? '';
            bValue = b.category?.title ?? '';
            break;
          case 'tags':
            aValue = a.tags?.map(tag => tag.title).join(', ') || '';
            bValue = b.tags?.map(tag => tag.title).join(', ') || '';
            break;
          case 'active':
            aValue = a.active ? 1 : 0;
            bValue = b.active ? 1 : 0;
            break;
          case 'created_at':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          case 'start_at':
            aValue = new Date(a.start_at).getTime();
            bValue = new Date(b.start_at).getTime();
            break;
          case 'until_date':
            aValue = a.until_date
              ? new Date(a.until_date).getTime()
              : Number.MAX_SAFE_INTEGER;
            bValue = b.until_date
              ? new Date(b.until_date).getTime()
              : Number.MAX_SAFE_INTEGER;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortDescriptor.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDescriptor.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [announcements, searchText, sortDescriptor]);

  const { data: paginatedData, paginationProps } = useTable<Announcement>({
    data: filteredAndSortedData,
    pagination: {
      defaultPageSize: 5,
      showPageSizeOptions: true,
    },
  });

  return (
    <>
      <Table
        onSortChange={setSortDescriptor}
        sortDescriptor={sortDescriptor}
        aria-label={t('admin.announcementsContent.announcements')}
      >
        <TableHeader>
          <Column isRowHeader>
            {t('admin.announcementsContent.table.title')}
          </Column>
          <Column>{t('admin.announcementsContent.table.body')}</Column>
          <Column>{t('admin.announcementsContent.table.publisher')}</Column>
          <Column>{t('admin.announcementsContent.table.onBehalfOf')}</Column>
          <Column>{t('admin.announcementsContent.table.category')}</Column>
          <Column>{t('admin.announcementsContent.table.tags')}</Column>
          <Column>{t('admin.announcementsContent.table.status')}</Column>
          <Column>{t('admin.announcementsContent.table.actions')}</Column>
        </TableHeader>

        <TableBody
          renderEmptyState={() => (
            <Box p="4">
              <Text>
                {t('admin.announcementsContent.noAnnouncementsFound')}
              </Text>
            </Box>
          )}
        >
          {paginatedData?.map(announcement => (
            <Row key={announcement.id} id={announcement.id}>
              <CellText title={announcement.title} />
              <CellText title={announcement.body} />
              <CellText
                title={parseEntityRef(announcement.publisher).name ?? '---'}
              />
              <Cell>{announcement.on_behalf_of ?? '---'}</Cell>
              <Cell>{announcement.category?.title ?? '---'}</Cell>
              <Cell>
                <TagGroup>
                  {announcement.tags?.map(tag => (
                    <Tag key={tag.slug} size="small">
                      {tag.title}
                    </Tag>
                  ))}
                </TagGroup>
              </Cell>
              <Cell>
                <Box pl="2">
                  {announcement.active ? (
                    <RiCheckboxCircleLine style={{ color: 'green' }} />
                  ) : (
                    <RiCloseCircleLine style={{ color: 'red' }} />
                  )}
                </Box>
              </Cell>
              {/* todo: actions not working - cell requires title which overrides children */}
              <Cell textValue={t('admin.announcementsContent.table.actions')}>
                <ButtonIcon
                  aria-label="preview"
                  icon={<PreviewIcon data-testid="preview" />}
                  // size="small"
                  variant="tertiary"
                  onClick={() => onPreview(announcement)}
                />
                <ButtonIcon
                  aria-label="edit"
                  icon={<EditIcon data-testid="edit-icon" />}
                  // size="small"
                  variant="tertiary"
                  isDisabled={
                    permissions.update.loading || !permissions.update.allowed
                  }
                  onClick={() => onEdit(announcement)}
                />
                <ButtonIcon
                  aria-label="delete"
                  icon={
                    <DeleteIcon
                      color="error"
                      // fontSize="small"
                      data-testid="delete-icon"
                    />
                  }
                  // size="small"
                  variant="tertiary"
                  isDisabled={
                    permissions.delete.loading || !permissions.delete.allowed
                  }
                  onClick={() => openDeleteDialog(announcement)}
                />
              </Cell>
            </Row>
          ))}
        </TableBody>
      </Table>

      {filteredAndSortedData.length > 0 && (
        <Box px="2">
          <TablePagination {...paginationProps} />
        </Box>
      )}

      <DeleteConfirmationDialog
        type="announcement"
        open={isDeleteDialogOpen}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};
