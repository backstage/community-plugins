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

import { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { FieldLabel, Flex, Grid, Switch, TextField } from '@backstage/ui';
import MuiTextField from '@mui/material/TextField';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { DateTime } from 'luxon';

import { CategorySelectInput, TagsSelectInput } from '../../shared';
import { OnBehalfTeamDropdown } from './OnBehalfTeamDropdown';

type AnnouncementFormState = Omit<
  Announcement,
  'id' | 'created_at' | 'updated_at'
>;

type AnnouncementFormProps = {
  initialData?: Announcement;
  onFormChange: (data: AnnouncementFormState) => void;
};

export const AnnouncementForm = ({
  initialData,
  onFormChange,
}: AnnouncementFormProps) => {
  const { t } = useAnnouncementsTranslation();

  const [form, setForm] = useState<AnnouncementFormState>(() => {
    const defaultStartAt = DateTime.now().toISODate() || '';
    const defaultUntilDate =
      DateTime.now().endOf('day').plus({ days: 7 }).toISODate() || '';

    if (initialData) {
      // Format dates for the date input fields
      const formattedStartAt = initialData.start_at
        ? DateTime.fromISO(initialData.start_at).toISODate() || defaultStartAt
        : defaultStartAt;
      const formattedUntilDate = initialData.until_date
        ? DateTime.fromISO(initialData.until_date).toISODate() ||
          defaultUntilDate
        : defaultUntilDate;

      return {
        ...initialData,
        start_at: formattedStartAt,
        until_date: formattedUntilDate,
      };
    }

    return {
      title: '',
      excerpt: '',
      body: '',
      active: true,
      start_at: defaultStartAt,
      until_date: defaultUntilDate,
      on_behalf_of: undefined,
      tags: undefined,
      sendNotification: true,
      category: undefined,
      publisher: '',
    };
  });

  useEffect(() => {
    if (initialData) {
      // Format dates for the date input fields
      const formattedStartAt = initialData.start_at
        ? DateTime.fromISO(initialData.start_at).toISODate() ||
          DateTime.now().toISODate() ||
          ''
        : DateTime.now().toISODate() || '';
      const formattedUntilDate = initialData.until_date
        ? DateTime.fromISO(initialData.until_date).toISODate() ||
          DateTime.now().endOf('day').plus({ days: 7 }).toISODate() ||
          ''
        : DateTime.now().endOf('day').plus({ days: 7 }).toISODate() || '';

      setForm({
        ...initialData,
        start_at: formattedStartAt,
        until_date: formattedUntilDate,
      });
    }
  }, [initialData]);

  useEffect(() => {
    onFormChange(form);
  }, [form, onFormChange]);

  return (
    <Grid.Root columns="3">
      <Grid.Item colSpan="3">
        <TextField
          label={t('announcementForm.title')}
          value={form.title}
          onChange={v => setForm({ ...form, title: v })}
          isRequired
        />
      </Grid.Item>

      <Grid.Item colSpan="3">
        <TextField
          label={t('announcementForm.excerpt')}
          value={form.excerpt}
          onChange={v => setForm({ ...form, excerpt: v })}
        />
      </Grid.Item>

      <Grid.Item colSpan="3">
        <Flex direction="column" mb="8">
          <FieldLabel label={t('announcementForm.body')} />

          <MDEditor
            value={form.body}
            style={{ minHeight: '30rem' }}
            onChange={value => setForm({ ...form, ...{ body: value || '' } })}
          />
        </Flex>
      </Grid.Item>

      <Grid.Item colSpan={{ xs: '3', md: '1' }}>
        <Flex direction="column" gap="4">
          <CategorySelectInput
            initialCategory={form.category}
            setCategory={category =>
              setForm({ ...form, category: category ?? undefined })
            }
          />

          <OnBehalfTeamDropdown
            selectedTeam={form.on_behalf_of || ''}
            onChange={(team: string) =>
              setForm({ ...form, on_behalf_of: team })
            }
          />
        </Flex>
      </Grid.Item>

      <Grid.Item colSpan={{ xs: '3', md: '1' }}>
        <TagsSelectInput
          initialTags={form.tags}
          setTags={tags => setForm({ ...form, tags: tags ?? undefined })}
        />
      </Grid.Item>

      <Grid.Item colSpan="2">
        <Flex direction="column" my="4" gap="4">
          <MuiTextField
            label={t('announcementForm.startAt')}
            id="start-at-date"
            type="date"
            value={form.start_at}
            InputLabelProps={{ shrink: true }}
            fullWidth
            onChange={e =>
              setForm({
                ...form,
                start_at: e.target.value,
              })
            }
          />
          <MuiTextField
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
        </Flex>
      </Grid.Item>

      <Grid.Item colSpan="3">
        <Flex direction="column">
          <Switch
            label={t('announcementForm.active')}
            isSelected={form.active}
            onChange={() => setForm({ ...form, active: !form.active })}
          />

          <Switch
            label={t('announcementForm.sendNotification')}
            isSelected={form.sendNotification}
            onChange={() =>
              setForm({
                ...form,
                sendNotification: !form.sendNotification,
              })
            }
          />
        </Flex>
      </Grid.Item>
    </Grid.Root>
  );
};
