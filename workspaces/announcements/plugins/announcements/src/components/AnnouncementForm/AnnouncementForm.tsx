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
import { InfoCard } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  CreateAnnouncementRequest,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import CategoryInput from './CategoryInput';
import OnBehalfTeamDropdown from './OnBehalfTeamDropdown';
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
import SaveAltIcon from '@material-ui/icons/SaveAlt';
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

  const formattedStartAt = initialData.start_at
    ? DateTime.fromISO(initialData.start_at).toISODate()
    : DateTime.now().toISODate();

  const [form, setForm] = useState({
    ...initialData,
    category: initialData.category?.slug,
    start_at: formattedStartAt || '',
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
    const createRequest = {
      ...form,
      ...{
        publisher: userIdentity.userEntityRef,
        on_behalf_of: onBehalfOfSelectedTeam,
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

            <Grid item xs={12} sm={4}>
              <CategoryInput
                setForm={setForm}
                form={form}
                initialValue={initialData.category?.title ?? ''}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <OnBehalfTeamDropdown
                selectedTeam={onBehalfOfSelectedTeam}
                onChange={setOnBehalfOfSelectedTeam}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                label={t('announcementForm.startAt')}
                id="start-at-date"
                type="date"
                value={form.start_at}
                InputLabelProps={{ shrink: true }}
                required
                onChange={e =>
                  setForm({
                    ...form,
                    start_at: e.target.value,
                  })
                }
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
