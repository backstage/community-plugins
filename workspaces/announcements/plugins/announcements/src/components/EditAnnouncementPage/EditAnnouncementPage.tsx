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
import useAsync from 'react-use/esm/useAsync';
import { Page, Header, Content, Progress } from '@backstage/core-components';
import {
  alertApiRef,
  useApi,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { AnnouncementForm } from '../AnnouncementForm';
import { announcementEditRouteRef } from '../../routes';
import {
  announcementsApiRef,
  CreateAnnouncementRequest,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { Alert } from '@material-ui/lab';

type EditAnnouncementPageProps = {
  themeId: string;
  title: string;
  subtitle?: ReactNode;
};

export const EditAnnouncementPage = (props: EditAnnouncementPageProps) => {
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const { id } = useRouteRefParams(announcementEditRouteRef);
  const { value, loading, error } = useAsync(async () =>
    announcementsApi.announcementByID(id),
  );
  const { t } = useAnnouncementsTranslation();

  let title = props.title;
  let content: ReactNode = <Progress />;

  const onSubmit = async (request: CreateAnnouncementRequest) => {
    try {
      await announcementsApi.updateAnnouncement(id, request);
      alertApi.post({
        message: t('editAnnouncementPage.updatedMessage'),
        severity: 'success',
      });
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  if (loading) {
    content = <Progress />;
  } else if (error) {
    content = <Alert severity="error">{error.message}</Alert>;
  } else if (!value) {
    content = (
      <Alert severity="error">
        {t('editAnnouncementPage.notFoundMessage')}
      </Alert>
    );
  } else {
    title = `${t('editAnnouncementPage.edit')} "${value.title}" – ${title}`;
    content = <AnnouncementForm initialData={value} onSubmit={onSubmit} />;
  }

  return (
    <Page themeId={props.themeId}>
      <Header title={title} subtitle={props.subtitle} />

      <Content>{content}</Content>
    </Page>
  );
};
