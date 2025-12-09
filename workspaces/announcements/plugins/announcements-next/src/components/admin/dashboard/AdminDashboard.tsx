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
import { useState } from 'react';
import { ErrorPanel, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  announcementsApiRef,
  useCategories,
  useTags,
} from '@backstage-community/plugin-announcements-react';
import { announcementCreatePermission } from '@backstage-community/plugin-announcements-common';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { Box, Button, Container, Flex, Grid } from '@backstage/ui';

import { AnnouncementsSection } from './AnnouncementsSection';
import { CategoriesSection } from './CategoriesSection';
import { TagsSection } from './TagsSection';
import { MetricsSection } from './MetricsSection';

type AdminDashboardProps = {
  defaultInactive?: boolean;
};

export const AdminDashboard = (props: AdminDashboardProps) => {
  const { defaultInactive } = props;

  const announcementsApi = useApi(announcementsApiRef);
  const [searchText] = useState('');

  const {
    loading: announcementsLoading,
    error: announcementsError,
    value: announcements,
    retry: retryAnnouncements,
  } = useAsyncRetry(async () => await announcementsApi.announcements({}));

  const {
    loading: categoriesLoading,
    error: categoriesError,
    categories,
    retry: retryCategories,
  } = useCategories();

  const {
    loading: tagsLoading,
    error: tagsError,
    tags,
    retry: retryTags,
  } = useTags();

  const handleRefresh = () => {
    retryAnnouncements();
    retryCategories();
    retryTags();
  };

  if (announcementsLoading || categoriesLoading || tagsLoading) {
    return <Progress />;
  }

  if (announcementsError || categoriesError || tagsError) {
    const error = announcementsError || categoriesError || tagsError;
    return <ErrorPanel error={error!} />;
  }

  return (
    <RequirePermission permission={announcementCreatePermission}>
      <Container mb="4">
        <Grid.Root columns="12">
          <Grid.Item colSpan="12">
            <MetricsSection
              announcements={announcements?.results ?? []}
              categoriesCount={categories?.length ?? 0}
              tagsCount={tags?.length ?? 0}
            />
          </Grid.Item>

          <Grid.Item colSpan="12">
            <Flex justify="end">
              <Button variant="primary">Create Announcement</Button>
              <Button variant="primary">Create Category</Button>
              <Button variant="primary">Create Tag</Button>
            </Flex>
          </Grid.Item>

          <Grid.Item colSpan="9">
            <AnnouncementsSection
              announcements={announcements?.results ?? []}
              searchText={searchText}
              defaultInactive={defaultInactive}
              onRefresh={handleRefresh}
            />
          </Grid.Item>

          <Grid.Item colSpan="3">
            <Flex direction="column" gap="2">
              <CategoriesSection onRefresh={handleRefresh} />
              <TagsSection onRefresh={handleRefresh} />
            </Flex>
          </Grid.Item>
        </Grid.Root>
      </Container>
    </RequirePermission>
  );
};
