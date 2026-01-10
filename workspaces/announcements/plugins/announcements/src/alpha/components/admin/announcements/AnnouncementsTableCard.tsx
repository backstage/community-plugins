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
import { useState, useMemo } from 'react';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import {
  TablePagination,
  Card,
  CardBody,
  CardFooter,
  Flex,
  Text,
} from '@backstage/ui';
import { RiCircleFill } from '@remixicon/react';

import { AnnouncementsTable } from './AnnouncementsTable';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';

/**
 * @internal
 */
type AnnouncementsTableCardProps = {
  announcements: Announcement[];
  onPreviewClick: (announcement: Announcement) => void;
  onEditClick: (announcement: Announcement) => void;
  onDeleteClick: (announcement: Announcement) => void;
  canEdit: boolean;
  canDelete: boolean;
  editingAnnouncementId?: string | null;
};

const ActiveInactiveIndicator = () => {
  const { t } = useAnnouncementsTranslation();

  return (
    <Flex justify="end" gap="6" mb="3">
      <Flex align="center" gap="1">
        <RiCircleFill
          size="12"
          color="#4caf50"
          aria-label={t('admin.announcementsContent.table.active')}
        />
        <Text variant="body-small">
          {t('admin.announcementsContent.table.active')}
        </Text>
      </Flex>
      <Flex align="center" gap="1">
        <RiCircleFill
          size="12"
          color="#f44336"
          aria-label={t('admin.announcementsContent.table.inactive')}
        />
        <Text variant="body-small">
          {t('admin.announcementsContent.table.inactive')}
        </Text>
      </Flex>
    </Flex>
  );
};

/**
 * @internal
 */
export const AnnouncementsTableCard = (props: AnnouncementsTableCardProps) => {
  const {
    announcements,
    onPreviewClick,
    onEditClick,
    onDeleteClick,
    canEdit,
    canDelete,
    editingAnnouncementId,
  } = props;

  const [pageSize, setPageSize] = useState(10);
  const [offset, setOffset] = useState(0);

  const paginatedAnnouncements = useMemo(() => {
    const start = offset;
    const end = offset + pageSize;
    return announcements.slice(start, end);
  }, [announcements, offset, pageSize]);

  return (
    <Card>
      <CardBody>
        <ActiveInactiveIndicator />

        <AnnouncementsTable
          data={paginatedAnnouncements}
          onPreviewClick={onPreviewClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          canEdit={canEdit}
          canDelete={canDelete}
          editingAnnouncementId={editingAnnouncementId}
        />
      </CardBody>

      {announcements.length > 0 && (
        <CardFooter>
          <TablePagination
            offset={offset}
            pageSize={pageSize}
            setOffset={setOffset}
            setPageSize={setPageSize}
            rowCount={announcements.length}
          />
        </CardFooter>
      )}
    </Card>
  );
};
