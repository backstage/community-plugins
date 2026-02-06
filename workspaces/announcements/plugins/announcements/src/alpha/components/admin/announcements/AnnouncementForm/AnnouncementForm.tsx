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
import { useState, type FormEvent } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { DateTime } from 'luxon';
import slugify from 'slugify';
import {
  identityApiRef,
  useApi,
  alertApiRef,
} from '@backstage/core-plugin-api';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  Text,
  TextField,
  Switch,
} from '@backstage/ui';
import { RiSave2Line, RiAddLine } from '@remixicon/react';
import {
  CreateAnnouncementRequest,
  CreateCategoryRequest,
  CreateTagRequest,
  useAnnouncementsTranslation,
  announcementsApiRef,
  useCategories,
  useTags,
} from '@backstage-community/plugin-announcements-react';
import {
  Announcement,
  Category,
  Tag,
} from '@backstage-community/plugin-announcements-common';

import { CategorySelectInput, TagsSelectInput } from '../../../shared';
import { CreateCategoryDialog } from '../../categories';
import { CreateTagDialog } from '../../tags';
import OnBehalfTeamDropdown from './OnBehalfTeamDropdown';
import EntityDropdown from './EntityDropdown';

import MuiTextField from '@mui/material/TextField';

type AnnouncementFormProps = {
  initialData: Announcement;
  onSubmit: (data: CreateAnnouncementRequest) => Promise<void>;
};

