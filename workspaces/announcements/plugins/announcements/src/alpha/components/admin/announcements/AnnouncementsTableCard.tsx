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
import { Announcement } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import {
  Card,
  CardBody,
  CardHeader,
  Text,
  Flex,
  Button,
  Box,
} from '@backstage/ui';

import { AnnouncementsTable } from './AnnouncementsTable';
import { ActiveInactiveAnnouncementIndicator } from './ActiveInactiveAnnouncementIndicator';

/**
 * @internal
 */
type AnnouncementsTableCardProps = {
  announcements: Announcement[];
  onCreateClick: () => void;
  onPreviewClick: (announcement: Announcement) => void;
  onEditClick: (announcement: Announcement) => void;
  onDeleteClick: (announcement: Announcement) => void;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  editingAnnouncementId?: string | null;
};

/**
 * @internal
 */
export const AnnouncementsTableCard = (props: AnnouncementsTableCardProps) => {
  const { t } = useAnnouncementsTranslation();

  const {
    announcements,
    onPreviewClick,
    onCreateClick,
    onEditClick,
    onDeleteClick,
    canEdit,
    canDelete,
    canCreate,
    editingAnnouncementId,
  } = props;

  const title = `${t('admin.announcementsContent.announcements')} (${
    announcements.length
  })`;

  return (
    <Card>
      <CardHeader>
        <Flex justify="between" align="center">
          <Text variant="title-x-small">{title}</Text>
          <Button isDisabled={!canCreate} onClick={onCreateClick}>
            {t('admin.announcementsContent.createButton')}
          </Button>
        </Flex>
      </CardHeader>

      <CardBody>
        <Box m="3">
          <ActiveInactiveAnnouncementIndicator />
        </Box>
        <AnnouncementsTable
          data={announcements}
          onPreviewClick={onPreviewClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          canEdit={canEdit}
          canDelete={canDelete}
          editingAnnouncementId={editingAnnouncementId}
        />
      </CardBody>
    </Card>
  );
};
