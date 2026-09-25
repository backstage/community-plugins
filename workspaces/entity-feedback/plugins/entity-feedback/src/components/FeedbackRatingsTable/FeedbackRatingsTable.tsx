/*
 * Copyright 2023 The Backstage Authors
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

import { parseEntityRef } from '@backstage/catalog-model';
import {
  Alert,
  Cell,
  Flex,
  SearchField,
  Table,
  Text,
  useTable,
} from '@backstage/ui';
import type { ColumnConfig } from '@backstage/ui';
import { useApi } from '@backstage/core-plugin-api';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { EntityRatingsData } from '@backstage-community/plugin-entity-feedback-common';
import useAsync from 'react-use/esm/useAsync';
import { useMemo } from 'react';

import { entityFeedbackApiRef } from '../../api';

interface FeedbackRatingsTableProps {
  allEntities?: boolean;
  ownerRef?: string;
  ratingValues: string[];
  title?: string;
}

type RatingRow = EntityRatingsData & { id: string };

export const FeedbackRatingsTable = (props: FeedbackRatingsTableProps) => {
  const {
    allEntities,
    ownerRef,
    ratingValues,
    title = 'Entity Ratings',
  } = props;
  const feedbackApi = useApi(entityFeedbackApiRef);

  const {
    error,
    loading,
    value: ratings,
  } = useAsync(async () => {
    if (allEntities) {
      return feedbackApi.getAllRatings();
    }

    if (!ownerRef) {
      return [];
    }

    return feedbackApi.getOwnedRatings(ownerRef);
  }, [allEntities, feedbackApi, ownerRef]);

  const columns: ColumnConfig<RatingRow>[] = [
    {
      id: 'entity',
      label: 'Entity',
      isRowHeader: true,
      isSortable: true,
      cell: rating => {
        const compoundRef = parseEntityRef(rating.entityRef);
        return (
          <Cell>
            <Flex direction="column" gap="0">
              <EntityRefLink
                entityRef={rating.entityRef}
                defaultKind={compoundRef.kind}
                title={rating.entityTitle}
              />
              <Text variant="body-small" color="secondary">
                {compoundRef.kind}
              </Text>
            </Flex>
          </Cell>
        );
      },
    },
    ...ratingValues.map(ratingVal => ({
      id: ratingVal,
      label: ratingVal,
      cell: (rating: RatingRow) => (
        <Cell>{rating.ratings[ratingVal] ?? ''}</Cell>
      ),
    })),
  ];

  // Exclude entities that don't have applicable ratings
  const ratingsRows = useMemo(
    () =>
      ratings
        ?.filter(r =>
          Object.keys(r.ratings).some(v => ratingValues.includes(v)),
        )
        .map(r => ({ ...r, id: r.entityRef })) ?? [],
    [ratings, ratingValues],
  );
  const { tableProps, search } = useTable({
    mode: 'complete',
    data: ratingsRows,
    searchFn: (data, query) =>
      data.filter(row =>
        `${row.entityTitle ?? ''} ${row.entityRef}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    sortFn: (data, sort) =>
      [...data].sort((a, b) => {
        const titleA = a.entityTitle ?? parseEntityRef(a.entityRef).name;
        const titleB = b.entityTitle ?? parseEntityRef(b.entityRef).name;
        return (
          titleA.localeCompare(titleB) *
          (sort.direction === 'ascending' ? 1 : -1)
        );
      }),
    paginationOptions: { pageSize: 20, pageSizeOptions: [20, 50, 100] },
  });

  if (error) {
    return (
      <Alert
        status="danger"
        icon
        title="Failed to load feedback ratings"
        description={error.message}
      />
    );
  }

  return (
    <div>
      <Flex align="center" justify="between">
        <Text variant="title-small">{title}</Text>
        <SearchField
          aria-label="Search entity ratings"
          value={search.value}
          onChange={search.onChange}
        />
      </Flex>
      <Table columnConfig={columns} {...tableProps} isPending={loading} />
    </div>
  );
};
