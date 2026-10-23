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
import { Table, TableColumn, WarningPanel } from '@backstage/core-components';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import RetryIcon from '@material-ui/icons/Replay';
import { JenkinsInstanceError, Project } from '../../../../api/JenkinsApi';
import JenkinsLogo from '../../../../assets/JenkinsLogo.svg';
import { useBuilds } from '../../../useBuilds';
import { columnFactories } from './columns';
import { defaultCITableColumns } from './presets';

const useStyles = makeStyles({
  // Jenkins errors embed long request URLs that would otherwise widen the
  // page, and the backend separates the errors of several instances with
  // newlines.
  errorMessage: {
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-line',
  },
});

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
  error?: { message: string };
  instanceErrors?: JenkinsInstanceError[];
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
  error,
  instanceErrors,
}: Props) => {
  const classes = useStyles();
  const projectsInPage = projects?.slice(
    page * pageSize,
    Math.min(projects.length, (page + 1) * pageSize),
  );
  // The instance column is noise for the common single-instance entity, so
  // the default columns only show it when the jobs come from several.
  const hasSeveralInstances =
    new Set(projects?.map(project => project.instanceName)).size > 1;
  const tableColumns =
    columns && columns.length !== 0
      ? columns
      : defaultCITableColumns.filter(
          column => hasSeveralInstances || column.field !== 'instanceName',
        );
  return (
    <>
      {error && (
        <Box mb={2}>
          {/* Passed as children, not message: message is wrapped in a <p>. */}
          <WarningPanel severity="error" title="Can't load Jenkins projects">
            <Typography variant="body1" className={classes.errorMessage}>
              {error.message}
            </Typography>
          </WarningPanel>
        </Box>
      )}
      {instanceErrors && instanceErrors.length > 0 && (
        <Box mb={2}>
          <WarningPanel
            title={`Couldn't load projects from Jenkins instance(s): ${instanceErrors
              .map(e => e.instanceName)
              .join(', ')}`}
          >
            {instanceErrors.map(e => (
              <Typography
                key={e.instanceName}
                variant="body1"
                className={classes.errorMessage}
              >
                {e.message}
              </Typography>
            ))}
          </WarningPanel>
        </Box>
      )}
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
        columns={tableColumns}
      />
    </>
  );
};

type CITableProps = {
  title?: string;
  columns?: TableColumn<Project>[];
};

export const CITable = ({ title, columns }: CITableProps) => {
  const [tableProps, { setPage, retry, setPageSize }] = useBuilds();

  return (
    <CITableView
      {...tableProps}
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
