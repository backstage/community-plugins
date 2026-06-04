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

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { SubmitHandler } from 'react-hook-form';
import { Button, Text } from '@backstage/ui';
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
  const popoverRef = useRef<HTMLDivElement>(null);
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
    return;
  };

  const handlePaste = () => {
    setFormValues({ url: `${pathname}${search}`, title: document.title });
  };

  const handleClose = useCallback(() => {
    setFormValues(undefined);
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
          <Text variant="body-medium">Add Shortcut</Text>
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
      </div>
    </div>
  );
};
