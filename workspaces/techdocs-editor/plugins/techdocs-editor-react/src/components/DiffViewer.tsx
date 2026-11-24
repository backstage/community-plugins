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

import { Text } from '@backstage/ui';
import { EditedFile } from '@backstage-community/plugin-techdocs-editor-common';
import { computeLineDiff, getHunks } from './diffUtils';
import styles from './DiffViewer.module.css';

export type DiffViewerProps = {
  /** Files that were modified. */
  changedFiles: EditedFile[];
  /** Pristine content per file path, keyed by path. */
  originalContents?: Map<string, string>;
  /** If true, renders a compact layout (smaller header padding). */
  compact?: boolean;
};

/**
 * Renders a GitHub-style unified diff for each changed file.
 * @public
 */
export function DiffViewer({
  changedFiles,
  originalContents,
  compact,
}: DiffViewerProps) {
  if (changedFiles.length === 0) {
    return (
      <Text className={styles.noChanges} as="div">
        No changes to show.
      </Text>
    );
  }

  return (
    <div className={compact ? styles.compactRoot : undefined}>
      {changedFiles.map(file => {
        if (file.encoding === 'base64') {
          return (
            <div key={file.path} className={styles.fileBlock}>
              <div className={styles.diffFileHeader}>
                <span className={styles.filePath}>{file.path}</span>
              </div>
              <div className={styles.diffContainer}>
                <span className={styles.noChanges}>
                  Binary file changed (preview not shown in diff).
                </span>
              </div>
            </div>
          );
        }

        const before = originalContents?.get(file.path) ?? '';
        const after = file.content ?? '';
        const isNew = before === '' && file.etag === '';
        const lines = isNew
          ? after.split('\n').map(t => ({ type: 'added' as const, text: t }))
          : computeLineDiff(before, after);
        const hunks = isNew ? [lines] : getHunks(lines);

        return (
          <div key={file.path} className={styles.fileBlock}>
            <div className={styles.diffFileHeader}>
              {isNew && <span className={styles.newFileBadge}>new file</span>}
              <span className={styles.filePath}>{file.path}</span>
            </div>
            <div className={styles.diffContainer}>
              {hunks.length === 0 ? (
                <span className={styles.noChanges}>
                  No visible differences (whitespace only?)
                </span>
              ) : (
                hunks.map((hunk, hi) => (
                  <div key={hi}>
                    {hi > 0 && (
                      <span className={styles.hunkSeparator}>@@ ... @@</span>
                    )}
                    {hunk.map((line, li) => {
                      let lineClass = styles.lineContext;
                      if (line.type === 'added') lineClass = styles.lineAdded;
                      else if (line.type === 'removed')
                        lineClass = styles.lineRemoved;
                      return (
                        <span key={li} className={lineClass}>
                          {line.text}
                        </span>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
