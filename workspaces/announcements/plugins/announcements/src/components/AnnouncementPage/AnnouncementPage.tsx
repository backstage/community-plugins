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
import { ReactNode } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { DateTime } from 'luxon';
import {
  Progress,
  Page,
  Header,
  Content,
  InfoCard,
} from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { announcementViewRouteRef, rootRouteRef } from '../../routes';
import { announcementsApiRef } from '@backstage-community/plugin-announcements-react';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import { Grid, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  MarkdownRenderer,
  MarkdownRendererTypeProps,
} from '../MarkdownRenderer';

const AnnouncementDetails = ({
  announcement,
  markdownRenderer,
}: {
  announcement: Announcement;
  markdownRenderer?: MarkdownRendererTypeProps;
}) => {
  const announcementsLink = useRouteRef(rootRouteRef);
  const deepLink = {
    link: announcementsLink(),
    title: 'Back to announcements',
  };
  const subHeader = (
    <Typography>
      By{' '}
      <EntityRefLink
        entityRef={announcement.on_behalf_of || announcement.publisher}
        hideIcon
      />
      , {DateTime.fromISO(announcement.created_at).toRelative()}
    </Typography>
  );

  return (
    <InfoCard
      title={announcement.title}
      subheader={subHeader}
      deepLink={deepLink}
    >
      <MarkdownRenderer
        content={announcement.body}
        rendererType={markdownRenderer}
      />
    </InfoCard>
  );
};

type AnnouncementPageProps = {
  themeId: string;
  title: string;
  subtitle?: ReactNode;
  markdownRenderer?: MarkdownRendererTypeProps;
};

export const AnnouncementPage = (props: AnnouncementPageProps) => {
  const announcementsApi = useApi(announcementsApiRef);
  const { id } = useRouteRefParams(announcementViewRouteRef);
  const { value, loading, error } = useAsync(
    async () => announcementsApi.announcementByID(id),
    [id],
  );

  let title = props.title;
  let content: ReactNode;

  if (loading) {
    content = <Progress />;
  } else if (error) {
    content = <Alert severity="error">{error.message}</Alert>;
  } else {
    title = `${value!.title} – ${title}`;
    content = (
      <AnnouncementDetails
        announcement={value!}
        markdownRenderer={props.markdownRenderer}
      />
    );

    const lastSeen = announcementsApi.lastSeenDate();
    const announcementCreatedAt = DateTime.fromISO(value!.created_at);

    if (announcementCreatedAt > lastSeen) {
      announcementsApi.markLastSeenDate(announcementCreatedAt);
    }
  }

  return (
    <Page themeId={props.themeId}>
      <Header title={title} subtitle={props.subtitle} />

      <Content>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item sm={6}>
            {content}
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
