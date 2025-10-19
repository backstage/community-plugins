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
import {
  Page,
  Header,
  Content,
  Table,
  TableColumn,
  ErrorPanel,
} from '@backstage/core-components';
import { NewTagDialog } from '../NewTagDialog';
import {
  useAnnouncementsTranslation,
  useTags,
  announcementsApiRef,
} from '@backstage-community/plugin-announcements-react';
import {
  announcementCreatePermission,
  Tag,
} from '@backstage-community/plugin-announcements-common';
import { useDeleteTagDialogState } from './useDeleteTagDialogState';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { DeleteTagDialog } from './DeleteTagDialog';
import { ResponseError } from '@backstage/errors';
import { IconButton, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { ContextMenu } from '../AnnouncementsPage/ContextMenu';
import { usePermission } from '@backstage/plugin-permission-react';

const TagsTable = () => {
  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);

  const { tags, loading, error, retry: refresh } = useTags();

  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog,
    tag: tagToDelete,
  } = useDeleteTagDialogState();
  const { t } = useAnnouncementsTranslation();

  if (error) {
    return <ErrorPanel error={error} />;
  }

  const onNewTagDialogClose = () => {
    setNewTagDialogOpen(false);
    refresh();
  };

  const onCancelDelete = () => {
    closeDeleteDialog();
  };
  const onConfirmDelete = async () => {
    closeDeleteDialog();

    try {
      await announcementsApi.deleteTag(tagToDelete!.slug);

      alertApi.post({
        message: t('tagsTable.tagDeleted'),
        severity: 'success',
      });
    } catch (err) {
      alertApi.post({
        message: (err as ResponseError).body.error.message,
        severity: 'error',
      });
    }

    refresh();
  };

  const columns: TableColumn<Tag>[] = [
    {
      title: t('tagsTable.slug'),
      field: 'slug',
    },
    {
      title: t('tagsTable.title'),
      field: 'title',
    },
    {
      title: t('tagsTable.actions'),
      field: 'actions',
      render: tag => {
        return (
          <IconButton onClick={() => openDeleteDialog(tag)}>
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];

  return (
    <>
      <Table
        options={{ paging: false }}
        data={tags || []}
        columns={columns}
        isLoading={loading}
        title="Tags"
        actions={[
          {
            icon: () => <AddIcon />,
            tooltip: t('tagsTable.addTooltip'),
            isFreeAction: true,
            onClick: _event => setNewTagDialogOpen(true),
          },
        ]}
        emptyContent={
          <Typography style={{ padding: 2, textAlign: 'center' }}>
            {t('tagsTable.noTagsFound')}
          </Typography>
        }
      />
      <NewTagDialog
        open={newTagDialogOpen}
        onClose={onNewTagDialogClose}
        onSubmit={refresh}
      />
      <DeleteTagDialog
        open={isDeleteDialogOpen}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

type TagsPageProps = {
  themeId: string;
  hideContextMenu?: boolean;
};

export const TagsPage = (props: TagsPageProps) => {
  const { t } = useAnnouncementsTranslation();
  const { allowed: canCreate } = usePermission({
    permission: announcementCreatePermission,
  });
  const { themeId, hideContextMenu } = props;

  return (
    <Page themeId={themeId}>
      <Header title={t('tagsPage.title')} subtitle={t('tagsPage.subtitle')}>
        {!hideContextMenu && canCreate && <ContextMenu />}
      </Header>

      <Content>
        <TagsTable />
      </Content>
    </Page>
  );
};
