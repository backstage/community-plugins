/*
 * Copyright 2024 The Backstage Authors
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
import { DateTime } from 'luxon';
import { useRouteRef } from '@backstage/core-plugin-api';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';
import {
  Box,
  CardFooter,
  Text,
  Card,
  CardHeader,
  CardBody,
  Link,
  Tag,
  TagGroup,
  Flex,
} from '@backstage/ui';
import { formatAnnouncementStartTime } from '../../../components/utils/announcementDateUtils';
import { rootRouteRef, announcementViewRouteRef } from '../../../routes';

type AnnouncementCardProps = {
  announcement: Announcement;
  hideStartAt?: boolean;
};

export const AnnouncementCard = ({
  announcement,
  hideStartAt,
}: AnnouncementCardProps) => {
  const announcementsLink = useRouteRef(rootRouteRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const { t } = useAnnouncementsTranslation();

  const subTitle = (
    <Box mt="1">
      <Text variant="body-small" as="span">
        {t('announcementsPage.card.by')}{' '}
        <EntityRefLink
          entityRef={announcement.on_behalf_of || announcement.publisher}
          hideIcon
        />
        {announcement.category && (
          <>
            {' '}
            {t('announcementsPage.card.in')}{' '}
            <Link
              href={`${announcementsLink()}?category=${
                announcement.category.slug
              }`}
            >
              {announcement.category.title}
            </Link>
          </>
        )}
        , {DateTime.fromISO(announcement.created_at).toRelative()}
      </Text>

      {!hideStartAt && (
        <Text variant="body-x-small" as="p">
          {formatAnnouncementStartTime(
            announcement.start_at,
            t('announcementsCard.occurred'),
            t('announcementsCard.scheduled'),
            t('announcementsCard.today'),
          )}
        </Text>
      )}
    </Box>
  );

  return (
    <Card>
      <CardHeader>
        <Flex direction="column" gap="2">
          <Link
            variant="title-x-small"
            href={viewAnnouncementLink({ id: announcement.id })}
            truncate
          >
            {announcement.title}
          </Link>

          {subTitle}
        </Flex>
      </CardHeader>

      <CardBody>
        <Text>{announcement.excerpt}</Text>
      </CardBody>

      <CardFooter>
        {announcement.tags && announcement.tags.length > 0 && (
          <TagGroup aria-label="Announcement Tags">
            {announcement.tags.map(tag => (
              <Tag
                key={tag.slug}
                size="small"
                href={`${announcementsLink()}?tags=${tag.slug}`}
              >
                {tag.title}
              </Tag>
            ))}
          </TagGroup>
        )}
      </CardFooter>
    </Card>
  );
};
