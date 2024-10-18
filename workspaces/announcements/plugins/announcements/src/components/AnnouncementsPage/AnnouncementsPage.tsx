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
import Alert from '@material-ui/lab/Alert';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  makeStyles,
} from '@material-ui/core';
import {
  announcementCreateRouteRef,
  announcementEditRouteRef,
  announcementViewRouteRef,
  rootRouteRef,
} from '../../routes';
import { DeleteAnnouncementDialog } from './DeleteAnnouncementDialog';
import { useDeleteAnnouncementDialogState } from './useDeleteAnnouncementDialogState';
import { Pagination } from '@material-ui/lab';
import { ContextMenu } from './ContextMenu';
import {
  announcementsApiRef,
  useAnnouncements,
} from '@backstage-community/plugin-announcements-react';

const useStyles = makeStyles(theme => ({
  cardHeader: {
    color: theme.palette.text.primary,
    fontSize: '1.5rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(4),
  },
}));

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
      By{' '}
      <EntityPeekAheadPopover entityRef={announcement.publisher}>
        <Link to={entityLink(publisherRef)}>
          <EntityDisplayName entityRef={announcement.publisher} hideIcon />
        </Link>
      </EntityPeekAheadPopover>
      {announcement.category && (
        <>
          {' '}
          in{' '}
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
    return (
      <>
        <IconButton
          data-testid="announcement-edit-menu"
          aria-label="more"
          onClick={handleOpenEditMenu}
        >
          <MoreVertIcon />
        </IconButton>
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
              EDIT
            </MenuItem>
          )}
          {!loadingDeletePermission && canDelete && (
            <MenuItem onClick={onDelete}>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              DELETE
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
}: {
  maxPerPage: number;
  category?: string;
  cardTitleLength?: number;
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
    },
    { dependencies: [maxPerPage, page, category] },
  );

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

      alertApi.post({ message: 'Announcement deleted.', severity: 'success' });
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

type AnnouncementsPageProps = {
  themeId: string;
  title: string;
  subtitle?: ReactNode;
  maxPerPage?: number;
  category?: string;
  buttonOptions?: AnnouncementCreateButtonProps;
  cardOptions?: AnnouncementCardProps;
};

export const AnnouncementsPage = (props: AnnouncementsPageProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const newAnnouncementLink = useRouteRef(announcementCreateRouteRef);
  const { loading: loadingCreatePermission, allowed: canCreate } =
    usePermission({ permission: announcementCreatePermission });

  return (
    <Page themeId={props.themeId}>
      <Header title={props.title} subtitle={props.subtitle}>
        <ContextMenu />
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
              {props.buttonOptions
                ? `New ${props.buttonOptions.name}`
                : 'New announcement'}
            </LinkButton>
          )}
        </ContentHeader>

        <AnnouncementsGrid
          maxPerPage={props.maxPerPage ?? 10}
          category={props.category ?? queryParams.get('category') ?? undefined}
          cardTitleLength={props.cardOptions?.titleLength}
        />
      </Content>
    </Page>
  );
};
