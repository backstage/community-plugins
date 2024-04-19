/*
 * Copyright 2021 The Backstage Authors
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
import React from 'react';
import { GithubDeployment } from '../../api';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import SyncIcon from '@material-ui/icons/Sync';
import { columnFactories } from './columns';
import { defaultDeploymentColumns } from './presets';
import { Table, TableColumn } from '@backstage/core-components';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

/** @public */
export const GithubDeploymentsTable = (props: {
  deployments: GithubDeployment[];
  isLoading: boolean;
  reload: () => void;
  columns: TableColumn<GithubDeployment>[];
}) => {
  const { deployments, isLoading, reload, columns } = props;
  const classes = useStyles();

  return (
    <Table
      columns={columns}
      options={{ padding: 'dense', paging: true, search: false, pageSize: 5 }}
      title="GitHub Deployments"
      data={deployments}
      isLoading={isLoading}
      actions={[
        {
          icon: () => <SyncIcon />,
          tooltip: 'Reload',
          isFreeAction: true,
          onClick: () => reload(),
        },
      ]}
      emptyContent={
        <div className={classes.empty}>
          <Typography variant="body1">
            No deployments found for this entity.
          </Typography>
        </div>
      }
    />
  );
};

GithubDeploymentsTable.columns = columnFactories;

GithubDeploymentsTable.defaultDeploymentColumns = defaultDeploymentColumns;
