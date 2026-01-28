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
import { useState, type ChangeEvent, type FormEvent } from 'react';
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
} from '@backstage/ui';
import { RiSave2Line, RiAddLine } from '@remixicon/react';
import {
  CreateAnnouncementRequest,
  CreateCategoryRequest,
  useAnnouncementsTranslation,
  announcementsApiRef,
  useCategories,
} from '@backstage-community/plugin-announcements-react';
import {
  Announcement,
  Category,
} from '@backstage-community/plugin-announcements-common';

import { CategorySelectInput } from '../../../shared';
import { CreateCatagoryDialog } from '../../categories';
import OnBehalfTeamDropdown from './OnBehalfTeamDropdown';
import TagsInput from './TagsInput';

import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

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
    tags: initialData.tags?.map(tag => tag.slug) || undefined,
    sendNotification: initialData.sendNotification ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [onBehalfOfSelectedTeam, setOnBehalfOfSelectedTeam] = useState(
    initialData.on_behalf_of || '',
  );
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] =
    useState(false);
  const [categoryRefreshKey, setCategoryRefreshKey] = useState(0);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.id]: event.target.value,
    });
  };

  const handleChangeActive = (event: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.checked,
    });
  };

  const handleCreateCategory = async (request: CreateCategoryRequest) => {
    const slugifiedTitle = slugify(request.title.trim(), { lower: true });
    const existingCategory = categories.find(
      cat => cat.slug === slugifiedTitle,
    );

    if (existingCategory) {
      setForm({ ...form, category: existingCategory });
      return;
    }

    try {
      await announcementsApi.createCategory(request);

      refreshCategories();
      setCategoryRefreshKey(prev => prev + 1);

      const updatedCategories = await announcementsApi.categories();
      const newCategory = updatedCategories.find(
        cat => cat.title.toLowerCase() === request.title.toLowerCase(),
      );

      if (newCategory) {
        setForm({ ...form, category: newCategory });
      }

      alertApi.post({
        message: t('newCategoryDialog.createdMessage'),
        severity: 'success',
      });

      setShowCreateCategoryDialog(false);
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    const userIdentity = await identityApi.getBackstageIdentity();

    if (form.tags && form.tags.length > 0) {
      const existingTags = await announcementsApi.tags();

      const processedTags = [];

      for (const tagValue of form.tags) {
        const slugifiedTag = slugify(tagValue.trim(), { lower: true });

        if (existingTags.some(tag => tag.slug === slugifiedTag)) {
          processedTags.push(slugifiedTag);
        } else {
          try {
            await announcementsApi.createTag({ title: tagValue });
            processedTags.push(slugifiedTag);
          } catch (error) {
            if (error.status === 409) {
              processedTags.push(slugifiedTag);
            } else {
              throw error;
            }
          }
        }
      }

      form.tags = processedTags;
    }

    const { id, created_at, category, ...announcementData } = form;

    const createRequest: CreateAnnouncementRequest = {
      ...announcementData,
      category: category?.slug,
      publisher: userIdentity.userEntityRef,
      on_behalf_of: onBehalfOfSelectedTeam,
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
                  id="title"
                  label={t('announcementForm.title')}
                  value={form.title}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid.Item>

              <Grid.Item colSpan="12">
                <TextField
                  id="excerpt"
                  label={t('announcementForm.excerpt')}
                  value={form.excerpt}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                  multiline
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
                      key={`category-select-${categoryRefreshKey}`}
                      initialCategory={form.category ?? undefined}
                      categories={categories}
                      isLoading={categoriesLoading}
                      setCategory={(category: Category | null) =>
                        setForm({ ...form, category })
                      }
                    />
                  </Box>

                  <Button
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
                <TagsInput setForm={setForm} form={form} />
              </Grid.Item>

              <Grid.Item colSpan={{ xs: '12', md: '4' }}>
                <TextField
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
                <TextField
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
                <FormGroup row style={{ justifyContent: 'flex-end' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="active"
                        checked={form.active}
                        onChange={handleChangeActive}
                        color="primary"
                      />
                    }
                    label={t('announcementForm.active')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        name="sendNotification"
                        checked={form.sendNotification}
                        onChange={handleChangeActive}
                        color="primary"
                      />
                    }
                    label="Send Notification"
                  />
                  <Button
                    type="submit"
                    size="medium"
                    isDisabled={loading || !form.body}
                    iconStart={<RiSave2Line />}
                  >
                    {t('announcementForm.submit')}
                  </Button>
                </FormGroup>
              </Grid.Item>
            </Grid.Root>
          </form>
        </Box>
      </CardBody>

      <CreateCatagoryDialog
        open={showCreateCategoryDialog}
        onConfirm={handleCreateCategory}
        onCancel={() => setShowCreateCategoryDialog(false)}
      />
    </Card>
  );
};
