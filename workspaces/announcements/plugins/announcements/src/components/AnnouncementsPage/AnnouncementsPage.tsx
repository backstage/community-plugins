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
import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { usePermission } from '@backstage/plugin-permission-react';
import {
  announcementCreatePermission,
  announcementUpdatePermission,
  announcementDeletePermission,
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
  ContentHeader,
  LinkButton,
} from '@backstage/core-components';
import { alertApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { parseEntityRef } from '@backstage/catalog-model';
import {
  EntityDisplayName,
  EntityPeekAheadPopover,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {
  announcementCreateRouteRef,
  announcementEditRouteRef,
  announcementViewRouteRef,
  rootRouteRef,
} from '../../routes';
import { DeleteAnnouncementDialog } from './DeleteAnnouncementDialog';
import { useDeleteAnnouncementDialogState } from './useDeleteAnnouncementDialogState';
import { ContextMenu } from './ContextMenu';
import {
  announcementsApiRef,
  useAnnouncements,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  ListItemIcon,
  makeStyles,
  Menu,
  MenuItem,
  Tooltip,
} from '@material-ui/core';
import { Alert, Pagination } from '@material-ui/lab';

const useStyles = makeStyles(theme => {
  return {
    cardHeader: {
      color: theme?.palette?.text?.primary || '#000',
      fontSize: '1.5rem',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: theme?.spacing?.(4) || 32,
    },
  };
});
/**
 * Truncate text to a given length and add ellipsis
 * @param text the text to truncate
 * @param length the length to truncate to
 * @returns the truncated text
 */
const truncate = (text: string, length: number) => {
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

const AnnouncementCard = ({
  announcement,
  onDelete,
  options: { titleLength = 50 },
}: {
  announcement: Announcement;
  onDelete: () => void;
  options: AnnouncementCardProps;
}) => {
  const classes = useStyles();
  const announcementsLink = useRouteRef(rootRouteRef);
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);
  const editAnnouncementLink = useRouteRef(announcementEditRouteRef);
  const entityLink = useRouteRef(entityRouteRef);
  const { t } = useAnnouncementsTranslation();

  const publisherRef = parseEntityRef(announcement.publisher);
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
      {t('announcementsPage.card.by')}{' '}
      <EntityPeekAheadPopover entityRef={announcement.publisher}>
        <Link to={entityLink(publisherRef)}>
          <EntityDisplayName entityRef={announcement.publisher} hideIcon />
        </Link>
      </EntityPeekAheadPopover>
      {announcement.category && (
        <>
          {' '}
          {t('announcementsPage.card.in')}{' '}
          <Link
            to={`${announcementsLink()}?category=${announcement.category.slug}`}
          >
            {announcement.category.title}
          </Link>
        </>
      )}
      , {DateTime.fromISO(announcement.created_at).toRelative()}
    </>
  );
  const { loading: loadingDeletePermission, allowed: canDelete } =
    usePermission({ permission: announcementDeletePermission });
  const { loading: loadingUpdatePermission, allowed: canUpdate } =
    usePermission({ permission: announcementUpdatePermission });

  const AnnouncementEditMenu = () => {
    const [open, setOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<undefined | HTMLElement>(
      undefined,
    );

    const handleOpenEditMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen(true);
    };

    const handleCloseEditClose = () => {
      setAnchorEl(undefined);
      setOpen(false);
    };

    const canShowMenu =
      (!loadingUpdatePermission && canUpdate) ||
      (!loadingDeletePermission && canDelete);

    return (
      <>
        {canShowMenu && (
          <IconButton
            data-testid="announcement-edit-menu"
            aria-label="more"
            onClick={handleOpenEditMenu}
          >
            <MoreVertIcon />
          </IconButton>
        )}
        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseEditClose}>
          {!loadingUpdatePermission && canUpdate && (
            <MenuItem
              data-testid="edit-announcement"
              component={LinkButton}
              to={editAnnouncementLink({ id: announcement.id })}
            >
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              {t('announcementsPage.card.edit')}
            </MenuItem>
          )}
          {!loadingDeletePermission && canDelete && (
            <MenuItem onClick={onDelete}>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              {t('announcementsPage.card.delete')}
            </MenuItem>
          )}
        </Menu>
      </>
    );
  };

  return (
    <Card>
      <CardHeader
        action={<AnnouncementEditMenu />}
        title={title}
        subheader={subTitle}
      />
      <CardContent>{announcement.excerpt}</CardContent>
    </Card>
  );
};

const AnnouncementsGrid = ({
  maxPerPage,
  category,
  cardTitleLength,
  active,
}: {
  maxPerPage: number;
  category?: string;
  cardTitleLength?: number;
  active?: boolean;
}) => {
  const classes = useStyles();
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);

  const [page, setPage] = React.useState(1);
  const handleChange = (_event: any, value: number) => {
    setPage(value);
  };

  const {
    announcements,
    loading,
    error,
    retry: refresh,
  } = useAnnouncements(
    {
      max: maxPerPage,
      page: page,
      category,
      active,
    },
    { dependencies: [maxPerPage, page, category] },
  );

  const { t } = useAnnouncementsTranslation();

  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog,
    announcement: announcementToDelete,
  } = useDeleteAnnouncementDialogState();

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const onCancelDelete = () => {
    closeDeleteDialog();
  };
  const onConfirmDelete = async () => {
    closeDeleteDialog();

    try {
      await announcementsApi.deleteAnnouncementByID(announcementToDelete!.id);

      alertApi.post({
        message: t('announcementsPage.grid.announcementDeleted'),
        severity: 'success',
      });
    } catch (err) {
      alertApi.post({ message: (err as Error).message, severity: 'error' });
    }

    refresh();
  };

  return (
    <>
      <ItemCardGrid>
        {announcements.results.map(announcement => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            onDelete={() => openDeleteDialog(announcement)}
            options={{ titleLength: cardTitleLength }}
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

      <DeleteAnnouncementDialog
        open={isDeleteDialogOpen}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
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
  buttonOptions?: AnnouncementCreateButtonProps;
  cardOptions?: AnnouncementCardProps;
  hideContextMenu?: boolean;
  hideInactive?: boolean;
};

export const AnnouncementsPage = (props: AnnouncementsPageProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const newAnnouncementLink = useRouteRef(announcementCreateRouteRef);
  const { loading: loadingCreatePermission, allowed: canCreate } =
    usePermission({ permission: announcementCreatePermission });
  const { t } = useAnnouncementsTranslation();

  const {
    hideContextMenu,
    hideInactive,
    themeId,
    title,
    subtitle,
    buttonOptions,
    maxPerPage,
    category,
    cardOptions,
  } = props;

  return (
    <Page themeId={themeId}>
      <Header title={title} subtitle={subtitle}>
        {!hideContextMenu && <ContextMenu />}
      </Header>

      <Content>
        <ContentHeader title="">
          {!loadingCreatePermission && (
            <LinkButton
              disabled={!canCreate}
              to={newAnnouncementLink()}
              color="primary"
              variant="contained"
            >
              {buttonOptions
                ? `${t('announcementsPage.genericNew')} ${buttonOptions.name}`
                : t('announcementsPage.newAnnouncement')}
            </LinkButton>
          )}
        </ContentHeader>

        <AnnouncementsGrid
          maxPerPage={maxPerPage ?? 10}
          category={category ?? queryParams.get('category') ?? undefined}
          cardTitleLength={cardOptions?.titleLength}
          active={hideInactive ? true : false}
        />
      </Content>
    </Page>
  );
};
