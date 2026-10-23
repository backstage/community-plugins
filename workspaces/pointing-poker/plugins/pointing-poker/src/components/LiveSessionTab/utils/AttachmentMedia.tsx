/*
 * Copyright 2026 The Backstage Authors
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
import { Download, FileText } from 'lucide-react';
import { Flex, Text } from '@backstage/ui';
import type { Attachment } from '@backstage-community/plugin-pointing-poker-common';

type AttachmentMediaProps = Readonly<{
  attachment: Attachment;
}>;

const formatSize = (bytes?: number): string | undefined => {
  if (!bytes || bytes <= 0) {
    return undefined;
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 || value >= 10 ? 0 : 1)} ${units[unit]}`;
};

// Renders a single ticket attachment. Images show inline via their URL; other
// files (e.g. PDFs) render as a card that opens the file in a new tab.
export const AttachmentMedia = ({ attachment }: AttachmentMediaProps) => {
  const isImage = attachment.mimeType.startsWith('image/');

  if (isImage) {
    if (!attachment.url) {
      return (
        <Text as="span" color="secondary" variant="body-x-small">
          {`🖼 ${attachment.filename}`}
        </Text>
      );
    }
    return (
      <img
        alt={attachment.filename}
        src={attachment.url}
        style={{
          border: '1px solid var(--bui-border-1)',
          borderRadius: 'var(--bui-radius-3)',
          height: 'auto',
          margin: 'var(--bui-space-2) 0',
          maxWidth: '100%',
        }}
      />
    );
  }

  const size = formatSize(attachment.size);

  return (
    <a
      href={attachment.url}
      rel="noreferrer"
      style={{
        display: 'block',
        margin: 'var(--bui-space-2) 0',
        maxWidth: '24rem',
        textDecoration: 'none',
      }}
      target="_blank"
    >
      <Flex
        align="center"
        gap="3"
        style={{
          background: 'var(--bui-bg-neutral-1)',
          border: '1px solid var(--bui-border-1)',
          borderRadius: 'var(--bui-radius-3)',
          padding: 'var(--bui-space-3)',
        }}
      >
        <FileText
          size={20}
          style={{ color: 'var(--bui-fg-secondary)', flexShrink: 0 }}
        />
        <span style={{ flex: 1, minWidth: 0 }}>
          <Text
            as="div"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            variant="body-small"
            weight="bold"
          >
            {attachment.filename}
          </Text>
          {size && (
            <Text as="div" color="secondary" variant="body-x-small">
              {size}
            </Text>
          )}
        </span>
        <Download
          size={16}
          style={{ color: 'var(--bui-fg-secondary)', flexShrink: 0 }}
        />
      </Flex>
    </a>
  );
};
