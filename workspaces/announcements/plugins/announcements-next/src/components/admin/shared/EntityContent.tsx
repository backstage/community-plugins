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
import { ErrorPanel, Progress } from '@backstage/core-components';
import {
  announcementsApiRef,
  useAnnouncementsTranslation,
  AnnouncementsApi,
} from '@backstage-community/plugin-announcements-react';
import { announcementCreatePermission } from '@backstage-community/plugin-announcements-common';
import { useApi, alertApiRef, AlertApi } from '@backstage/core-plugin-api';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { ResponseError } from '@backstage/errors';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  Container,
  Grid,
  Button,
  Text,
  Flex,
  ButtonIcon,
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  TablePagination,
  useTable,
  Box,
} from '@backstage/ui';
import type { SortDescriptor } from 'react-aria-components';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { useDeleteConfirmationDialogState } from './useDeleteConfirmationDialogState';
import { useAnnouncementsPermissions } from './useAnnouncementsPermissions';

type EntityWithSlug = {
  slug: string;
  title: string;
};

type EntityContentConfig<T extends EntityWithSlug, TRequest> = {
  // Data fetching
  useEntityHook: () => {
    items: T[];
    loading: boolean;
    error: Error | undefined;
    retry: () => void;
  };

  // API methods
  createEntity: (api: AnnouncementsApi, request: TRequest) => Promise<void>;
  deleteEntity: (api: AnnouncementsApi, slug: string) => Promise<void>;

  // Form component
  FormComponent: React.ComponentType<{
    initialData: T;
    onSubmit: (data: TRequest) => Promise<void>;
  }>;

  // Translation keys
  translationKeys: {
    createButton: string;
    cancelButton: string;
    createdMessage: string;
    deletedMessage: string;
    noItemsFound: string;
    table: {
      title: string;
      slug: string;
      actions: string;
    };
    errors?: {
      alreadyExists?: string;
    };
  };

  // UI labels
  tableTitle: string;
  deleteDialogType: 'category' | 'tag';

  // Error handling
  handleCreateError?: (
    err: any,
    alertApi: AlertApi,
    t: (key: string) => string,
  ) => void;
};

type EntityContentProps<T extends EntityWithSlug, TRequest> = {
  config: EntityContentConfig<T, TRequest>;
};

export function EntityContent<
  T extends EntityWithSlug,
  TRequest extends { title: string },
>({ config }: EntityContentProps<T, TRequest>) {
  const {
    useEntityHook,
    createEntity,
    deleteEntity,
    FormComponent,
    translationKeys,
    tableTitle,
    deleteDialogType,
    handleCreateError,
  } = config;

  const [showForm, setShowForm] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<
    SortDescriptor | undefined
  >(undefined);
  const { items, loading, error, retry: refresh } = useEntityHook();
  const announcementsApi = useApi(announcementsApiRef);
  const alertApi = useApi(alertApiRef);
  const { t } = useAnnouncementsTranslation();

  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog,
    item: itemToDelete,
  } = useDeleteConfirmationDialogState<T>();

  const permissions = useAnnouncementsPermissions();

  const onSubmit = async (request: TRequest) => {
    const { title } = request;

    try {
      await createEntity(announcementsApi, request);

      alertApi.post({
        message: `${title} ${t(translationKeys.createdMessage)}`,
        severity: 'success',
      });

      setShowForm(false);
      refresh();
    } catch (err: any) {
      if (handleCreateError) {
        handleCreateError(err, alertApi, t);
      } else {
        alertApi.post({ message: (err as Error).message, severity: 'error' });
      }
    }
  };

  const onCreateButtonClick = () => {
    setShowForm(!showForm);
  };

  const onCancelDelete = () => {
    closeDeleteDialog();
  };

  const onConfirmDelete = async () => {
    closeDeleteDialog();

    try {
      await deleteEntity(announcementsApi, itemToDelete!.slug);

      alertApi.post({
        message: t(translationKeys.deletedMessage),
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

  // Sort data
  const sortedData = useMemo(() => {
    let data = items ?? [];

    if (sortDescriptor?.column) {
      data = [...data].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortDescriptor.column) {
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'slug':
            aValue = a.slug;
            bValue = b.slug;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortDescriptor.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDescriptor.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [items, sortDescriptor]);

  // Use table hook for pagination
  const { data: paginatedData, paginationProps } = useTable<T>({
    data: sortedData,
    pagination: {
      defaultPageSize: 20,
      showPageSizeOptions: true,
    },
  });

  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <ErrorPanel error={error} />;
  }

  return (
    <RequirePermission permission={announcementCreatePermission}>
      <Container>
        <Grid.Root columns="12">
          <Grid.Item colSpan="12">
            <Text variant="title-medium">
              {tableTitle}
              <Box pl="3" as="span">
                <Button
                  size="small"
                  isDisabled={
                    permissions.create.loading || !permissions.create.allowed
                  }
                  variant="primary"
                  onClick={onCreateButtonClick}
                >
                  {showForm
                    ? t(translationKeys.cancelButton)
                    : t(translationKeys.createButton)}
                </Button>
              </Box>
            </Text>
            {/* <Flex>
              <Button
                isDisabled={
                  permissions.create.loading || !permissions.create.allowed
                }
                variant="primary"
                onClick={onCreateButtonClick}
              >
                {showForm
                  ? t(translationKeys.cancelButton)
                  : t(translationKeys.createButton)}
              </Button>
            </Flex> */}
          </Grid.Item>

          {showForm && (
            <Grid.Item colSpan="4" rowSpan="2">
              <FormComponent initialData={{} as T} onSubmit={onSubmit} />
            </Grid.Item>
          )}

          <Grid.Item colSpan="12">
            <Table
              onSortChange={setSortDescriptor}
              sortDescriptor={sortDescriptor}
              aria-label={tableTitle}
            >
              <TableHeader>
                <Column isRowHeader allowsSorting>
                  {t(translationKeys.table.title)}
                </Column>
                <Column allowsSorting>{t(translationKeys.table.slug)}</Column>
                <Column>{t(translationKeys.table.actions)}</Column>
              </TableHeader>

              <TableBody
                renderEmptyState={() => (
                  <Box p="4">
                    <Text>{t(translationKeys.noItemsFound)}</Text>
                  </Box>
                )}
              >
                {paginatedData?.map(item => (
                  <Row key={item.slug} id={item.slug}>
                    <Cell title={item.title} />
                    <Cell title={item.slug} />
                    <Cell title={t(translationKeys.table.actions)}>
                      <ButtonIcon
                        aria-label="delete"
                        isDisabled={
                          permissions.delete.loading ||
                          !permissions.delete.allowed
                        }
                        onClick={() => openDeleteDialog(item)}
                        icon={
                          <DeleteIcon
                            fontSize="small"
                            data-testid="delete-icon"
                          />
                        }
                        size="small"
                        variant="tertiary"
                      />
                    </Cell>
                  </Row>
                ))}
              </TableBody>
            </Table>

            {sortedData.length > 0 && <TablePagination {...paginationProps} />}
          </Grid.Item>

          <DeleteConfirmationDialog
            type={deleteDialogType}
            open={isDeleteDialogOpen}
            onCancel={onCancelDelete}
            onConfirm={onConfirmDelete}
          />
        </Grid.Root>
      </Container>
    </RequirePermission>
  );
}
