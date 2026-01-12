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

import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import {
  Card,
  CardBody,
  CardHeader,
  Grid,
  Text,
  TextField,
} from '@backstage/ui';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';

import { CategorySelectInput } from './CategorySelectInput';
import { TagsSelectInput } from './TagsSelectInput';
import OnBehalfTeamDropdown from './OnBehalfTeamDropdown';

type AnnouncementFormState = Omit<
  Announcement,
  'id' | 'created_at' | 'updated_at'
>;

export const AnnouncementForm = () => {
  const { t } = useAnnouncementsTranslation();

  const [form, setForm] = useState<AnnouncementFormState>({
    title: '',
    excerpt: '',
    body: '',
    active: true,
    start_at: '',
    until_date: undefined,
    on_behalf_of: undefined,
    tags: undefined,
    sendNotification: undefined,
    category: undefined,
    publisher: '',
  });

  return (
    <>
      <Grid.Root>
        <Grid.Item>
          <Card>
            <CardBody>
              <Text as="p" variant="title-x-small">
                Form state:
              </Text>
              <Text as="p">Title: {form.title ?? 'None'}</Text>
              <Text as="p">Excerpt: {form.excerpt ?? 'None'}</Text>
              <Text as="p">
                Selected Category: {form.category?.title ?? 'None'}
              </Text>
              <Text as="p">Publisher: {form.publisher ?? 'None'}</Text>
              <Text as="p">
                Selected On Behalf Of: {form.on_behalf_of ?? 'None'}
              </Text>
              <Text as="p">
                Selected Tags:{' '}
                {form.tags?.map(tag => tag.title).join(', ') ?? 'None'}
              </Text>
            </CardBody>
          </Card>
        </Grid.Item>
      </Grid.Root>

      <Card style={{ marginTop: '100px' }}>
        <CardHeader>
          <Text variant="title-small">Announcement Form</Text>
        </CardHeader>
        <CardBody>
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
                isRequired
              />
            </Grid.Item>

            <Grid.Item colSpan="3">
              <MDEditor
                value={form.body}
                style={{ minHeight: '30rem' }}
                onChange={value =>
                  setForm({ ...form, ...{ body: value || '' } })
                }
              />
            </Grid.Item>

            <Grid.Item colSpan={{ xs: '3', md: '1' }}>
              <CategorySelectInput
                initialCategory={form.category}
                setCategory={category => setForm({ ...form, category })}
              />
            </Grid.Item>

            <Grid.Item colSpan={{ xs: '3', md: '1' }}>
              <TagsSelectInput
                initialTags={form.tags}
                setTags={tags => setForm({ ...form, tags })}
              />
            </Grid.Item>

            <Grid.Item colSpan={{ xs: '3', md: '1' }}>
              <OnBehalfTeamDropdown
                selectedTeam={form.on_behalf_of || ''}
                onChange={(team: string) =>
                  setForm({ ...form, on_behalf_of: team })
                }
              />
            </Grid.Item>
          </Grid.Root>
        </CardBody>
      </Card>
    </>
  );
};
