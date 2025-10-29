/*
 * Copyright 2025 The Backstage Authors
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
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  TextField,
} from '@material-ui/core';

export type TagFormProps = {
  onSubmit: (data: { title: string }) => void;
  onCancel: () => void;
  initialData?: { title: string };
};

export const TagForm = ({
  onSubmit,
  onCancel,
  initialData = { title: '' },
}: TagFormProps) => {
  const { t } = useAnnouncementsTranslation();
  const [form, setForm] = useState<{ title: string }>(initialData);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title={
            initialData.title ? t('tagsForm.editTag') : t('tagsForm.newTag')
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                name="title"
                label={t('tagsForm.titleLabel')}
                value={form.title}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button onClick={onCancel}>
            {t('admin.tagsContent.cancelButton')}
          </Button>
          <Button
            type="submit"
            color="primary"
            disabled={!form.title}
            variant="contained"
          >
            {t('tagsForm.submit')}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};
