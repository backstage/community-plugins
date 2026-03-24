/*
 * Copyright 2021 The Backstage Authors
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

import { SubmitHandler } from 'react-hook-form';
import { Button, Popover, Text } from '@backstage/ui';
import { ShortcutForm } from './ShortcutForm';
import { FormValues, Shortcut } from './types';
import { RiDeleteBinLine } from '@remixicon/react';
import { ShortcutApi } from './api';
import { alertApiRef, useApi, useAnalytics } from '@backstage/core-plugin-api';
import styles from './EditShortcut.module.css';

type Props = {
  shortcut: Shortcut;
  onClose: () => void;
  anchorEl?: Element;
  api: ShortcutApi;
  allowExternalLinks?: boolean;
};

export const EditShortcut = ({
  shortcut,
  onClose,
  anchorEl,
  api,
  allowExternalLinks,
}: Props) => {
  const alertApi = useApi(alertApiRef);
  const open = Boolean(anchorEl);
  const analytics = useAnalytics();

  const handleSave: SubmitHandler<FormValues> = async ({ url, title }) => {
    analytics.captureEvent('click', `Clicked 'Save' in Edit Shortcut`);
    const newShortcut: Shortcut = {
      ...shortcut,
      url,
      title,
    };

    try {
      await api.update(newShortcut);
      alertApi.post({
        message: `Updated shortcut '${title}'`,
        severity: 'success',
        display: 'transient',
      });
    } catch (error) {
      alertApi.post({
        message: `Could not update shortcut: ${error.message}`,
        severity: 'error',
      });
    }

    onClose();
  };

  const handleRemove = async () => {
    analytics.captureEvent('click', `Clicked 'Remove' in Edit Shortcut`);

    try {
      await api.remove(shortcut.id);
      alertApi.post({
        message: `Removed shortcut '${shortcut.title}' from your sidebar`,
        severity: 'success',
        display: 'transient',
      });
    } catch (error) {
      alertApi.post({
        message: `Could not delete shortcut: ${error.message}`,
        severity: 'error',
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Popover
      isOpen={open}
      triggerRef={{ current: anchorEl as HTMLElement }}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      placement="bottom end"
    >
      <div className={styles.card}>
        <div className={styles.header}>
          <Text variant="title-small">Edit Shortcut</Text>
          <Button
            className={styles.button}
            variant="tertiary"
            size="small"
            onPress={handleRemove}
          >
            <RiDeleteBinLine size={16} />
            Remove
          </Button>
        </div>
        <ShortcutForm
          formValues={{ url: shortcut.url, title: shortcut.title }}
          onClose={handleClose}
          onSave={handleSave}
          allowExternalLinks={allowExternalLinks}
        />
      </div>
    </Popover>
  );
};
