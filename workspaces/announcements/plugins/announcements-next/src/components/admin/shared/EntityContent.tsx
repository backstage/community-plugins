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
  ButtonIcon,
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  TablePagination,
  useTable,
  Box,
  CellText,
  Dialog,
  DialogHeader,
  DialogBody,
  Flex,
} from '@backstage/ui';
import { Cell as AriaCell } from 'react-aria-components';
import type { SortDescriptor } from 'react-aria-components';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { useDeleteConfirmationDialogState } from './useDeleteConfirmationDialogState';
import { useAnnouncementsPermissions } from './useAnnouncementsPermissions';

type EntityWithSlug = {
  slug: string;
  title: string;
};

/**
 * Configuration object for the EntityContent component.
 * This type defines all the required and optional properties needed to configure
 * a generic entity management interface (e.g., categories, tags).
 *
 * @template T - The entity type that extends EntityWithSlug (must have slug and title properties)
 * @template TRequest - The request type used for creating/updating entities (must have title property)
 */
type EntityContentConfig<T extends EntityWithSlug, TRequest> = {
  /**
   * Custom hook that provides entity data and state management.
   * Should return an object with items array, loading state, error state, and retry function.
   */
  useEntityHook: () => {
    /** Array of entity items to display in the table */
    items: T[];
    /** Whether the data is currently being loaded */
    loading: boolean;
    /** Error object if data fetching failed, undefined otherwise */
    error: Error | undefined;
    /** Function to retry fetching data after an error */
    retry: () => void;
  };

  /**
   * Function to create a new entity via the API.
   * @param api - The announcements API instance
   * @param request - The request object containing entity data to create
   * @returns Promise that resolves when the entity is created
   */
  createEntity: (api: AnnouncementsApi, request: TRequest) => Promise<void>;

  /**
   * Function to delete an entity via the API.
   * @param api - The announcements API instance
   * @param slug - The slug identifier of the entity to delete
   * @returns Promise that resolves when the entity is deleted
   */
  deleteEntity: (api: AnnouncementsApi, slug: string) => Promise<void>;

  /**
   * React component for the entity form.
   * Used for both creating new entities and editing existing ones.
   * Should accept initialData and onSubmit props.
   */
  FormComponent: React.ComponentType<{
    /** Initial data to populate the form (empty object for new entities) */
    initialData: T;
    /** Callback function called when the form is submitted */
    onSubmit: (data: TRequest) => Promise<void>;
  }>;

  /**
   * Translation keys for all user-facing text in the component.
   * These keys are used with the translation function to provide localized strings.
   */
  translationKeys: {
    /** Translation key for the create button label */
    createButton: string;
    /** Translation key for the cancel button label */
    cancelButton: string;
    /** Translation key for the dialog title when creating a new entity */
    dialogTitle: string;
    /** Translation key for the success message when an entity is created */
    createdMessage: string;
    /** Translation key for the success message when an entity is deleted */
    deletedMessage: string;
    /** Translation key for the message shown when no items are found */
    noItemsFound: string;
    /** Translation keys for table column headers */
    table: {
      /** Translation key for the title column header */
      title: string;
      /** Translation key for the slug column header */
      slug: string;
      /** Translation key for the actions column header */
      actions: string;
    };
    /** Optional translation keys for error messages */
    errors?: {
      /** Translation key for the error message when an entity already exists */
      alreadyExists?: string;
    };
  };

  /**
   * Title displayed at the top of the table section.
   * Used as the main heading for the entity management interface.
   */
  tableTitle: string;

  /**
   * Type of entity for the delete confirmation dialog.
   * Determines the dialog's messaging and behavior.
   */
  deleteDialogType: 'category' | 'tag';

  /**
   * Optional custom error handler for entity creation failures.
   * If provided, this function will be called instead of the default error handling.
   * Useful for handling specific error cases (e.g., duplicate entity errors).
   *
   * @param err - The error object thrown during entity creation
   * @param alertApi - The alert API instance for displaying notifications
   * @param t - The translation function for localized error messages
   */
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
    setShowForm(true);
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
        <Grid.Root columns="6">
          <Grid.Item colSpan="2">
            <Text variant="title-medium"> {tableTitle}</Text>
          </Grid.Item>
          <Grid.Item colSpan="4">
            <Box pl="3" as="span">
              <Button
                size="small"
                isDisabled={
                  permissions.create.loading || !permissions.create.allowed
                }
                variant="primary"
                onClick={onCreateButtonClick}
              >
                {t(translationKeys.createButton)}
              </Button>
            </Box>
          </Grid.Item>

          <Grid.Item colSpan="3">
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
                    <CellText title={item.title} />
                    <CellText title={item.slug} />
                    <AriaCell textValue={t(translationKeys.table.actions)}>
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
                    </AriaCell>
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

        <Dialog isOpen={showForm} onOpenChange={setShowForm} width="500px">
          <DialogHeader>{t(translationKeys.dialogTitle)}</DialogHeader>
          <DialogBody>
            <FormComponent initialData={{} as T} onSubmit={onSubmit} />
          </DialogBody>
        </Dialog>
      </Container>
    </RequirePermission>
  );
}
