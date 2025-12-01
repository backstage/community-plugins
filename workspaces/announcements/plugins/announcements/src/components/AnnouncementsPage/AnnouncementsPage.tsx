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
import { useState, ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { usePermission } from '@backstage/plugin-permission-react';
import {
  announcementCreatePermission,
  Announcement,
} from '@backstage-community/plugin-announcements-common';
import { DateTime } from 'luxon';
import {
  Page,
  Header,
  Content,
  Link,
  ItemCardGrid,
  Progress,
} from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import {
  useAnnouncements,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { Alert, Pagination } from '@material-ui/lab';

import { announcementViewRouteRef, rootRouteRef } from '../../routes';
import { ContextMenu } from './ContextMenu';
import { formatAnnouncementStartTime } from '../utils/announcementDateUtils';
import { MarkdownRendererTypeProps } from '../MarkdownRenderer/MarkdownRenderer';
import { truncate } from '../utils/truncateUtils';

const useStyles = makeStyles(theme => {
  return {
    cardHeader: {
      color: theme?.palette?.text?.primary || '#000',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: theme?.spacing?.(4) || 32,
    },
  };
});

const AnnouncementCard = ({
  announcement,
  options: { titleLength = 50 },
  hideStartAt,
}: {
  announcement: Announcement;
  options: AnnouncementCardProps;
  hideStartAt?: boolean;
}) => {
  const classes = useStyles();
  const announcementsLink = useRouteRef(rootRouteRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const { t } = useAnnouncementsTranslation();

  const title = (
    <Tooltip
      title={announcement.title}
      disableFocusListener
      data-testid="announcement-card-title-tooltip"
    >
      <Link
        className={classes.cardHeader}
        to={viewAnnouncementLink({ id: announcement.id })}
      >
        {truncate(announcement.title, titleLength)}
      </Link>
    </Tooltip>
  );
  const subTitle = (
    <>
      <Typography variant="body2" color="textSecondary" component="span">
        {t('announcementsPage.card.by')}{' '}
        <EntityRefLink
          entityRef={announcement.on_behalf_of || announcement.publisher}
          hideIcon
        />
        {announcement.category && (
          <>
            {' '}
            {t('announcementsPage.card.in')}{' '}
            <Link
              to={`${announcementsLink()}?category=${
                announcement.category.slug
              }`}
            >
              {announcement.category.title}
            </Link>
          </>
        )}
        , {DateTime.fromISO(announcement.created_at).toRelative()}
      </Typography>
      <Box>
        {!hideStartAt && (
          <Typography variant="caption" color="textSecondary">
            {formatAnnouncementStartTime(
              announcement.start_at,
              t('announcementsCard.occurred'),
              t('announcementsCard.scheduled'),
              t('announcementsCard.today'),
            )}
          </Typography>
        )}
      </Box>
      {announcement.tags && announcement.tags.length > 0 && (
        <Typography variant="body2" color="textSecondary">
          <Box mt={1}>
            {announcement.tags.map(tag => (
              <Chip
                key={tag.slug}
                size="small"
                label={tag.title}
                component={Link}
                to={`${announcementsLink()}?tags=${tag.slug}`}
                clickable
                style={{ marginRight: 4, marginBottom: 4 }}
              />
            ))}
          </Box>
        </Typography>
      )}
    </>
  );

  return (
    <Card>
      <CardHeader title={title} subheader={subTitle} />
      <CardContent>{announcement.excerpt}</CardContent>
    </Card>
  );
};

const AnnouncementsGrid = ({
  maxPerPage,
  category,
  tags,
  cardTitleLength,
  active,
  sortBy,
  order,
  hideStartAt,
}: {
  maxPerPage: number;
  category?: string;
  tags?: string[];
  cardTitleLength?: number;
  active?: boolean;
  sortBy?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
  hideStartAt?: boolean;
}) => {
  const classes = useStyles();
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

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <>
      <ItemCardGrid>
        {announcements.results.map(announcement => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            options={{ titleLength: cardTitleLength }}
            hideStartAt={hideStartAt}
          />
        ))}
      </ItemCardGrid>

      {announcements && announcements.count !== 0 && (
        <div className={classes.pagination}>
          <Pagination
            count={Math.ceil(announcements.count / maxPerPage)}
            page={page}
            onChange={handleChange}
          />
        </div>
      )}
    </>
  );
};

type AnnouncementCardProps = {
  titleLength?: number;
};

type AnnouncementCreateButtonProps = {
  name?: string;
};

export type AnnouncementsPageProps = {
  themeId: string;
  title: string;
  subtitle?: ReactNode;
  maxPerPage?: number;
  category?: string;
  tags?: string[];
  buttonOptions?: AnnouncementCreateButtonProps;
  cardOptions?: AnnouncementCardProps;
  hideContextMenu?: boolean;
  hideInactive?: boolean;
  hideStartAt?: boolean;
  markdownRenderer?: MarkdownRendererTypeProps;
  sortby?: 'created_at' | 'start_at';
  order?: 'asc' | 'desc';
};

export const AnnouncementsPage = (props: AnnouncementsPageProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { loading: loadingCreatePermission, allowed: canCreate } =
    usePermission({ permission: announcementCreatePermission });

  const {
    hideContextMenu,
    hideInactive,
    hideStartAt,
    themeId,
    title,
    subtitle,
    maxPerPage,
    category,
    cardOptions,
    sortby,
    order,
  } = props;

  return (
    <Page themeId={themeId}>
      <Header title={title} subtitle={subtitle}>
        {!hideContextMenu && !loadingCreatePermission && canCreate && (
          <ContextMenu />
        )}
      </Header>

      <Content>
        <AnnouncementsGrid
          maxPerPage={maxPerPage ?? 10}
          category={category ?? queryParams.get('category') ?? undefined}
          tags={props.tags}
          cardTitleLength={cardOptions?.titleLength}
          active={!!hideInactive}
          sortBy={sortby ?? 'created_at'}
          order={order ?? 'desc'}
          hideStartAt={hideStartAt}
        />
      </Content>
    </Page>
  );
};
