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

import { useRouteRef } from '@backstage/frontend-plugin-api';
import {
  Box,
  CardFooter,
  Text,
  Card,
  CardHeader,
  CardBody,
  Link,
  Flex,
} from '@backstage/ui';

import { Announcement } from '@backstage-community/plugin-announcements-common';
import { useAnnouncementsTranslation } from '@backstage-community/plugin-announcements-react';

import { formatAnnouncementStartTime } from '../../../components/utils/announcementDateUtils';
import { announcementViewRouteRef } from '../../../routes';
import { AnnouncementPublishedBy, AnnouncementTags } from '../shared';

type AnnouncementCardProps = {
  announcement: Announcement;
  hideStartAt?: boolean;
};

export const AnnouncementCard = ({
  announcement,
  hideStartAt,
}: AnnouncementCardProps) => {
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const { t } = useAnnouncementsTranslation();

  const subTitle = (
    <Box mt="1">
      <AnnouncementPublishedBy announcement={announcement} />

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
            href={viewAnnouncementLink?.({ id: announcement.id })}
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
        <AnnouncementTags tags={announcement.tags} />
      </CardFooter>
    </Card>
  );
};
