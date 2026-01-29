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
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Grid,
  Text,
  TextField,
  Switch,
  Flex,
} from '@backstage/ui';
import { RiSave2Line } from '@remixicon/react';
import {
  CreateAnnouncementRequest,
  useAnnouncementsTranslation,
  announcementsApiRef,
} from '@backstage-community/plugin-announcements-react';
import { Announcement } from '@backstage-community/plugin-announcements-common';

import CategoryInput from './CategoryInput';
import OnBehalfTeamDropdown from './OnBehalfTeamDropdown';
import TagsInput from './TagsInput';

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
  const { t } = useAnnouncementsTranslation();

  const formattedStartAt = initialData.start_at
    ? DateTime.fromISO(initialData.start_at).toISODate()
    : DateTime.now().toISODate();

  const formattedUntilDate = initialData.until_date
    ? DateTime.fromISO(initialData.until_date).toISODate()
    : DateTime.now().endOf('day').plus({ days: 7 }).toISODate();

  const [form, setForm] = useState({
    ...initialData,
    active: initialData.active ?? true,
    category: initialData.category?.slug,
    start_at: formattedStartAt || '',
    until_date: formattedUntilDate || '',
    tags: initialData.tags?.map(tag => tag.slug) || undefined,
    sendNotification: initialData.sendNotification ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [onBehalfOfSelectedTeam, setOnBehalfOfSelectedTeam] = useState(
    initialData.on_behalf_of || '',
  );

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

    const { id, created_at, ...announcementData } = form;

    const createRequest: CreateAnnouncementRequest = {
      ...announcementData,
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
                <CategoryInput
                  setForm={setForm}
                  form={form}
                  initialValue={initialData.category?.title ?? ''}
                />
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
    </Card>
  );
};
