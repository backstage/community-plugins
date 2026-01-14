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
import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnnouncements } from '@backstage-community/plugin-announcements-react';
import { Pagination } from '@material-ui/lab';
import {
  Flex,
  Grid,
  Box,
  Skeleton,
  Text,
  Link,
  Card,
  CardBody,
} from '@backstage/ui';
import { AnnouncementCard } from './AnnouncementCard';

type AnnouncementsGridProps = {
  maxPerPage: number;
  category?: string;
  tags?: string[];
  active?: boolean;
  sortBy?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
  hideStartAt?: boolean;
};

export const AnnouncementsGrid = ({
  maxPerPage,
  category,
  tags,
  active,
  sortBy,
  order,
  hideStartAt,
}: AnnouncementsGridProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [page, setPage] = useState(1);
  const handleChange = (_event: any, value: number) => {
    setPage(value);
  };

  const tagsParam = queryParams.get('tags');
  const tagsFromUrl = useMemo(() => {
    return tagsParam ? tagsParam.split(',') : undefined;
  }, [tagsParam]);

  const { announcements, loading, error } = useAnnouncements(
    {
      max: maxPerPage,
      page: page,
      category,
      tags: tags || tagsFromUrl,
      active,
      sortBy,
      order,
    },
    { dependencies: [maxPerPage, page, category, tagsFromUrl] },
  );

  if (error) {
    return (
      <Card>
        <CardBody>
          <Text color="danger">Error loading announcements</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      {!loading ? (
        <Grid.Root columns={{ xs: '12', md: '2', lg: '3' }}>
          {announcements.results.length > 0 &&
            announcements.results.map(announcement => (
              <Grid.Item key={announcement.id}>
                <AnnouncementCard
                  announcement={announcement}
                  hideStartAt={hideStartAt}
                />
              </Grid.Item>
            ))}

          {announcements.results.length === 0 && (
            <Grid.Item>
              <Text>No announcements found with the selected filters.</Text>
            </Grid.Item>
          )}
        </Grid.Root>
      ) : (
        <Skeleton />
      )}

      {announcements.count > 0 && (
        <Flex justify="center" my="10">
          <Pagination
            count={Math.ceil(announcements.count / maxPerPage)}
            page={page}
            onChange={handleChange}
          />
        </Flex>
      )}
    </>
  );
};
