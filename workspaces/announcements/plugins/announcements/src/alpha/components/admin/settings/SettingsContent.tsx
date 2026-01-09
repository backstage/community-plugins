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
import { useState } from 'react';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import {
  useSettings,
  useAnnouncementsTranslation,
  useAnnouncementsPermissions,
} from '@backstage-community/plugin-announcements-react';
import { Settings } from '@backstage-community/plugin-announcements-common';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Flex,
  Grid,
  Skeleton,
  Text,
  TextField,
} from '@backstage/ui';

/**
 * @internal
 */
export const SettingsContent = () => {
  const alertApi = useApi(alertApiRef);
  const { t } = useAnnouncementsTranslation();
  const permissions = useAnnouncementsPermissions();

  const { settings, loading, error, updateSettings, resetSettings } =
    useSettings();

  const [form, setForm] = useState<Partial<Settings>>({});
  const [numberInputs, setNumberInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Merge loaded settings with form state
  const currentSettings: Partial<Settings> = { ...settings, ...form };

  const handleTextChange = (field: keyof Settings) => (value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNumberChange = (field: keyof Settings) => (value: string) => {
    // Always update the display value
    setNumberInputs(prev => ({
      ...prev,
      [field]: value,
    }));

    // Update form with parsed number, or remove if empty/invalid
    if (value === '') {
      setForm(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      return;
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setForm(prev => ({
        ...prev,
        [field]: numValue,
      }));
    }
  };

  const getNumberInputValue = (field: keyof Settings): string => {
    // If user has typed something, show that
    if (field in numberInputs) {
      return numberInputs[field];
    }
    // Otherwise show the current setting value
    const value = currentSettings[field];
    return value !== undefined && value !== null ? String(value) : '';
  };

  const handleSwitchChange =
    (field: keyof Settings) => (isSelected: boolean) => {
      setForm(prev => ({
        ...prev,
        [field]: isSelected,
      }));
    };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      setForm({});
      setNumberInputs({});
      alertApi.post({
        message: t('admin.settingsContent.savedMessage'),
        severity: 'success',
      });
    } catch (err) {
      alertApi.post({
        message: (err as Error).message,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await resetSettings();
      setForm({});
      setNumberInputs({});
      alertApi.post({
        message: t('admin.settingsContent.resetMessage'),
        severity: 'success',
      });
    } catch (err) {
      alertApi.post({
        message: (err as Error).message,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const canUpdate =
    !permissions.settingsUpdate.loading && permissions.settingsUpdate.allowed;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Text variant="title-small">{t('admin.settingsContent.title')}</Text>
        </CardHeader>
        <CardBody>
          <Flex direction="column" gap="4">
            <Skeleton width="100%" height={200} />
          </Flex>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <Text color="danger">{error.message}</Text>
        </CardBody>
      </Card>
    );
  }

  const hasChanges = Object.keys(form).length > 0;
  const isDisabled = !canUpdate || saving;

  return (
    <Card>
      <CardBody>
        <Flex direction="column" gap="8">
          {/* General Settings */}
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text variant="title-x-small" weight="bold">
                {t('admin.settingsContent.generalSection')}
              </Text>
              <Text variant="body-small" color="secondary">
                {t('admin.settingsContent.generalSectionDescription')}
              </Text>
            </Flex>

            <Grid.Root columns={{ xs: '1', md: '3' }} gap="1">
              <Grid.Item>
                <TextField
                  label={t('admin.settingsContent.pluginTitle')}
                  description={t('admin.settingsContent.pluginTitleHelp')}
                  value={currentSettings.pluginTitle ?? ''}
                  onChange={handleTextChange('pluginTitle')}
                  isDisabled={isDisabled}
                />
              </Grid.Item>

              <Grid.Item>
                <TextField
                  label={t('admin.settingsContent.maxPerPage')}
                  description={t('admin.settingsContent.maxPerPageHelp')}
                  value={getNumberInputValue('maxPerPage')}
                  onChange={handleNumberChange('maxPerPage')}
                  isDisabled={isDisabled}
                />
              </Grid.Item>
            </Grid.Root>
          </Flex>

          {/* Display Settings */}
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text variant="title-x-small" weight="bold">
                {t('admin.settingsContent.displaySection')}
              </Text>
              <Text variant="body-small" color="secondary">
                {t('admin.settingsContent.displaySectionDescription')}
              </Text>
            </Flex>

            <Grid.Root columns={{ xs: '1', md: '3' }} gap="2">
              <Grid.Item>
                <TextField
                  label={t('admin.settingsContent.announcementTitleLength')}
                  value={getNumberInputValue('announcementTitleLength')}
                  onChange={handleNumberChange('announcementTitleLength')}
                  isDisabled={isDisabled}
                />
              </Grid.Item>

              <Grid.Item>
                <TextField
                  label={t('admin.settingsContent.tagTitleLength')}
                  value={getNumberInputValue('tagTitleLength')}
                  onChange={handleNumberChange('tagTitleLength')}
                  isDisabled={isDisabled}
                />
              </Grid.Item>

              <Grid.Item>
                <TextField
                  label={t('admin.settingsContent.excerptLength')}
                  value={getNumberInputValue('excerptLength')}
                  onChange={handleNumberChange('excerptLength')}
                  isDisabled={isDisabled}
                />
              </Grid.Item>
            </Grid.Root>
          </Flex>

          {/* Default Behavior Settings */}
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text variant="title-x-small" weight="bold">
                {t('admin.settingsContent.defaultsSection')}
              </Text>
              <Text variant="body-small" color="secondary">
                {t('admin.settingsContent.defaultsSectionDescription')}
              </Text>
            </Flex>

            <Flex direction="column" gap="4">
              <Checkbox
                isSelected={
                  currentSettings.createAnnouncementAsInactive ?? false
                }
                onChange={handleSwitchChange('createAnnouncementAsInactive')}
                isDisabled={isDisabled}
              >
                {t('admin.settingsContent.createAnnouncementAsInactive')}
              </Checkbox>

              <Checkbox
                isSelected={currentSettings.sendNotification ?? false}
                onChange={handleSwitchChange('sendNotification')}
                isDisabled={isDisabled}
              >
                {t('admin.settingsContent.sendNotification')}
              </Checkbox>

              <Checkbox
                isSelected={currentSettings.showInactiveAnnouncements ?? false}
                onChange={handleSwitchChange('showInactiveAnnouncements')}
                isDisabled={isDisabled}
              >
                {t('admin.settingsContent.showInactiveAnnouncements')}
              </Checkbox>

              <Checkbox
                isSelected={currentSettings.showStartAt ?? false}
                onChange={handleSwitchChange('showStartAt')}
                isDisabled={isDisabled}
              >
                {t('admin.settingsContent.showStartAt')}
              </Checkbox>
            </Flex>

            <TextField
              label={t('admin.settingsContent.defaultCategory')}
              description={t('admin.settingsContent.defaultCategoryHelp')}
              value={
                currentSettings.createAnnouncementWithDefaultCategory ?? ''
              }
              onChange={handleTextChange(
                'createAnnouncementWithDefaultCategory',
              )}
              isDisabled={isDisabled}
            />
          </Flex>
        </Flex>
      </CardBody>

      <CardFooter>
        <Flex justify="between" style={{ width: '100%' }}>
          <Button
            variant="secondary"
            onPress={handleReset}
            isDisabled={isDisabled}
          >
            {t('admin.settingsContent.resetButton')}
          </Button>
          <Button
            variant="primary"
            onPress={handleSave}
            isDisabled={isDisabled || !hasChanges}
          >
            {t('admin.settingsContent.saveButton')}
          </Button>
        </Flex>
      </CardFooter>
    </Card>
  );
};
