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
import { useState, useMemo } from 'react';
import {
  HeaderPage,
  Card,
  CardBody,
  Flex,
  Grid,
  Box,
  Button,
  SearchField,
  Select,
  Link,
} from '@backstage/ui';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import { useAnnouncements } from '@backstage-community/plugin-announcements-react';
import EmptyState from './EmptyState';
import { AnnouncementCard } from './AnnouncementCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { AnnouncementDetailDialog } from './AnnouncementDetailDialog';

export type AnnouncementsPageProps = {
  themeId: string;
  title: string;
  maxPerPage?: number;
  category?: string;
  tags?: string[];
  hideContextMenu?: boolean;
  hideInactive?: boolean;
  hideStartAt?: boolean;
  // markdownRenderer?: MarkdownRendererTypeProps;
  sortby?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
};

export function AnnouncementsPage(props: AnnouncementsPageProps) {
  const {
    maxPerPage = 10,
    category,
    tags,
    sortby = 'created_at',
    order = 'desc',
  } = props;

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading] = useState(false);

  const { announcements } = useAnnouncements({
    max: maxPerPage,
    category,
    tags,
    sortBy: sortby,
    order,
  });

  const filteredAnnouncements = useMemo(() => {
    return announcements?.results
      .filter(announcement => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
            announcement.title.toLowerCase().includes(query) ||
            announcement.excerpt.toLowerCase().includes(query) ||
            announcement.tags?.some(tag =>
              tag.title.toLowerCase().includes(query),
            );
          if (!matchesSearch) return false;
        }

        // Category filter
        if (
          categoryFilter !== 'all' &&
          announcement.category?.slug !== categoryFilter
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  }, [searchQuery, categoryFilter, announcements?.results]);

  const emptyStateMessage: string = useMemo(() => {
    const hasAnnouncements = (announcements?.results?.length ?? 0) > 0;
    const hasActiveFilters = searchQuery || categoryFilter !== 'all';

    // TODO: Add translation

    if (!hasAnnouncements) {
      // TODO: Add translation
      const AdminLink = <Link href="/announcements/admin">Admin Portal</Link>;
      // return `Get started by creating an announcement in the ${AdminLink}.`;
      return `Get started by creating an announcement in the ${AdminLink}.`;
    }

    // Check for having announcements but none match the current filters
    if (hasActiveFilters) {
      // TODO: Add translation
      return 'No announcements match your search criteria. Try adjusting your filters.';
    }

    return 'There are no announcements at this time. Check back later!';
  }, [announcements?.results?.length, searchQuery, categoryFilter]);

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAnnouncement(null);
  };

  const categoryOptions = [{ value: 'all', label: 'All Categories' }];

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <HeaderPage
        title="Announcements"
        breadcrumbs={[{ label: 'Home', href: '/' }]}
      />

      <Box p="4">
        <Flex direction="column" gap="4">
          {/* Filters Section */}
          <Card>
            <CardBody>
              <Flex
                direction={{ xs: 'column', md: 'row' }}
                gap="3"
                align={{ xs: 'stretch', md: 'end' }}
              >
                <Box style={{ flex: 1 }}>
                  <SearchField
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    aria-label="Search announcements"
                  />
                </Box>
                <Flex gap="3">
                  <Select
                    name="Category"
                    placeholder="Select Category"
                    options={categoryOptions}
                  />
                </Flex>
              </Flex>
            </CardBody>
          </Card>

          {/* Results Count */}
          <Flex justify="between" align="center">
            {(searchQuery || categoryFilter !== 'all') && (
              <Button
                variant="tertiary"
                onPress={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Flex>

          {filteredAnnouncements.length ? (
            <Grid.Root columns={{ xs: '1', md: '2', lg: '3' }} gap="4">
              {filteredAnnouncements?.map(announcement => (
                <Grid.Item key={announcement.id}>
                  <AnnouncementCard
                    announcement={announcement}
                    onView={handleViewAnnouncement}
                  />
                </Grid.Item>
              ))}
            </Grid.Root>
          ) : (
            <Flex justify="center">
              <EmptyState message={emptyStateMessage} />
            </Flex>
          )}
        </Flex>
      </Box>

      {/* Detail Dialog */}
      <AnnouncementDetailDialog
        announcement={selectedAnnouncement}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </>
  );
}
