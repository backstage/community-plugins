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
import { FormEvent, useState } from 'react';
import { Card, Button, TextField, CardBody, Box, Flex } from '@backstage/ui';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import { useAnnouncementsPermissions } from './useAnnouncementsPermissions';

type EntityWithTitle = {
  title: string;
};

type EntityFormProps<
  T extends EntityWithTitle,
  TRequest extends { title: string },
> = {
  initialData: T;
  onSubmit: (data: TRequest) => Promise<void>;
  translationKeys: {
    editLabel: string;
    newLabel: string;
    titleLabel: string;
    submit: string;
  };
  // Optional validation function - if not provided, checks if form.title exists
  validateForm?: (form: T) => boolean;
  // Optional test IDs for testing
  testIds?: {
    form?: string;
    titleInput?: string;
    submitButton?: string;
  };
};

export function EntityForm<
  T extends EntityWithTitle,
  TRequest extends { title: string },
>({
  initialData,
  onSubmit,
  translationKeys,
  validateForm,
  testIds,
}: EntityFormProps<T, TRequest>) {
  const [form, setForm] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const { t } = useAnnouncementsTranslation();
  const permissions = useAnnouncementsPermissions();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    try {
      await onSubmit(form as unknown as TRequest);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const isValid = validateForm ? validateForm(form) : Boolean(form?.title);

  return (
    <Card
      title={
        initialData.title
          ? t(translationKeys.editLabel)
          : t(translationKeys.newLabel)
      }
    >
      <CardBody>
        <Box p="1">
          <form onSubmit={handleSubmit} data-testid={testIds?.form}>
            <TextField
              id="title"
              type="text"
              label={t(translationKeys.titleLabel)}
              value={form.title || ''}
              isRequired
              onChange={value => setForm({ ...form, title: value } as T)}
              data-testid={testIds?.titleInput}
            />
            <Flex justify="end" pt="3">
              <Button
                type="submit"
                variant="primary"
                isDisabled={
                  loading ||
                  !isValid ||
                  permissions.create.loading ||
                  !permissions.create.allowed
                }
                data-testid={testIds?.submitButton}
              >
                {t(translationKeys.submit)}
              </Button>
            </Flex>
          </form>
        </Box>
      </CardBody>
    </Card>
  );
}
