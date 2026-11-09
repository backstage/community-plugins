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

import { ButtonIcon, Text } from '@backstage/ui';
import { RiCloseLine } from '@remixicon/react';
import { EditedFile } from '@backstage-community/plugin-techdocs-editor-common';
import { DiffViewer } from './DiffViewer';
import styles from './ChangesDrawer.module.css';

export type ChangesDrawerProps = {
  open: boolean;
  onClose: () => void;
  changedFiles: EditedFile[];
  originalContents: Map<string, string>;
};

/**
 * A slide-in drawer showing a GitHub-style diff of all changes made so far.
 * @public
 */
export function ChangesDrawer({
  open,
  onClose,
  changedFiles,
  originalContents,
}: ChangesDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div className={styles.drawer} role="dialog" aria-label="Review changes">
        <div className={styles.header}>
          <Text variant="title-small" as="h2">
            Review Changes
          </Text>
          <Text variant="body-x-small" color="secondary" as="span">
            {changedFiles.length} file{changedFiles.length !== 1 ? 's' : ''}{' '}
            changed
          </Text>
          <ButtonIcon
            aria-label="Close"
            variant="tertiary"
            icon={<RiCloseLine size={18} />}
            onPress={onClose}
            className={styles.closeBtn}
          />
        </div>

        <div className={styles.body}>
          {changedFiles.length === 0 ? (
            <Text color="secondary" as="div" className={styles.empty}>
              No changes yet. Start editing a file.
            </Text>
          ) : (
            <DiffViewer
              changedFiles={changedFiles}
              originalContents={originalContents}
              compact
            />
          )}
        </div>
      </div>
    </>
  );
}
