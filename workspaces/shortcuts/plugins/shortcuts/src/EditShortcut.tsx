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
import { Button, Card } from '@backstage/ui';
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

  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1300,
      }}
      onClick={handleClose}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClose();
        }
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
          }
        }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1400,
        }}
      >
        <Card className={styles.card}>
          <div
            className={styles.header}
            style={{
              padding: 'var(--bui-space-4)',
              paddingBottom: 'var(--bui-space-2)',
              borderBottom: '1px solid var(--bui-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 'var(--bui-font-size-2)',
                fontWeight: 600,
              }}
            >
              Edit Shortcut
            </h3>
            <Button
              className={styles.button}
              variant="secondary"
              onClick={handleRemove}
            >
              <RiDeleteBinLine
                size={16}
                style={{ marginRight: 'var(--bui-space-1)' }}
              />
              Remove
            </Button>
          </div>
          <ShortcutForm
            formValues={{ url: shortcut.url, title: shortcut.title }}
            onClose={handleClose}
            onSave={handleSave}
            allowExternalLinks={allowExternalLinks}
          />
        </Card>
      </div>
    </div>
  );
};
