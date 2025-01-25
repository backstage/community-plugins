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
import { ErrorPanel, Table } from '@backstage/core-components';
import React from 'react';
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import { Paper } from '@material-ui/core';
import { Issue } from '../../types';
import { columns } from './columns';

/**
 * @public
 *
 * Props for the JiraStatusTable component.
 */
export interface JiraStatusTableProps {
  /**
   * An array of issues to be displayed in the table.
   */
  issues: Issue[];

  /**
   * Optional title for the table.
   */
  title?: string;

  /**
   * Optional loading state to indicate if the data is being loaded.
   */
  loading?: boolean;
}

/**
 * @public
 *
 * JiraStatusTable component renders a table of Jira issues with customizable styling
 * based on the current theme (dark or light). If no issues are provided, it displays
 * an error panel.
 *
 * @param {JiraStatusTableProps} props - The props for the JiraStatusTable component.
 * @param {Issue[]} props.issues - The list of Jira issues to display in the table.
 * @param {string} [props.title=''] - The title of the table.
 * @param {boolean} [props.loading=false] - Indicates whether the table is in a loading state.
 *
 * @returns {JSX.Element} The rendered JiraStatusTable component.
 */
export const JiraStatusTable: React.FC<JiraStatusTableProps> = ({
  issues,
  title = '',
  loading = false,
}) => {
  const usingDarkTheme =
    useApi(appThemeApiRef).getActiveThemeId() === 'adsk-dark';

  const borderColor = usingDarkTheme
    ? '1px solid rgba(255, 255, 255, 0.12)'
    : '1px solid rgba(0, 0, 0, 0.12)';
  const borderBottomColor = usingDarkTheme
    ? '1px solid rgba(255, 255, 255, 0.12)'
    : '';

  return issues.length > 0 ? (
    <Paper
      elevation={0}
      style={{
        borderLeft: `${borderColor}`,
        borderRight: `${borderColor}`,
        borderTop: `${borderColor}`,
        borderBottom: `${borderBottomColor}`,
        overflow: 'hidden',
      }}
    >
      <Table<Issue>
        title={title}
        data={issues}
        columns={columns}
        options={{
          paging: false,
          toolbar: false,
          showTitle: !!title,
          headerStyle: {
            borderBottom: 'none',
            borderTop: 'none',
            textTransform: 'none',
          },
        }}
        isLoading={loading}
      />
    </Paper>
  ) : (
    <ErrorPanel
      error={
        new Error(
          `No Jira issue information found, unable to render table: ${title}`,
        )
      }
    />
  );
};
