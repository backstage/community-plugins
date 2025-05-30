/*
 * Copyright 2024 The Backstage Authors
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
import { makeStyles } from '@material-ui/core/styles';
import {
  Table,
  TableColumn,
  Progress,
  EmptyState,
  MissingAnnotationEmptyState,
  TableFilter,
} from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/lib/useAsync';
import LaunchSharp from '@material-ui/icons/LaunchSharp';
import { useApi } from '@backstage/core-plugin-api';
import { Link } from '@backstage/core-components';

import { Chip, Tooltip } from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';

import { blackduckApiRef } from '../../api';
import {
  getProjectAnnotation,
  isBlackDuckAvailable,
} from '../../utils/commonUtil';
import { BLACKDUCK_PROJECT_ANNOTATION } from '@backstage-community/plugin-blackduck-common';

const useStyles = makeStyles(theme => ({
  chipLabel: {
    color: theme.palette.common.white,
  },
  chipHigh: {
    margin: 1,
    backgroundColor: '#5a100c',
  },
  chipCritical: {
    margin: 1,
    backgroundColor: '#9c251f',
  },
  chipMedium: {
    margin: 1,
    backgroundColor: '#e78c87',
  },
  chipLow: {
    backgroundColor: theme.palette.grey[500],
  },
  chipNone: {
    backgroundColor: theme.palette.grey[300],
  },
}));

const defaultColumns: TableColumn[] = [
  { title: 'Component Name', field: 'componentName' },
  { title: 'Component Version', field: 'componentVersionName' },
  { title: 'Vulnerability Name', field: 'vulnerabilityName' },
  {
    title: 'Published On',
    field: 'vulnerabilityPublishedDate',
    type: 'date',
  },
  {
    title: 'Updated On',
    field: 'vulnerabilityUpdatedDate',
    type: 'date',
  },
  { title: 'Scores', field: 'scores', width: '100px' },
  {
    title: 'Severity',
    field: 'severity',
  },
  { title: 'Link', field: 'link' },
];

const blackduckFilters: TableFilter[] = [
  {
    column: 'Severity',
    type: 'multiple-select',
  },
];

type DenseTableProps = {
  vulnList: any[];
  columns: TableColumn[];
  filters: TableFilter[];
};

const DenseTable = ({ vulnList, columns, filters }: DenseTableProps) => {
  const classes = useStyles();

  const data = vulnList.map(item => {
    let gateColor: string;

    switch (item.vulnerabilityWithRemediation.severity) {
      case 'CRITICAL': {
        gateColor = classes.chipCritical;
        break;
      }
      case 'HIGH': {
        gateColor = classes.chipHigh;
        break;
      }
      case 'MEDIUM': {
        gateColor = classes.chipMedium;
        break;
      }
      case 'LOW': {
        gateColor = classes.chipLow;
        break;
      }
      default: {
        gateColor = classes.chipNone;
        break;
      }
    }

    return {
      componentName: item.componentName,
      componentVersionName: item.componentVersionName,
      vulnerabilityName: item.vulnerabilityWithRemediation.vulnerabilityName,
      vulnerabilityPublishedDate: new Date(
        item.vulnerabilityWithRemediation.vulnerabilityPublishedDate,
      ).toLocaleDateString(),
      vulnerabilityUpdatedDate: new Date(
        item.vulnerabilityWithRemediation.vulnerabilityUpdatedDate,
      ).toLocaleDateString(),
      scores: (
        <Tooltip
          title={[
            `base score: ${item.vulnerabilityWithRemediation.baseScore}`,
            <br />,
            `impact score: ${item.vulnerabilityWithRemediation.impactSubscore}`,
            <br />,
            `exploitability score: ${item.vulnerabilityWithRemediation.exploitabilitySubscore}`,
          ]}
          aria-label="scores"
        >
          <Chip
            label={item.vulnerabilityWithRemediation.overallScore}
            classes={{ root: gateColor, label: classes.chipLabel }}
          />
        </Tooltip>
      ),
      severity: item.vulnerabilityWithRemediation.severity,
      link: (
        <Link to={item.componentVersion}>
          {' '}
          <LaunchSharp />{' '}
        </Link>
      ),
    };
  });

  return (
    <Table
      options={{ search: true, paging: true }}
      columns={columns}
      data={data}
      filters={filters}
    />
  );
};

type PageContentProps = {
  hostKey: string;
  projectName: string;
  projectVersion: string;
  columns: TableColumn[];
  filters: TableFilter[];
};

export const PageContent = ({
  hostKey,
  projectName,
  projectVersion,
  columns,
  filters,
}: PageContentProps) => {
  const blackduckApi = useApi(blackduckApiRef);
  const { entity } = useEntity();
  const entityRef = stringifyEntityRef(entity);
  const { value, loading, error } = useAsync(async () => {
    const data: any = await blackduckApi.getVulns(
      hostKey,
      projectName,
      projectVersion,
      entityRef,
    );
    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (!value) {
    return (
      <EmptyState
        missing="info"
        title="No information to display"
        description={`There is no BlackDuck Project ${projectName} with version ${projectVersion} on host ${hostKey} available!`}
      />
    );
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <DenseTable
      vulnList={value.items || []}
      columns={columns}
      filters={filters}
    />
  );
};

type BlackDuckPageComponentProps = {
  columns?: TableColumn[];
  filters?: TableFilter[];
};

export const BlackDuckPageComponent = ({
  columns,
  filters,
}: BlackDuckPageComponentProps) => {
  const { entity } = useEntity();

  if (!isBlackDuckAvailable(entity)) {
    return (
      <MissingAnnotationEmptyState annotation={BLACKDUCK_PROJECT_ANNOTATION} />
    );
  }

  const { hostKey, projectName, projectVersion } = getProjectAnnotation(entity);

  if (!projectName || !projectVersion) {
    return (
      <EmptyState
        missing="info"
        title="No information to display"
        description="The project annotation is not structured correctly. The project name, or project version is missing."
      />
    );
  }

  return (
    <PageContent
      hostKey={hostKey}
      projectName={projectName}
      projectVersion={projectVersion}
      columns={columns || defaultColumns}
      filters={filters || blackduckFilters}
    />
  );
};
