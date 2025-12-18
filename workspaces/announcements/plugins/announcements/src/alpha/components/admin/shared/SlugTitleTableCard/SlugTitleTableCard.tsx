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
import { useState, useMemo, ReactNode } from 'react';
import {
  Button,
  TablePagination,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Text,
  Flex,
} from '@backstage/ui';

/**
 * Type constraint for items that have slug and title properties
 * @internal
 */
export type SlugTitleItem = {
  slug: string;
  title: string;
};

/**
 * Translation keys for the table card
 * @internal
 */
export type SlugTitleTableCardTranslationKeys = {
  /** Translation key for the page title (e.g., "Categories" or "Tags") */
  pageTitle: string;
  /** Translation key for the create button text */
  createButton: string;
};

/**
 * Props for the generic SlugTitleTableCard component
 * @internal
 */
export type SlugTitleTableCardProps<T extends SlugTitleItem> = {
  /** Array of items to display */
  items: T[];
  /** Callback when create button is clicked */
  onCreateClick: () => void;
  /** Callback when delete is clicked on an item */
  onDeleteClick: (item: T) => void;
  /** Whether the user can create items */
  canCreate: boolean;
  /** Whether the user can delete items */
  canDelete: boolean;
  /** Translation keys for the card */
  translationKeys: SlugTitleTableCardTranslationKeys;
  /** Render function for the table component */
  renderTable: (props: {
    data: T[];
    onDeleteClick?: (item: T) => void;
  }) => ReactNode;
  /** Initial page size (default: 5) */
  defaultPageSize?: number;
};

/**
 * Generic table card component for displaying paginated lists of items with slug and title
 * @internal
 */
export const SlugTitleTableCard = <T extends SlugTitleItem>(
  props: SlugTitleTableCardProps<T>,
) => {
  const {
    items,
    onCreateClick,
    onDeleteClick,
    canCreate,
    canDelete,
    translationKeys,
    renderTable,
    defaultPageSize = 5,
  } = props;

  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [offset, setOffset] = useState(0);

  const paginatedItems = useMemo(() => {
    const start = offset;
    const end = offset + pageSize;
    return items.slice(start, end);
  }, [items, offset, pageSize]);

  const title = `${translationKeys.pageTitle} (${items.length})`;

  return (
    <Card>
      <CardHeader>
        <Flex justify="between" align="center">
          <Text variant="title-x-small">{title}</Text>
          <Button isDisabled={!canCreate} onClick={onCreateClick}>
            {translationKeys.createButton}
          </Button>
        </Flex>
      </CardHeader>

      <CardBody>
        {renderTable({
          data: paginatedItems,
          onDeleteClick: canDelete ? onDeleteClick : undefined,
        })}
      </CardBody>

      {items.length > 0 && (
        <CardFooter>
          <TablePagination
            offset={offset}
            pageSize={pageSize}
            setOffset={setOffset}
            setPageSize={setPageSize}
            rowCount={items.length}
          />
        </CardFooter>
      )}
    </Card>
  );
};
