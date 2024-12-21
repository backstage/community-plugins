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
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import { useAsync } from 'react-use';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { Box } from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';
import { AZURE_ANNOTATION_TAG_SELECTOR } from '../entityData';

type CostAdvice = {
  solution: string;
  impact: string;
  currency: string;
  sum_savings: string;
};

type TableOutput = {
  advice: string;
  costSavings: string;
  severity: number;
  id: number;
};

export const GetEntityAzureCostAdvice = () => {
  const { entity } = useEntity();
  const [tagKey, tagValue] = (
    entity?.metadata.annotations?.[AZURE_ANNOTATION_TAG_SELECTOR] ?? '/'
  ).split('/');

  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const { value, loading, error } = useAsync(async (): Promise<
    CostAdvice[]
  > => {
    const response = await fetch(
      `${backendUrl}/api/azure-resources/rg/${tagKey}/${tagValue}/costadvice`,
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
  (value || []).forEach((item: CostAdvice, index: number) => {
    if (!recommendations[item.solution]) {
      recommendations[item.solution] = [];
      secData.push({
        id: index,
        advice: item.solution,
        costSavings: `${item.sum_savings} ${item.currency}`,
        severity: severityToNumber[item.impact],
      });
    }
  });

  const columns: TableColumn[] = [
    { title: 'Recommendation', field: 'advice' },
    { title: 'Potential savings', field: 'costSavings', sorting: false },
    {
      title: 'Impact',
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
          <AttachMoneyIcon style={{ fontSize: 30 }} />
          <Box mr={1} />
          Cost recommendations
        </Box>
      }
      options={{ search: false, paging: true, pageSize: 10, sorting: true }}
      columns={columns}
      data={secData}
    />
  );
};
