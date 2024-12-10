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
import React from 'react';
import {
  Table,
  TableColumn,
  Progress,
  StatusError,
  StatusWarning,
  StatusAborted,
} from '@backstage/core-components';
import SecurityIcon from '@material-ui/icons/Security';
import { useAsync } from 'react-use';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { Box, Chip } from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';
import { AZURE_ANNOTATION_TAG_SELECTOR } from '../entityData';

type SecurityRec = {
  link: string;
  resourceId: any;
  displayName: string;
  resourceName: string;
  resourceType: string;
  resourceGroup: any;
  severity: string;
};

type TableOutput = {
  recommendation: string;
  resources: JSX.Element;
  severity: number;
  id: number;
};

export const GetEntityAzureSecurityRecommendations = () => {
  const { entity } = useEntity();
  const [tagKey, tagValue] = (
    entity?.metadata.annotations?.[AZURE_ANNOTATION_TAG_SELECTOR] ?? '/'
  ).split('/');

  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const { value, loading, error } = useAsync(async (): Promise<
    SecurityRec[]
  > => {
    const response = await fetch(
      `${backendUrl}/api/azure-resources/rg/${tagKey}/${tagValue}/secrecommendations`,
    );
    const json = await response.json();
    return json.data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <div>{error.message}</div>;
  }

  const severityToNumber: any = {
    Low: 1,
    Medium: 2,
    High: 3,
  };

  const severityToIndicator: any = {
    '1': <StatusAborted>Low</StatusAborted>,
    '2': <StatusWarning>Medium</StatusWarning>,
    '3': <StatusError>High</StatusError>,
  };

  const recommendations: any = {};
  const secData: TableOutput[] = [];
  (value || []).forEach((item: SecurityRec, index: number) => {
    if (!recommendations[item.displayName]) {
      recommendations[item.displayName] = [];
      secData.push({
        id: index,
        recommendation: item.displayName,
        resources: <ul>{recommendations[item.displayName]}</ul>,
        severity: severityToNumber[item.severity],
      });
    }
    recommendations[item.displayName].push(
      <Chip
        component="a"
        target="_blank"
        href={`http://${item.link}`}
        label={item.resourceName}
        clickable
        size="small"
        variant="outlined"
      />,
    );
  });

  const columns: TableColumn[] = [
    { title: 'Recommendation', field: 'recommendation', defaultGroupOrder: 0 },
    { title: 'Resource', field: 'resources', sorting: false },
    {
      title: 'Severity',
      field: 'severity',
      defaultSort: 'desc',
      sorting: true,
      render: (row: Partial<TableOutput>) => {
        if (row.severity) {
          return severityToIndicator[row.severity];
        }
        return null;
      },
    },
    { title: 'Id', field: 'id', hidden: true },
  ];

  return (
    <Table
      title={
        <Box display="flex" alignItems="center">
          <SecurityIcon style={{ fontSize: 30 }} />
          <Box mr={1} />
          Security recommendations
        </Box>
      }
      options={{
        search: false,
        paging: true,
        grouping: true,
        pageSize: 10,
        sorting: true,
      }}
      columns={columns}
      data={secData}
    />
  );
};
