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
import { useState } from 'react';
import {
  useAnnouncements,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { Pagination } from '@material-ui/lab';
import { Flex, Grid, Skeleton, Text, Card, CardBody } from '@backstage/ui';
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
  const { t } = useAnnouncementsTranslation();

  const [page, setPage] = useState(1);
  const handleChange = (_event: any, value: number) => {
    setPage(value);
  };

  const { announcements, loading, error } = useAnnouncements({
    max: maxPerPage,
    page,
    category,
    tags,
    active,
    sortBy,
    order,
  });

  if (error) {
    return (
      <Card>
        <CardBody>
          <Text color="danger">
            {t('announcementsPage.errorLoadingAnnouncements')}
          </Text>
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
            <Grid.Item colSpan="12">
              <Card>
                <CardBody>
                  {category || tags ? (
                    <Text>
                      {t(
                        'announcementsPage.filter.noFilteredAnnouncementsFound',
                      )}
                    </Text>
                  ) : (
                    <Text>{t('announcementsPage.noAnnouncementsFound')}</Text>
                  )}
                </CardBody>
              </Card>
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
