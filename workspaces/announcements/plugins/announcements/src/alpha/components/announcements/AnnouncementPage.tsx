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
import { useEffect } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { DateTime } from 'luxon';
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  HeaderPage,
  Link,
  Text,
  Grid,
  Box,
  Skeleton,
  Tag,
  TagGroup,
} from '@backstage/ui';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
  useAnalytics,
} from '@backstage/core-plugin-api';
import { Alert } from '@material-ui/lab';
import { RiArrowLeftLine } from '@remixicon/react';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { Announcement } from '@backstage-community/plugin-announcements-common';

import { announcementViewRouteRef, rootRouteRef } from '../../../routes';
import {
  MarkdownRenderer,
  MarkdownRendererTypeProps,
} from '../../../components';

type AnnouncementDetailsCardProps = {
  announcement: Announcement;
  markdownRenderer?: MarkdownRendererTypeProps;
};

const AnnouncementDetailsCard = (props: AnnouncementDetailsCardProps) => {
  const { announcement, markdownRenderer } = props;
  const { title, category, body, created_at, on_behalf_of, publisher, tags } =
    announcement;

  const announcementsApi = useApi(announcementsApiRef);
  const analytics = useAnalytics();

  const lastSeen = announcementsApi.lastSeenDate();
  const announcementCreatedAt = DateTime.fromISO(created_at);

  if (announcementCreatedAt > lastSeen) {
    announcementsApi.markLastSeenDate(announcementCreatedAt);
  }

  useEffect(() => {
    if (!announcement) {
      return;
    }

    analytics.captureEvent('view', announcement.title, {
      attributes: {
        announcementId: announcement.id,
        location: 'AnnouncementPage',
      },
    });
  }, [analytics, announcement]);

  return (
    <Card>
      <Box
        style={{
          borderBottom: 'solid 1px #e0e0e0',
          paddingBottom: 16,
          paddingRight: 8,
        }}
      >
        <CardHeader>
          <Flex justify="between">
            <Text variant="title-medium" as="h2">
              {category?.title && (
                <Text variant="body-small" as="p">
                  {category?.title}
                </Text>
              )}
              {title}
            </Text>

            <Text variant="body-small" as="p">
              {DateTime.fromISO(created_at).toRelative()}
            </Text>
          </Flex>

          <Flex direction="column" gap="2">
            <Text variant="body-small" as="p">
              By{' '}
              <EntityRefLink entityRef={on_behalf_of || publisher} hideIcon />
            </Text>

            {tags && tags.length > 0 && (
              <Text variant="body-small" as="p">
                <TagGroup aria-label="Announcement Tags">
                  {tags.map(tag => (
                    <Tag key={tag.slug} size="small">
                      #{tag.title}
                    </Tag>
                  ))}
                </TagGroup>
              </Text>
            )}
          </Flex>
        </CardHeader>
      </Box>

      <CardBody>
        <MarkdownRenderer content={body} rendererType={markdownRenderer} />
      </CardBody>
    </Card>
  );
};

type ViewAnnouncementPageProps = {
  title: string;
  markdownRenderer?: MarkdownRendererTypeProps;
};

const BackToAnnouncementsButton = () => {
  const announcementsLink = useRouteRef(rootRouteRef);
  return (
    <Link href={announcementsLink()} color="secondary" variant="body-x-small">
      <Flex align="center" gap="2">
        <RiArrowLeftLine size={16} />
        <Text variant="body-x-small"> Back to announcements</Text>
      </Flex>
    </Link>
  );
};

export const ViewAnnouncementPage = (props: ViewAnnouncementPageProps) => {
  const { id } = useRouteRefParams(announcementViewRouteRef);
  const announcementsApi = useApi(announcementsApiRef);

  const announcementsLink = useRouteRef(rootRouteRef);

  const {
    value: announcement,
    loading,
    error,
  } = useAsync(async () => announcementsApi.announcementByID(id), [id]);

  if (loading) {
    return <Skeleton />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  } else if (!announcement) {
    return <Alert severity="error">Announcement not found</Alert>;
  }

  return (
    <>
      <HeaderPage
        title={`${announcement.title ?? ''}`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Announcements', href: announcementsLink() },
        ]}
      />

      <Container>
        <Grid.Root columns="1">
          <Grid.Item colSpan="1">
            <BackToAnnouncementsButton />
          </Grid.Item>

          <Grid.Item colSpan="1">
            <AnnouncementDetailsCard
              announcement={announcement}
              markdownRenderer={props.markdownRenderer}
            />
          </Grid.Item>
        </Grid.Root>
      </Container>
    </>
  );
};
