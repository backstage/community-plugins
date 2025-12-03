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
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { InfoCard } from '@backstage/core-components';
import { useAnnouncementsPermissions } from '@backstage-community/plugin-announcements-react';
import { Button, TextField } from '@material-ui/core';

type TitleFormTranslationKeys = {
  new: string;
  edit: string;
  titleLabel: string;
  submit: string;
};

type TitleFormTestIds = {
  form?: string;
  input?: string;
  button?: string;
};

type TitleFormRequest = {
  title: string;
};

export type TitleFormProps<T extends TitleFormRequest> = {
  initialData?: T;
  translationKeys: TitleFormTranslationKeys;
  onSubmit: (data: T) => Promise<void>;
  testIds?: TitleFormTestIds;
};

export const TitleForm = <T extends TitleFormRequest>(
  props: TitleFormProps<T>,
) => {
  const { initialData, translationKeys, onSubmit, testIds } = props;

  const [form, setForm] = useState<T>(initialData ?? ({ title: '' } as T));
  const [loading, setLoading] = useState(false);
  const permissions = useAnnouncementsPermissions();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      title: event.target.value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    try {
      await onSubmit(form);
    } finally {
      // will still handle setting loading to false even if onSubmit fails
      setLoading(false);
    }
  };

  const isDisabled = useMemo(() => {
    return (
      loading ||
      !form?.title ||
      permissions.create.loading ||
      !permissions.create.allowed
    );
  }, [
    loading,
    form?.title,
    permissions.create.loading,
    permissions.create.allowed,
  ]);

  return (
    <InfoCard
      title={initialData?.title ? translationKeys.edit : translationKeys.new}
    >
      <form onSubmit={handleSubmit} data-testid={testIds?.form ?? 'title-form'}>
        <TextField
          id="title"
          data-testid={testIds?.input ?? 'title-input'}
          type="text"
          label={translationKeys.titleLabel}
          value={form.title}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          data-testid={testIds?.button ?? 'title-submit-button'}
          disabled={isDisabled}
        >
          {translationKeys.submit}
        </Button>
      </form>
    </InfoCard>
  );
};
