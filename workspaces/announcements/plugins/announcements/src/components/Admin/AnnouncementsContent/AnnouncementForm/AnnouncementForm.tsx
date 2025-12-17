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
import { InfoCard } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';

import {
  CreateAnnouncementRequest,
  useAnnouncementsTranslation,
  announcementsApiRef,
} from '@backstage-community/plugin-announcements-react';
import { Announcement } from '@backstage-community/plugin-announcements-common';

import CategoryInput from './CategoryInput';
import OnBehalfTeamDropdown from './OnBehalfTeamDropdown';
import TagsInput from './TagsInput';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

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
    <InfoCard>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          {initialData.title
            ? t('announcementForm.editAnnouncement')
            : t('announcementForm.newAnnouncement')}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                id="title"
                label={t('announcementForm.title')}
                value={form.title}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
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
            </Grid>

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, borderColor: 'divider', p: 2 }}
              >
                <MDEditor
                  value={form.body}
                  style={{ minHeight: '30rem' }}
                  onChange={value =>
                    setForm({ ...form, ...{ body: value || '' } })
                  }
                />
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <CategoryInput
                setForm={setForm}
                form={form}
                initialValue={initialData.category?.title ?? ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <OnBehalfTeamDropdown
                selectedTeam={onBehalfOfSelectedTeam}
                onChange={setOnBehalfOfSelectedTeam}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TagsInput setForm={setForm} form={form} />
            </Grid>

            <Grid item xs={12} sm={3}>
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
            </Grid>

            <Grid item xs={12} sm={3}>
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
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
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
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading || !form.body}
                  size="large"
                  startIcon={<SaveAltIcon />}
                >
                  {t('announcementForm.submit')}
                </Button>
              </FormGroup>
            </Grid>
          </Grid>
        </form>
      </Box>
    </InfoCard>
  );
};
