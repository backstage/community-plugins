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
import { useState, useMemo } from 'react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import {
  announcementsApiRef,
  CreateAnnouncementRequest,
  useAnnouncementsTranslation,
  useCategories,
} from '@backstage-community/plugin-announcements-react';
import {
  Announcement,
  Category,
} from '@backstage-community/plugin-announcements-common';
import slugify from 'slugify';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Dialog,
  DialogHeader,
  DialogBody,
  Header,
} from '@backstage/ui';
import { RiAddLine, RiBook2Line } from '@remixicon/react';

import { AnnouncementForm } from '../announcements/AnnouncementForm';
import { AnnouncementsTable } from '../announcements/AnnouncementsTable';
import { useAnnouncementsPermissions } from '../shared';
import { AnnouncementDetailDialog } from '../../AnnouncementsPage/AnnouncementDetailDialog';

type AnnouncementsSectionProps = {
  announcements: Announcement[];
  searchText: string;
  defaultInactive?: boolean;
  onRefresh: () => void;
};

export const AnnouncementsSection = (props: AnnouncementsSectionProps) => {
  const { announcements, searchText, defaultInactive, onRefresh } = props;

  const alertApi = useApi(alertApiRef);
  const announcementsApi = useApi(announcementsApiRef);
  const { categories } = useCategories();
  const { t } = useAnnouncementsTranslation();
  const permissions = useAnnouncementsPermissions();

  const [showCreateAnnouncementForm, setShowCreateAnnouncementForm] =
    useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<
    string | null
  >(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  const onCreateAnnouncementClick = () => {
    setShowCreateAnnouncementForm(true);
    setEditingAnnouncementId(null);
  };

  const onPreview = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsPreviewDialogOpen(true);
  };

  const handleClosePreviewDialog = () => {
    setIsPreviewDialogOpen(false);
    setSelectedAnnouncement(null);
  };

  const onEdit = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement.id);
    setShowCreateAnnouncementForm(false);
  };

  const handleCloseEditDialog = () => {
    setEditingAnnouncementId(null);
  };

  const onAnnouncementSubmit = async (request: CreateAnnouncementRequest) => {
    const { category } = request;

    const slugs = categories.map((c: Category) => c.slug);
    let alertMsg = t('admin.announcementsContent.alertMessage') as string;

    try {
      if (category) {
        const categorySlug = slugify(category, {
          lower: true,
        });
        if (slugs.indexOf(categorySlug) === -1) {
          alertMsg = alertMsg.replace('.', '');
          alertMsg = `${alertMsg} ${t(
            'admin.announcementsContent.alertMessageWithNewCategory',
          )} ${category}.`;

          await announcementsApi.createCategory({
            title: category,
          });
        }
      }

      await announcementsApi.createAnnouncement({
        ...request,
        category: request.category?.toLocaleLowerCase('en-US'),
      });
      alertApi.post({ message: alertMsg, severity: 'success' });

      setShowCreateAnnouncementForm(false);
      onRefresh();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const onUpdate = async (request: CreateAnnouncementRequest) => {
    if (!editingAnnouncementId) {
      return;
    }

    const { category } = request;

    const slugs = categories.map((c: Category) => c.slug);
    let updateMsg = t('admin.announcementsContent.alertMessage') as string;

    try {
      if (category) {
        const categorySlug = slugify(category, {
          lower: true,
        });
        if (slugs.indexOf(categorySlug) === -1) {
          updateMsg = updateMsg.replace('.', '');
          updateMsg = `${updateMsg} ${t(
            'admin.announcementsContent.alertMessageWithNewCategory',
          )} ${category}.`;

          await announcementsApi.createCategory({
            title: category,
          });
        }
      }

      await announcementsApi.updateAnnouncement(editingAnnouncementId, request);
      alertApi.post({ message: updateMsg, severity: 'success' });

      setEditingAnnouncementId(null);
      onRefresh();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const announcementToEdit = useMemo(() => {
    if (!editingAnnouncementId || !announcements) {
      return null;
    }
    return announcements.find(a => a.id === editingAnnouncementId) ?? null;
  }, [editingAnnouncementId, announcements]);

  return (
    <>
      <Card>
        <CardHeader>
          <Header
            title="Announcements"
            icon={<RiBook2Line />}
            // customActions={
            //   <Button
            //     onClick={onCreateAnnouncementClick}
            //     iconEnd={<RiAddLine />}
            //     isDisabled={
            //       permissions.create.loading || !permissions.create.allowed
            //     }
            //     variant="primary"
            //   >
            //     Create announcement
            //   </Button>
            // }
          />
        </CardHeader>
        <CardBody>
          <AnnouncementsTable
            announcements={announcements}
            searchText={searchText}
            onPreview={onPreview}
            onEdit={onEdit}
          />
        </CardBody>
      </Card>

      <Dialog
        isOpen={showCreateAnnouncementForm}
        onOpenChange={setShowCreateAnnouncementForm}
        width="90%"
        style={{ maxWidth: '800px' }}
      >
        <DialogHeader>{t('announcementForm.newAnnouncement')}</DialogHeader>
        <DialogBody>
          <AnnouncementForm
            initialData={{ active: !defaultInactive } as Announcement}
            onSubmit={onAnnouncementSubmit}
          />
        </DialogBody>
      </Dialog>

      {editingAnnouncementId && announcementToEdit && (
        <Dialog
          isOpen={!!editingAnnouncementId}
          onOpenChange={open => !open && handleCloseEditDialog()}
          width="90%"
          style={{ maxWidth: '800px' }}
        >
          <DialogHeader>{t('announcementForm.editAnnouncement')}</DialogHeader>
          <DialogBody>
            <AnnouncementForm
              initialData={announcementToEdit}
              onSubmit={onUpdate}
            />
          </DialogBody>
        </Dialog>
      )}

      <AnnouncementDetailDialog
        announcement={selectedAnnouncement}
        isOpen={isPreviewDialogOpen}
        onClose={handleClosePreviewDialog}
      />
    </>
  );
};
