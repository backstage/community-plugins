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

import { Announcement } from '@backstage-community/plugin-announcements-common';
import {
  Card,
  CardHeader,
  Flex,
  TagGroup,
  Tag,
  CardBody,
  CardFooter,
  Avatar,
  Button,
  Text,
} from '@backstage/ui';
import { formatRelativeTime } from '../utils';

interface AnnouncementCardProps {
  announcement: Announcement;
  onView: (announcement: Announcement) => void;
}

export function AnnouncementCard({
  announcement,
  onView,
}: AnnouncementCardProps) {
  const category = announcement.category ?? {
    slug: 'general',
    title: 'General',
  };

  return (
    <Card>
      <CardHeader>
        <Flex direction="column" gap="2">
          <Flex justify="between" align="center">
            <TagGroup aria-label="Announcement tags">
              <Tag size="small">{category.title}</Tag>
            </TagGroup>
            <Text as="span" variant="body-medium" color="secondary">
              {formatRelativeTime(announcement.created_at)}
            </Text>
          </Flex>
          <Text as="h3" variant="body-large" weight="bold">
            {announcement.title}
          </Text>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex direction="column" gap="3">
          <Text color="secondary">{announcement.excerpt}</Text>
          {announcement.tags && announcement.tags.length > 0 && (
            <Flex gap="2" style={{ flexWrap: 'wrap' }}>
              {announcement.tags.map(tag => (
                <Text
                  key={tag.slug}
                  as="span"
                  variant="body-medium"
                  color="secondary"
                >
                  #{tag.title}
                </Text>
              ))}
            </Flex>
          )}
        </Flex>
      </CardBody>
      <CardFooter>
        <Flex justify="between" align="center" style={{ width: '100%' }}>
          <Flex align="center" gap="2">
            <Avatar size="small" name={announcement.publisher} src="" />
            <Text as="span" variant="body-medium">
              {announcement.publisher}
            </Text>
          </Flex>
          <Button variant="tertiary" onPress={() => onView(announcement)}>
            Read More
          </Button>
        </Flex>
      </CardFooter>
    </Card>
  );
}
