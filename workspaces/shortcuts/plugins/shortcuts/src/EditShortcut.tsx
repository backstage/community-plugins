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

import { useRef, useEffect, useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { Text } from '@backstage/ui';
import { ButtonIcon } from '@backstage/ui';
import { RiDeleteBinLine } from '@remixicon/react';
import { ShortcutForm } from './ShortcutForm';
import { FormValues, Shortcut } from './types';
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
  const popoverRef = useRef<HTMLDivElement>(null);
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
    return;
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

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    return undefined;
  }, [open, anchorEl, handleClose]);

  if (!open) return null;

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        zIndex: 1300,
        top: anchorEl ? (anchorEl as any).getBoundingClientRect().top : 0,
        left: anchorEl
          ? (anchorEl as any).getBoundingClientRect().right + 10
          : 0,
      }}
    >
      <div
        className={styles.card}
        style={{
          backgroundColor: 'light-dark(#ffffff, #424242)',
        }}
      >
        <div className={styles.header}>
          <Text variant="body-medium">Edit Shortcut</Text>
          <ButtonIcon
            className={styles.button}
            aria-label="delete"
            icon={<RiDeleteBinLine size={16} />}
            onPress={handleRemove}
            variant="secondary"
          />
        </div>
        <ShortcutForm
          formValues={{ url: shortcut.url, title: shortcut.title }}
          onClose={handleClose}
          onSave={handleSave}
          allowExternalLinks={allowExternalLinks}
        />
      </div>
    </div>
  );
};
