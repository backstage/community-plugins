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
import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { InfoCard } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  CreateAnnouncementRequest,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import CategoryInput from './CategoryInput';
import {
  TextField,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Box,
  Grid,
  Typography,
  Divider,
} from '@material-ui/core';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import LuxonUtils from '@date-io/luxon';
import { DateTime } from 'luxon';

type AnnouncementFormProps = {
  initialData: Announcement;
  onSubmit: (data: CreateAnnouncementRequest) => Promise<void>;
};

export const AnnouncementForm = ({
  initialData,
  onSubmit,
}: AnnouncementFormProps) => {
  const identityApi = useApi(identityApiRef);
  const { t } = useAnnouncementsTranslation();

  const [form, setForm] = React.useState({
    ...initialData,
    category: initialData.category?.slug,
    start_at: initialData.start_at || DateTime.now().toISO(),
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.id]: event.target.value,
    });
  };

  const handleChangeActive = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    const userIdentity = await identityApi.getBackstageIdentity();
    const createRequest = {
      ...form,
      ...{
        publisher: userIdentity.userEntityRef,
      },
    };

    await onSubmit(createRequest);
    setLoading(false);
  };

  return (
    <InfoCard>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          {initialData.title
            ? t('announcementForm.editAnnouncement')
            : t('announcementForm.newAnnouncement')}
        </Typography>
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

            <Grid item xs={12} sm={6}>
              <CategoryInput
                setForm={setForm}
                form={form}
                initialValue={initialData.category?.title ?? ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MuiPickersUtilsProvider utils={LuxonUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  inputVariant="outlined"
                  format="MM/dd/yyyy"
                  id="start_at-date-picker"
                  label={t('announcementForm.startAt')}
                  value={form.start_at}
                  onChange={date =>
                    setForm({
                      ...form,
                      start_at: date
                        ? date.toISO() || ''
                        : DateTime.now().toISO() || '',
                    })
                  }
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                  required
                />
              </MuiPickersUtilsProvider>
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
              <MDEditor
                value={form.body}
                style={{ minHeight: '30rem' }}
                onChange={value =>
                  setForm({ ...form, ...{ body: value || '' } })
                }
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
