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

import { ErrorPanel, Table } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { FeedbackResponse } from '@backstage-community/plugin-entity-feedback-common';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import Typography from '@material-ui/core/Typography';
import useAsync from 'react-use/esm/useAsync';

import { entityFeedbackApiRef } from '../../api';
import { Comments } from '../FeedbackResponseDialog';

type ResponseRow = Omit<FeedbackResponse, 'entityRef'>;

const useStyles = makeStyles(theme => ({
  consentCheck: {
    color: theme.palette.status.ok,
  },
  listItem: {
    padding: '0',
    marginTop: theme.spacing(1),
  },
  list: {
    paddingLeft: '0',
  },
}));

/**
 * @public
 */
export interface FeedbackResponseTableProps {
  entityRef: string;
  title?: string;
}

export const FeedbackResponseTable = (props: FeedbackResponseTableProps) => {
  const { entityRef, title = 'Entity Responses' } = props;
  const classes = useStyles();
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

  const columns = [
    {
      title: 'User',
      field: 'userRef',
      width: '15%',
      render: (response: ResponseRow) => (
        <EntityRefLink entityRef={response.userRef} defaultKind="user" />
      ),
    },
    {
      title: 'OK to contact?',
      field: 'consent',
      width: '10%',
      render: (response: ResponseRow) =>
        response.consent ? <CheckIcon className={classes.consentCheck} /> : '',
    },
    {
      title: 'Responses',
      field: 'response',
      width: '35%',
      render: (response: ResponseRow) => (
        <>
          {(response.response || '')
            .split(',')
            .map((v: string) => v.trim()) // removes whitespace
            .filter(Boolean) // removes accidental empty entries
            .map((res: string) => (
              <Chip key={res} size="small" label={res} />
            ))}
        </>
      ),
    },
    {
      title: 'Comments',
      field: 'comments',
      width: '40%',
      render: (response: ResponseRow) => {
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
          <div>
            {typeof parsedComment === 'object' ? (
              <ul className={classes.list}>
                {Object.entries<string>(parsedComment.responseComments)?.map(
                  ([key, value]) => (
                    <li key={key} className={classes.listItem}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ),
                )}
                {parsedComment.additionalComments && (
                  <li className={classes.listItem}>
                    <strong>additional:</strong>{' '}
                    {parsedComment.additionalComments}
                  </li>
                )}
              </ul>
            ) : (
              <Typography>{parsedComment}</Typography>
            )}
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <ErrorPanel
        defaultExpanded
        title="Failed to load feedback responses"
        error={error}
      />
    );
  }

  return (
    <Table<ResponseRow>
      columns={columns}
      data={(responses ?? []) as ResponseRow[]}
      isLoading={loading}
      options={{
        emptyRowsWhenPaging: false,
        loadingType: 'linear',
        pageSize: 20,
        pageSizeOptions: [20, 50, 100],
        paging: true,
        showEmptyDataSourceMessage: !loading,
      }}
      title={title}
    />
  );
};
