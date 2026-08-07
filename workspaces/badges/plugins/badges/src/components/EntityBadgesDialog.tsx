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

import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import {
  Button,
  Text,
  Select,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@backstage/ui';
import { Key, useState } from 'react';
import useAsync from 'react-use/esm/useAsync';
import { BadgeStyle, BADGE_STYLES, badgesApiRef } from '../api';

import {
  CodeSnippet,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

export const EntityBadgesDialog = (props: {
  open: boolean;
  onClose?: () => any;
}) => {
  const { open, onClose } = props;
  const { entity } = useAsyncEntity();
  const badgesApi = useApi(badgesApiRef);

  const [style, setStyle] = useState<BadgeStyle | null>(null);

  const {
    value: badges,
    loading,
    error,
  } = useAsync(async () => {
    if (open && entity) {
      return await badgesApi.getEntityBadgeSpecs(entity, {
        style: style ?? undefined,
      });
    }
    return [];
  }, [badgesApi, entity, open, style]);

  const selectOptions = [
    { value: '', label: 'Default' },
    ...BADGE_STYLES.map(s => ({ value: s, label: s })),
  ];

  const handleStyleChange = (value: Key | Key[] | null) => {
    const stringValue = Array.isArray(value)
      ? String(value[0] ?? '')
      : String(value ?? '');
    setStyle(stringValue === '' ? null : (stringValue as BadgeStyle));
  };

  return (
    <DialogTrigger
      isOpen={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen && onClose) onClose();
      }}
    >
      <Dialog isDismissable>
        <DialogHeader>
          <Text variant="title-large">Entity Badges</Text>
        </DialogHeader>
        <DialogBody>
          <div style={{ marginBottom: 'var(--bui-space-4)' }}>
            <Text>
              Embed badges in other web sites that link back to this entity.
              Copy the relevant snippet of Markdown code to use the badge.
            </Text>
          </div>

          <div style={{ marginBottom: 'var(--bui-space-4)' }}>
            <Text variant="body-medium">Select Badge Style</Text>
            <div style={{ marginTop: 'var(--bui-space-2)' }}>
              <Select
                name="badge-style"
                label={null}
                placeholder="Select style"
                value={style ?? ''}
                onChange={handleStyleChange}
                options={selectOptions}
              />
            </div>
          </div>

          {loading && <Progress />}
          {error && <ResponseErrorPanel error={error} />}

          {badges && badges.length > 0 && (
            <div style={{ marginTop: 'var(--bui-space-6)' }}>
              <Text variant="body-medium">Badge Previews</Text>
              {badges.map(({ badge: { description }, id, url, markdown }) => (
                <div
                  key={id}
                  style={{
                    marginTop: 'var(--bui-space-4)',
                    marginBottom: 'var(--bui-space-4)',
                  }}
                >
                  <div style={{ marginBottom: 'var(--bui-space-2)' }}>
                    <img alt={description || id} src={url} />
                  </div>
                  <CodeSnippet
                    language="markdown"
                    text={markdown}
                    showCopyCodeButton
                  />
                </div>
              ))}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
};
