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
import {
  Flex,
  Text,
  TagGroup,
  Tag,
  Dialog,
  DialogHeader,
  DialogBody,
  Avatar,
} from '@backstage/ui';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import { formatDate } from '../utils';

interface AnnouncementDetailDialogProps {
  announcement: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnnouncementDetailDialog({
  announcement,
  isOpen,
  onClose,
}: AnnouncementDetailDialogProps) {
  if (!announcement) return null;

  const category = announcement.category ?? {
    slug: 'general',
    title: 'General',
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={open => !open && onClose()}
      width="800px"
    >
      <DialogHeader>
        <Flex direction="column" gap="2">
          <TagGroup aria-label="Announcement tags">
            <Tag size="small">{category.title}</Tag>
          </TagGroup>
          <Text as="h2" variant="title-medium">
            {announcement.title}
          </Text>
        </Flex>
      </DialogHeader>
      <DialogBody>
        <Flex direction="column" gap="4">
          <Flex align="center" gap="3">
            <Avatar size="medium" name={announcement.publisher} src="" />
            <Flex direction="column">
              <Text weight="bold">{announcement.publisher}</Text>
              <Text as="span" variant="body-medium" color="secondary">
                Published on {formatDate(announcement.created_at)}
              </Text>
            </Flex>
          </Flex>
          <Text>{announcement.body}</Text>
          {announcement.tags && announcement.tags.length > 0 && (
            <TagGroup aria-label="Announcement tags">
              {announcement.tags.map(tag => (
                <Tag key={tag.slug} size="small">
                  #{tag.title}
                </Tag>
              ))}
            </TagGroup>
          )}
          {announcement.until_date && (
            <Text as="span" variant="body-medium" color="secondary">
              This announcement expires on {formatDate(announcement.until_date)}
            </Text>
          )}
        </Flex>
      </DialogBody>
    </Dialog>
  );
}
