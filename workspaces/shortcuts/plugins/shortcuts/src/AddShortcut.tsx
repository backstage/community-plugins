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

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SubmitHandler } from 'react-hook-form';
import { Button, Card } from '@backstage/ui';
import { ShortcutForm } from './ShortcutForm';
import { FormValues, Shortcut } from './types';
import { ShortcutApi } from './api';
import { alertApiRef, useApi, useAnalytics } from '@backstage/core-plugin-api';
import styles from './AddShortcut.module.css';

type Props = {
  onClose: () => void;
  anchorEl?: Element;
  api: ShortcutApi;

  allowExternalLinks?: boolean;
};

export const AddShortcut = ({
  onClose,
  anchorEl,
  api,
  allowExternalLinks,
}: Props) => {
  const alertApi = useApi(alertApiRef);
  const { pathname, search } = useLocation();
  const [formValues, setFormValues] = useState<FormValues>();
  const open = Boolean(anchorEl);
  const analytics = useAnalytics();

  const handleSave: SubmitHandler<FormValues> = async ({ url, title }) => {
    analytics.captureEvent('click', `Clicked 'Save' in AddShortcut`);
    const shortcut: Omit<Shortcut, 'id'> = { url, title };

    try {
      await api.add(shortcut);
      alertApi.post({
        message: `Added shortcut '${title}' to your sidebar`,
        severity: 'success',
        display: 'transient',
      });
    } catch (error) {
      alertApi.post({
        message: `Could not add shortcut: ${error.message}`,
        severity: 'error',
      });
    }

    onClose();
  };

  const handlePaste = () => {
    setFormValues({ url: `${pathname}${search}`, title: document.title });
  };

  const handleClose = () => {
    setFormValues(undefined);
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
    >
      <Card className={styles.card}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1400,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header} style={{ padding: 'var(--bui-space-4)', paddingBottom: 'var(--bui-space-2)', borderBottom: '1px solid var(--bui-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--bui-font-size-2)', fontWeight: 'var(--bui-font-weight-bold)' }}>Add Shortcut</h3>
          <Button
            className={styles.button}
            variant="secondary"
            onClick={handlePaste}
          >
            Use current page
          </Button>
        </div>
        <ShortcutForm
          onClose={handleClose}
          onSave={handleSave}
          formValues={formValues}
          allowExternalLinks={allowExternalLinks}
        />
      </Card>
    </div>
  );
};
