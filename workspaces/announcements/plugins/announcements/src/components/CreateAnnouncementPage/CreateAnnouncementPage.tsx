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
import { useNavigate } from 'react-router-dom';
import slugify from 'slugify';
import { Page, Header, Content } from '@backstage/core-components';
import { alertApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { rootRouteRef } from '../../routes';
import { AnnouncementForm } from '../AnnouncementForm';
import {
  CreateAnnouncementRequest,
  announcementsApiRef,
  useAnnouncementsTranslation,
  useCategories,
} from '@backstage-community/plugin-announcements-react';
import {
  Announcement,
  Category,
} from '@backstage-community/plugin-announcements-common';

type CreateAnnouncementPageProps = {
  themeId: string;
  title: string;
  subtitle?: ReactNode;
  defaultInactive?: boolean;
};

export const CreateAnnouncementPage = (props: CreateAnnouncementPageProps) => {
  const announcementsApi = useApi(announcementsApiRef);
  const rootPage = useRouteRef(rootRouteRef);
  const alertApi = useApi(alertApiRef);
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { t } = useAnnouncementsTranslation();

  const onSubmit = async (request: CreateAnnouncementRequest) => {
    const { category } = request;

    const slugs = categories.map((c: Category) => c.slug);
    let alertMsg = t('createAnnouncementPage.alertMessage') as string;

    try {
      if (category) {
        const categorySlug = slugify(category, {
          lower: true,
        });
        if (slugs.indexOf(categorySlug) === -1) {
          alertMsg = alertMsg.replace('.', '');
          alertMsg = `${alertMsg} ${t(
            'createAnnouncementPage.alertMessageWithNewCategory',
          )} ${category}.`;

          await announcementsApi.createCategory({
            title: category,
          });
        }
      }

      await announcementsApi.createAnnouncement({
        ...request,
        category: request.category?.toLocaleLowerCase('en-US'),
      });
      alertApi.post({ message: alertMsg, severity: 'success' });

      navigate(rootPage());
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }
  };

  return (
    <Page themeId={props.themeId}>
      <Header title={props.title} subtitle={props.subtitle} />

      <Content>
        <AnnouncementForm
          initialData={{ active: !props.defaultInactive } as Announcement}
          onSubmit={onSubmit}
        />
      </Content>
    </Page>
  );
};
