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
import { useLocation } from 'react-router-dom';
import { useAnnouncementsPermissions } from '@backstage-community/plugin-announcements-react';
import { Container, HeaderPage } from '@backstage/ui';

import { AnnouncementsGrid } from './AnnouncementsGrid';
import { ContextMenu } from './ContextMenu';
import { MarkdownRendererTypeProps } from '../../../components';

export type AnnouncementsPageProps = {
  title: string;
  maxPerPage?: number;
  category?: string;
  tags?: string[];
  hideInactive?: boolean;
  hideStartAt?: boolean;
  markdownRenderer?: MarkdownRendererTypeProps;
  sortby?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
};

export const AnnouncementsPage = (props: AnnouncementsPageProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const permissions = useAnnouncementsPermissions();

  const {
    hideInactive,
    hideStartAt,
    title,
    maxPerPage,
    category,
    sortby,
    order,
  } = props;

  const canManageAnnouncements =
    !permissions.create.loading && permissions.create.allowed;

  return (
    <>
      <HeaderPage
        title={title ?? 'Announcements'}
        customActions={canManageAnnouncements && <ContextMenu />}
        breadcrumbs={[{ label: 'Home', href: '/' }]}
      />

      <Container>
        <AnnouncementsGrid
          maxPerPage={maxPerPage ?? 10}
          category={category ?? queryParams.get('category') ?? undefined}
          tags={props.tags}
          active={!!hideInactive}
          sortBy={sortby ?? 'created_at'}
          order={order ?? 'desc'}
          hideStartAt={hideStartAt}
        />
      </Container>
    </>
  );
};
