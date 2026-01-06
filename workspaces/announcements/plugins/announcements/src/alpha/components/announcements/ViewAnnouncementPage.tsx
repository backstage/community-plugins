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
import { RiArrowLeftLine, RiHashtag, RiPriceTag3Line } from '@remixicon/react';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import {
  announcementsApiRef,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import {
  Announcement,
  Tag as AnnouncementTag,
  Category,
} from '@backstage-community/plugin-announcements-common';

import { announcementViewRouteRef, rootRouteRef } from '../../../routes';
import {
  MarkdownRenderer,
  MarkdownRendererTypeProps,
} from '../../../components';

const AnnouncementCategoryBadge = (props: {
  category: Category | undefined;
}) => {
  const { category } = props;
  const announcementsLink = useRouteRef(rootRouteRef);

  if (!category) {
    return null;
  }

  return (
    <Link
      href={`${announcementsLink()}?category=${category.slug}`}
      color="secondary"
      variant="body-small"
    >
      <Flex align="center" gap="2">
        <RiPriceTag3Line size={16} /> {category?.title}
      </Flex>
    </Link>
  );
};

const AnnouncementTagsTagGroup = (props: { tags: AnnouncementTag[] }) => {
  const announcementsLink = useRouteRef(rootRouteRef);
  const { t } = useAnnouncementsTranslation();
  return (
    <TagGroup aria-label={t('viewAnnouncementPage.tagsAriaLabel')}>
      {props.tags.map(tag => (
        <Tag
          key={tag.slug}
          size="small"
          href={`${announcementsLink()}?tag=${tag.slug}`}
        >
          <RiHashtag size={10} /> {tag.title}
        </Tag>
      ))}
    </TagGroup>
  );
};

const BackToAnnouncementsButton = () => {
  const announcementsLink = useRouteRef(rootRouteRef);
  const { t } = useAnnouncementsTranslation();
  return (
    <Link href={announcementsLink()} color="secondary" variant="body-x-small">
      <Flex align="center" gap="2">
        <RiArrowLeftLine size={16} />
        <Text variant="body-small">
          {' '}
          {t('viewAnnouncementPage.backToAnnouncements')}
        </Text>
      </Flex>
    </Link>
  );
};

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
  const { t } = useAnnouncementsTranslation();

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
          <Flex justify="between" pb="3">
            <AnnouncementCategoryBadge category={category} />

            <Text variant="body-small" as="p">
              {DateTime.fromISO(created_at).toRelative()}
            </Text>
          </Flex>
          <Text variant="title-medium" as="h2">
            {title}
          </Text>

          <Text variant="body-small" as="p">
            {t('announcementsPage.card.by')}{' '}
            <EntityRefLink entityRef={on_behalf_of || publisher} hideIcon />
          </Text>
        </CardHeader>
      </Box>

      <CardBody>
        <AnnouncementTagsTagGroup tags={tags ?? []} />
        <MarkdownRenderer content={body} rendererType={markdownRenderer} />
      </CardBody>
    </Card>
  );
};

type ViewAnnouncementPageProps = {
  title: string;
  markdownRenderer?: MarkdownRendererTypeProps;
};

export const ViewAnnouncementPage = (props: ViewAnnouncementPageProps) => {
  const { id } = useRouteRefParams(announcementViewRouteRef);
  const announcementsApi = useApi(announcementsApiRef);
  const { t } = useAnnouncementsTranslation();

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
    return <Alert severity="error">{t('viewAnnouncementPage.notFound')}</Alert>;
  }

  return (
    <>
      <HeaderPage
        title={`${announcement.title ?? ''}`}
        breadcrumbs={[
          { label: t('viewAnnouncementPage.home'), href: '/' },
          {
            label: t('announcementsCard.announcements'),
            href: announcementsLink(),
          },
        ]}
      />

      <Container mb="10">
        <Grid.Root columns="1" p="2">
          <Grid.Item>
            <BackToAnnouncementsButton />
          </Grid.Item>

          <Grid.Item>
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
