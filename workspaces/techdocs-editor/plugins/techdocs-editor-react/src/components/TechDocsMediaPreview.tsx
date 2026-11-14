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
import styles from './TechDocsMediaPreview.module.css';

/**
 * Props for the media preview component.
 * @public
 */
export type TechDocsMediaPreviewProps = {
  path: string;
  content: string;
  mimeType?: string;
};

const FALLBACK_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function inferMimeType(filePath: string): string {
  const dot = filePath.lastIndexOf('.');
  const ext = dot >= 0 ? filePath.slice(dot).toLocaleLowerCase('en-US') : '';
  return FALLBACK_MIME_TYPES[ext] ?? 'application/octet-stream';
}

/**
 * Preview for image files loaded from the TechDocs source.
 * @public
 */
export function TechDocsMediaPreview({
  path,
  content,
  mimeType,
}: TechDocsMediaPreviewProps) {
  if (!content) {
    return (
      <div className={styles.root}>
        <Text color="secondary">No media content available.</Text>
      </div>
    );
  }

  const resolvedMimeType = mimeType ?? inferMimeType(path);
  const src = `data:${resolvedMimeType};base64,${content}`;

  return (
    <div className={styles.root}>
      <img src={src} alt={path} className={styles.image} />
    </div>
  );
}
