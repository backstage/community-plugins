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
import { useSearchParams } from 'react-router-dom';
import {
  useAnnouncementsPermissions,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { Container, Flex, HeaderPage } from '@backstage/ui';

import { AnnouncementsGrid } from './AnnouncementsGrid';
import { AnnouncementsFilterBar } from './AnnouncementsFilterBar';
import { ContextMenu } from './ContextMenu';
import { MarkdownRendererTypeProps } from '../../../components';

export type AnnouncementsPageProps = {
  title: string;
  maxPerPage?: number;
  /**
   * @deprecated Use URL state (e.g. ?category=...) to filter category instead.
   */
  category?: string;
  tags?: string[];
  hideStartAt?: boolean;
  markdownRenderer?: MarkdownRendererTypeProps;
  sortby?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
};

export const AnnouncementsPage = (props: AnnouncementsPageProps) => {
  const [searchParams] = useSearchParams();
  const permissions = useAnnouncementsPermissions();
  const { t } = useAnnouncementsTranslation();

  const { hideStartAt, title, maxPerPage, category, sortby, order, tags } =
    props;

  const canManageAnnouncements =
    !permissions.create.loading && permissions.create.allowed;

  return (
    <>
      <HeaderPage
        title={title ?? t('announcementsPage.announcements')}
        customActions={canManageAnnouncements && <ContextMenu />}
      />

      <Container>
        <Flex direction="column">
          <AnnouncementsFilterBar />
          <AnnouncementsGrid
            maxPerPage={maxPerPage ?? 10}
            category={category ?? searchParams.get('category') ?? undefined}
            tags={
              tags ??
              (searchParams.get('tags')
                ? searchParams.get('tags')?.split(',')
                : undefined)
            }
            sortBy={sortby ?? 'created_at'}
            order={order ?? 'desc'}
            hideStartAt={hideStartAt}
            active
          />
        </Flex>
      </Container>
    </>
  );
};
