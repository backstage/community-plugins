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
  makeStyles,
  TextField,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
} from '@material-ui/core';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import { DateTime } from 'luxon';

const useStyles = makeStyles(theme => ({
  formRoot: {
    '& > *': {
      margin: theme.spacing(1) ?? '8px',
    },
  },
}));

type AnnouncementFormProps = {
  initialData: Announcement;
  onSubmit: (data: CreateAnnouncementRequest) => Promise<void>;
};

export const AnnouncementForm = ({
  initialData,
  onSubmit,
}: AnnouncementFormProps) => {
  const classes = useStyles();
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
    <InfoCard
      title={
        initialData.title
          ? t('announcementForm.editAnnouncement')
          : t('announcementForm.newAnnouncement')
      }
    >
      <form className={classes.formRoot} onSubmit={handleSubmit}>
        <TextField
          id="title"
          type="text"
          label={t('announcementForm.title')}
          value={form.title}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
        <CategoryInput
          setForm={setForm}
          form={form}
          initialValue={initialData.category?.title ?? ''}
        />
        <TextField
          id="excerpt"
          type="text"
          label={t('announcementForm.excerpt')}
          value={form.excerpt}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
        <MDEditor
          value={form.body}
          style={{ minHeight: '30rem' }}
          onChange={value => setForm({ ...form, ...{ body: value || '' } })}
        />
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
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
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                name="active"
                checked={form.active}
                onChange={handleChangeActive}
              />
            }
            label={t('announcementForm.active')}
          />
        </FormGroup>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading || !form.body}
        >
          {t('announcementForm.submit')}
        </Button>
      </form>
    </InfoCard>
  );
};
