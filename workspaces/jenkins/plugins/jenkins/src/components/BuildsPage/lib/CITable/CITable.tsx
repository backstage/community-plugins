/*
 * Copyright 2020 The Backstage Authors
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
import { Table, TableColumn } from '@backstage/core-components';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import RetryIcon from '@material-ui/icons/Replay';
import { Project } from '../../../../api/JenkinsApi';
import JenkinsLogo from '../../../../assets/JenkinsLogo.svg';
import { useBuilds } from '../../../useBuilds';
import { columnFactories } from './columns';
import { defaultCITableColumns } from './presets';

type Props = {
  title?: string;
  loading: boolean;
  retry: () => void;
  projects?: Project[];
  page: number;
  onChangePage: (page: number) => void;
  total: number;
  pageSize: number;
  onChangePageSize: (pageSize: number) => void;
  columns: TableColumn<Project>[];
};

export const CITableView = ({
  title = 'Projects',
  loading,
  pageSize,
  page,
  retry,
  projects,
  onChangePage,
  onChangePageSize,
  columns,
  total,
}: Props) => {
  const projectsInPage = projects?.slice(
    page * pageSize,
    Math.min(projects.length, (page + 1) * pageSize),
  );
  return (
    <Table
      isLoading={loading}
      options={{ paging: true, pageSize, padding: 'dense' }}
      totalCount={total}
      page={page}
      actions={[
        {
          icon: () => <RetryIcon />,
          tooltip: 'Refresh Data',
          isFreeAction: true,
          onClick: () => retry(),
        },
      ]}
      data={projectsInPage ?? []}
      onPageChange={onChangePage}
      onRowsPerPageChange={onChangePageSize}
      title={
        <Box display="flex" alignItems="center">
          <img src={JenkinsLogo} alt="Jenkins logo" height="50px" />
          <Box mr={2} />
          <Typography variant="h6">{title}</Typography>
        </Box>
      }
      columns={
        columns && columns.length !== 0 ? columns : defaultCITableColumns
      }
    />
  );
};

function CITableErrorView({
  statusCode,
  errorReason,
  connectionIssueMessage,
  jenkinsJobFullPath,
}: {
  statusCode?: number;
  errorReason?: string;
  connectionIssueMessage?: string;
  jenkinsJobFullPath?: string;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      mt={4}
    >
      <Typography variant="h5" color="error" gutterBottom>
        Failed to retrieve data
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        style={{ fontWeight: 'bold', marginBottom: 16 }}
      >
        {statusCode}: {errorReason || 'Unknown error'}
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        style={{ fontWeight: 'bold', marginBottom: 16 }}
      >
        {jenkinsJobFullPath}
      </Typography>
      {connectionIssueMessage && (
        <Typography
          variant="body1"
          color="textSecondary"
          style={{
            fontWeight: 'bold',
            padding: '16px 24px',
            background: '#5c5252ff', // Material-UI grey[400] - darker grey
            borderRadius: 4,
            border: '1px solid #a3a3a3ff', // Material-UI grey[600] - darker border
            marginTop: 8,
            maxWidth: 600,
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // slightly stronger shadow
          }}
        >
          {connectionIssueMessage}
        </Typography>
      )}
    </Box>
  );
}

type CITableProps = {
  title?: string;
  columns?: TableColumn<Project>[];
};

type ProjectStatus = {
  statusCode: number;
  errorReason?: string;
  connectionIssueMessage?: string;
  jenkinsJobFullPath?: string;
};

function isProjectsStatus(x: unknown): x is ProjectStatus {
  return !!x && typeof x === 'object' && 'statusCode' in x;
}

export const CITable = ({ title, columns }: CITableProps) => {
  const [tableProps, { setPage, retry, setPageSize }] = useBuilds();

  const projects = tableProps.projects;

  if (isProjectsStatus(projects)) {
    const {
      statusCode,
      errorReason,
      connectionIssueMessage,
      jenkinsJobFullPath,
    } = projects;
    return (
      <CITableErrorView
        statusCode={statusCode}
        errorReason={errorReason}
        connectionIssueMessage={connectionIssueMessage}
        jenkinsJobFullPath={jenkinsJobFullPath}
      />
    );
  }

  return (
    <CITableView
      {...tableProps}
      projects={projects}
      title={title}
      columns={columns || ([] as TableColumn<Project>[])}
      retry={retry}
      onChangePageSize={setPageSize}
      onChangePage={setPage}
    />
  );
};

CITable.columns = columnFactories;

CITable.defaultCITableColumns = defaultCITableColumns;
