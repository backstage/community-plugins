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

import {
  Alert,
  Cell,
  Flex,
  SearchField,
  Table,
  Tag,
  TagGroup,
  Text,
  useTable,
} from '@backstage/ui';
import type { ColumnConfig } from '@backstage/ui';
import { useApi } from '@backstage/core-plugin-api';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { FeedbackResponse } from '@backstage-community/plugin-entity-feedback-common';
import { RiCheckLine } from '@remixicon/react';
import { useMemo } from 'react';
import useAsync from 'react-use/esm/useAsync';

import { entityFeedbackApiRef } from '../../api';
import { Comments } from '../FeedbackResponseDialog';
import styles from './FeedbackResponseTable.module.css';

type ResponseRow = Omit<FeedbackResponse, 'entityRef'> & { id: number };

/**
 * @public
 */
export interface FeedbackResponseTableProps {
  entityRef: string;
  title?: string;
}

/**
 * @public
 */
export const FeedbackResponseTable = (props: FeedbackResponseTableProps) => {
  const { entityRef, title = 'Entity Responses' } = props;
  const feedbackApi = useApi(entityFeedbackApiRef);

  const {
    error,
    loading,
    value: responses,
  } = useAsync(async () => {
    if (!entityRef) {
      return [];
    }

    return feedbackApi.getResponses(entityRef);
  }, [entityRef, feedbackApi]);

  const rows = useMemo(
    () => (responses ?? []).map((response, id) => ({ ...response, id })),
    [responses],
  );
  const { tableProps, search } = useTable({
    mode: 'complete',
    data: rows,
    searchFn: (data, query) =>
      data.filter(row =>
        `${row.userRef} ${row.response} ${row.comments}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    paginationOptions: { pageSize: 20, pageSizeOptions: [20, 50, 100] },
  });

  const columns: ColumnConfig<ResponseRow>[] = [
    {
      id: 'userRef',
      label: 'User',
      isRowHeader: true,
      cell: response => (
        <Cell>
          <EntityRefLink entityRef={response.userRef} defaultKind="user" />
        </Cell>
      ),
    },
    {
      id: 'consent',
      label: 'OK to contact?',
      cell: response => (
        <Cell>
          {response.consent && (
            <RiCheckLine className={styles.consentCheck} aria-label="Yes" />
          )}
        </Cell>
      ),
    },
    {
      id: 'response',
      label: 'Responses',
      cell: response => (
        <Cell>
          <TagGroup>
            {(response.response || '')
              .split(',')
              .map((v: string) => v.trim()) // removes whitespace
              .filter(Boolean) // removes accidental empty entries
              .map((res: string) => (
                <Tag key={res} size="small">
                  {res}
                </Tag>
              ))}
          </TagGroup>
        </Cell>
      ),
    },
    {
      id: 'comments',
      label: 'Comments',
      cell: response => {
        // Check if comment is a stringified object
        let parsedComment;
        try {
          parsedComment =
            response?.comments && (JSON.parse(response.comments) as Comments);
        } catch (e) {
          // If parsing fails, assume it's a regular string
          parsedComment = response.comments;
        }
        return (
          <Cell>
            {typeof parsedComment === 'object' ? (
              <ul className={styles.list}>
                {Object.entries<string>(parsedComment.responseComments)?.map(
                  ([key, value]) => (
                    <li key={key} className={styles.listItem}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ),
                )}
                {parsedComment.additionalComments && (
                  <li className={styles.listItem}>
                    <strong>additional:</strong>{' '}
                    {parsedComment.additionalComments}
                  </li>
                )}
              </ul>
            ) : (
              <Text>{parsedComment}</Text>
            )}
          </Cell>
        );
      },
    },
  ];

  if (error) {
    return (
      <Alert
        status="danger"
        icon
        title="Failed to load feedback responses"
        description={error.message}
      />
    );
  }

  return (
    <div>
      <Flex align="center" justify="between">
        <Text variant="title-small">{title}</Text>
        <SearchField
          aria-label="Search feedback responses"
          value={search.value}
          onChange={search.onChange}
        />
      </Flex>
      <Table columnConfig={columns} {...tableProps} isPending={loading} />
    </div>
  );
};
