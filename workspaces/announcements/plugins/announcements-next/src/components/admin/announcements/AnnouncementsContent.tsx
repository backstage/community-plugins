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
import { ErrorPanel, Progress } from '@backstage/core-components';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import {
  announcementsApiRef,
  CreateAnnouncementRequest,
  useAnnouncementsTranslation,
  useCategories,
} from '@backstage-community/plugin-announcements-react';
import {
  Announcement,
  announcementCreatePermission,
  Category,
} from '@backstage-community/plugin-announcements-common';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import slugify from 'slugify';
import { RequirePermission } from '@backstage/plugin-permission-react';
import {
  Container,
  Grid,
  Button,
  Text,
  Flex,
  SearchField,
  Dialog,
  DialogHeader,
  DialogBody,
  Card,
} from '@backstage/ui';

import { AnnouncementForm } from './AnnouncementForm';
import { AnnouncementsTable } from './AnnouncementsTable';
import { useAnnouncementsPermissions } from '../shared';
import { AnnouncementDetailDialog } from '../../AnnouncementsPage/AnnouncementDetailDialog';

type AnnouncementsContentProps = {
  defaultInactive?: boolean;
};

export const AnnouncementsContent = (props: AnnouncementsContentProps) => {
  const { defaultInactive } = props;

  const alertApi = useApi(alertApiRef);
  const announcementsApi = useApi(announcementsApiRef);
  const { categories } = useCategories();
  const { t } = useAnnouncementsTranslation();
  const [searchText, setSearchText] = useState('');
  const permissions = useAnnouncementsPermissions();

  const [showCreateAnnouncementForm, setShowCreateAnnouncementForm] =
    useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<
    string | null
  >(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    loading,
    error,
    value: announcements,
    retry,
  } = useAsyncRetry(async () => await announcementsApi.announcements({}));

  const onCreateButtonClick = () => {
    setShowCreateAnnouncementForm(true);
    setEditingAnnouncementId(null);
  };

  const onEdit = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement.id);
    setShowCreateAnnouncementForm(false);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateAnnouncementForm(false);
  };

  const handleCloseEditDialog = () => {
    setEditingAnnouncementId(null);
  };

  const onPreview = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAnnouncement(null);
  };

  const onSubmit = async (request: CreateAnnouncementRequest) => {
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
      retry();
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
      retry();
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const announcementToEdit = useMemo(() => {
    if (!editingAnnouncementId || !announcements?.results) {
      return null;
    }
    return (
      announcements.results.find(a => a.id === editingAnnouncementId) ?? null
    );
  }, [editingAnnouncementId, announcements?.results]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ErrorPanel error={error} />;
  }

  return (
    <RequirePermission permission={announcementCreatePermission}>
      <Container>
        <Grid.Root columns="12">
          {/* <Grid.Item colSpan="12">
            <Button
              isDisabled={
                permissions.create.loading || !permissions.create.allowed
              }
              variant="primary"
              size="small"
              onClick={() => onCreateButtonClick()}
            >
              {t('admin.announcementsContent.createButton')}
            </Button>
          </Grid.Item> */}

          <Grid.Item colSpan="12">
            <Flex direction="row">
              <Button
                isDisabled={
                  permissions.create.loading || !permissions.create.allowed
                }
                variant="primary"
                onClick={() => onCreateButtonClick()}
              >
                {t('admin.announcementsContent.createButton')}
              </Button>
              <SearchField
                // todo: add translation
                placeholder="Search announcements..."
                value={searchText}
                onChange={setSearchText}
              />
            </Flex>
          </Grid.Item>

          <Grid.Item colSpan="12">
            <Card>
              <AnnouncementsTable
                announcements={announcements?.results ?? []}
                searchText={searchText}
                onPreview={onPreview}
                onEdit={onEdit}
              />
            </Card>
          </Grid.Item>
        </Grid.Root>

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
              onSubmit={onSubmit}
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
            <DialogHeader>
              {t('announcementForm.editAnnouncement')}
            </DialogHeader>
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
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
        />
      </Container>
    </RequirePermission>
  );
};
