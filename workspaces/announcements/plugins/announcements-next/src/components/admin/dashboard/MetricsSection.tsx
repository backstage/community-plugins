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
import { useMemo } from 'react';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import { Card, CardBody, Flex, Grid, Text } from '@backstage/ui';
import {
  RiBook2Line,
  RiCheckboxCircleLine,
  RiCalendarLine,
  RiBookmarkLine,
  RiHashtag,
} from '@remixicon/react';

type MetricsSectionProps = {
  announcements: Announcement[];
  categoriesCount: number;
  tagsCount: number;
};

type MetricCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
};

const MetricCard = ({ label, value, icon }: MetricCardProps) => {
  return (
    <Card>
      <CardBody>
        <Flex direction="column" gap="2" align="center">
          <Flex align="center" gap="2">
            {icon}
            <Text style={{ fontSize: '2rem', fontWeight: 600 }}>{value}</Text>
          </Flex>
          <Text
            style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}
          >
            {label}
          </Text>
        </Flex>
      </CardBody>
    </Card>
  );
};

export const MetricsSection = (props: MetricsSectionProps) => {
  const { announcements, categoriesCount, tagsCount } = props;

  const metrics = useMemo(() => {
    const now = new Date();

    const total = announcements.length;
    const active = announcements.filter(a => a.active).length;
    const upcoming = announcements.filter(
      a => new Date(a.start_at) > now,
    ).length;

    return {
      total,
      active,
      upcoming,
      categories: categoriesCount,
      tags: tagsCount,
    };
  }, [announcements, categoriesCount, tagsCount]);

  return (
    <Grid.Root columns={{ xs: '2', sm: '3', md: '5' }} gap="4">
      <Grid.Item>
        <MetricCard
          label="Total"
          value={metrics.total}
          icon={<RiBook2Line size={24} />}
        />
      </Grid.Item>
      <Grid.Item>
        <MetricCard
          label="Active"
          value={metrics.active}
          icon={<RiCheckboxCircleLine size={24} />}
        />
      </Grid.Item>
      <Grid.Item>
        <MetricCard
          label="Upcoming"
          value={metrics.upcoming}
          icon={<RiCalendarLine size={24} />}
        />
      </Grid.Item>
      <Grid.Item>
        <MetricCard
          label="Categories"
          value={metrics.categories}
          icon={<RiBookmarkLine size={24} />}
        />
      </Grid.Item>
      <Grid.Item>
        <MetricCard
          label="Tags"
          value={metrics.tags}
          icon={<RiHashtag size={24} />}
        />
      </Grid.Item>
    </Grid.Root>
  );
};
