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
import { TablePagination, Card, CardBody, CardFooter } from '@backstage/ui';

import { AnnouncementsTable } from './AnnouncementsTable';

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