export const AnnouncementForm = ({
  initialData,
  onSubmit,
}: AnnouncementFormProps) => {
  const identityApi = useApi(identityApiRef);
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const { t } = useAnnouncementsTranslation();
  const {
    categories,
    loading: categoriesLoading,
    retry: refreshCategories,
  } = useCategories();
  const { tags, loading: tagsLoading, retry: refreshTags } = useTags();

  const formattedStartAt = initialData.start_at
    ? DateTime.fromISO(initialData.start_at).toISODate()
    : DateTime.now().toISODate();

  const formattedUntilDate = initialData.until_date
    ? DateTime.fromISO(initialData.until_date).toISODate()
    : DateTime.now().endOf('day').plus({ days: 7 }).toISODate();

  const [form, setForm] = useState({
    ...initialData,
    active: initialData.active ?? true,
    category: initialData.category ?? null,
    start_at: formattedStartAt || '',
    until_date: formattedUntilDate || '',
    tags: initialData.tags ?? null,
    sendNotification: initialData.sendNotification ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [onBehalfOfSelectedTeam, setOnBehalfOfSelectedTeam] = useState(
    initialData.on_behalf_of || '',
  );
  const [selectedEntity, setSelectedEntity] = useState(
    initialData.entity_refs?.[0] || '',
  );
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] =
    useState(false);
  const [showCreateTagDialog, setShowCreateTagDialog] = useState(false);

  const handleCreateCategory = async (request: CreateCategoryRequest) => {
    const slugifiedTitle = slugify(request.title.trim(), { lower: true });
    const existingCategory = categories.find(
      cat => cat.slug === slugifiedTitle,
    );

    if (existingCategory) {
      alertApi.post({
        message: t('categoriesForm.errors.alreadyExists'),
        severity: 'warning',
      });

      // Select the existing category in the form
      setForm(prevForm => ({
        ...prevForm,
        category: existingCategory,
      }));

      setShowCreateCategoryDialog(false);
    } else {
      try {
        await announcementsApi.createCategory(request);

        alertApi.post({
          message: t('newCategoryDialog.createdMessage'),
          severity: 'success',
        });

        setShowCreateCategoryDialog(false);
        refreshCategories();

        // Select the new category in the form
        setForm(prevForm => ({
          ...prevForm,
          category: {
            title: request.title,
            slug: slugifiedTitle,
          },
        }));
      } catch (err) {
        alertApi.post({ message: (err as Error).message, severity: 'error' });
      }
    }
  };

  const handleCreateTag = async (request: CreateTagRequest) => {
    const slugifiedTitle = slugify(request.title.trim(), { lower: true });
    const existingTag = tags?.find(tag => tag.slug === slugifiedTitle);

    if (existingTag) {
      alertApi.post({
        message: t('tagsForm.errors.alreadyExists'),
        severity: 'warning',
      });

      setForm(prevForm => ({
        ...prevForm,
        tags: [...(prevForm.tags ?? []), existingTag],
      }));

      setShowCreateTagDialog(false);
    } else {
      try {
        await announcementsApi.createTag(request);

        alertApi.post({
          message: t('newTagDialog.createdMessage'),
          severity: 'success',
        });

        setShowCreateTagDialog(false);
        refreshTags();

        const newTag = { title: request.title, slug: slugifiedTitle };

        setForm(prevForm => ({
          ...prevForm,
          tags: [...(prevForm.tags ?? []), newTag],
        }));
      } catch (err) {
        alertApi.post({ message: (err as Error).message, severity: 'error' });
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    const userIdentity = await identityApi.getBackstageIdentity();

    const {
      id,
      created_at,
      category,
      tags: formTags,
      ...announcementData
    } = form;

    const createRequest: CreateAnnouncementRequest = {
      ...announcementData,
      category: category?.slug,
      tags: formTags?.map(tag => tag.slug),
      publisher: userIdentity.userEntityRef,
      on_behalf_of: onBehalfOfSelectedTeam,
      entity_refs: selectedEntity ? [selectedEntity] : undefined,
    };

    try {
      await onSubmit(createRequest);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Text variant="title-small">
          {initialData.title
            ? t('announcementForm.editAnnouncement')
            : t('announcementForm.newAnnouncement')}
        </Text>
      </CardHeader>

      <CardBody>
        <Box p="3">
          <form onSubmit={handleSubmit}>
            <Grid.Root columns="12">
              <Grid.Item colSpan="12">
                <TextField
                  label={t('announcementForm.title')}
                  value={form.title}
                  onChange={title => setForm({ ...form, title })}
                  isRequired
                />
              </Grid.Item>

              <Grid.Item colSpan="12">
                <TextField
                  label={t('announcementForm.excerpt')}
                  value={form.excerpt}
                  onChange={excerpt => setForm({ ...form, excerpt })}
                  isRequired
                />
              </Grid.Item>

              <Grid.Item colSpan="12">
                <MDEditor
                  value={form.body}
                  style={{ minHeight: '30rem' }}
                  onChange={value =>
                    setForm({ ...form, ...{ body: value || '' } })
                  }
                />
              </Grid.Item>

              <Grid.Item colSpan={{ xs: '12', md: '4' }}>
                <Flex gap="2" align="end">
                  <Box style={{ flex: 1 }}>
                    <CategorySelectInput
                      initialCategory={form.category ?? undefined}
                      categories={categories}
                      isLoading={categoriesLoading}
                      setCategory={(category: Category | null) =>
                        setForm(prev => ({ ...prev, category }))
                      }
                    />
                  </Box>

                  <Button
                    data-testid="create-category-icon-button"
                    variant="secondary"
                    size="small"
                    iconStart={<RiAddLine />}
                    onClick={() => setShowCreateCategoryDialog(true)}
                    aria-label={t('admin.categoriesContent.createButton')}
                  />
                </Flex>
              </Grid.Item>

              <Grid.Item colSpan={{ xs: '12', md: '4' }}>
                <OnBehalfTeamDropdown
                  selectedTeam={onBehalfOfSelectedTeam}
                  onChange={setOnBehalfOfSelectedTeam}
                />
              </Grid.Item>

              <Grid.Item colSpan={{ xs: '12', md: '4' }}>
                <EntityDropdown
                  selectedEntity={selectedEntity}
                  onChange={setSelectedEntity}
                />
              </Grid.Item>

              <Grid.Item colSpan={{ xs: '12', md: '4' }}>
                <Flex gap="2" align="end">
                  <Box style={{ flex: 1 }}>
                    <TagsSelectInput
                      initialTags={form.tags ?? undefined}
                      tags={tags}
                      isLoading={tagsLoading}
                      setTags={(selectedTags: Tag[] | null) =>
                        setForm(prev => ({ ...prev, tags: selectedTags }))
                      }
                    />
                  </Box>

                  <Button
                    data-testid="create-tag-icon-button"
                    variant="secondary"
                    size="small"
                    iconStart={<RiAddLine />}
                    onClick={() => setShowCreateTagDialog(true)}
                    aria-label={t('admin.tagsContent.createButton')}
                  />
                </Flex>
              </Grid.Item>

              <Grid.Item colSpan={{ xs: '12', md: '4' }}>
                <MuiTextField
                  variant="outlined"
                  label={t('announcementForm.startAt')}
                  id="start-at-date"
                  type="date"
                  value={form.start_at}
                  InputLabelProps={{ shrink: true }}
                  required
                  fullWidth
                  onChange={e =>
                    setForm({
                      ...form,
                      start_at: e.target.value,
                    })
                  }
                />
              </Grid.Item>

              <Grid.Item colSpan={{ xs: '12', md: '4' }}>
                <MuiTextField
                  variant="outlined"
                  label={t('announcementForm.untilDate')}
                  id="until-date"
                  type="date"
                  value={form.until_date}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  onChange={e =>
                    setForm({
                      ...form,
                      until_date: e.target.value,
                    })
                  }
                  inputProps={{
                    min: DateTime.fromISO(form.start_at)
                      .endOf('day')
                      .plus({ days: 1 })
                      .toISODate(),
                  }}
                />
              </Grid.Item>

              <Grid.Item colSpan="12">
                <Flex justify="end">
                  <Switch
                    name="active"
                    label={t('announcementForm.active')}
                    isSelected={form.active}
                    onChange={isSelected =>
                      setForm({ ...form, active: isSelected })
                    }
                  />
                  <Switch
                    name="sendNotification"
                    label={t('announcementForm.sendNotification')}
                    isSelected={form.sendNotification}
                    onChange={isSelected =>
                      setForm({ ...form, sendNotification: isSelected })
                    }
                  />
                  <Button
                    type="submit"
                    isDisabled={loading || !form.body}
                    iconStart={<RiSave2Line />}
                  >
                    {t('announcementForm.submit')}
                  </Button>
                </Flex>
              </Grid.Item>
            </Grid.Root>
          </form>
        </Box>
      </CardBody>

      <CreateCategoryDialog
        open={showCreateCategoryDialog}
        onConfirm={handleCreateCategory}
        onCancel={() => setShowCreateCategoryDialog(false)}
      />

      <CreateTagDialog
        open={showCreateTagDialog}
        onConfirm={handleCreateTag}
        onCancel={() => setShowCreateTagDialog(false)}
      />
    </Card>
  );
};
