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
import { IstioConfigItem } from '@backstage-community/plugin-kiali-common/types';
import { EmptyState } from '@backstage/core-components';
import {
  Card,
  CardContent,
  CardHeader,
  TableCellProps,
  Typography,
} from '@material-ui/core';
import { default as React } from 'react';
import { cardsHeight } from '../../styles/StyleUtils';
import {
  getGVKTypeString,
  getIstioObjectGVK,
} from '../../utils/IstioConfigUtils';
import { PFBadge } from '../Pf/PfBadges';
import { SimpleTable, tRow } from '../SimpleTable';
import { ValidationObjectSummary } from '../Validations/ValidationObjectSummary';
import { GVKToBadge } from '../VirtualList/Config';

type IstioConfigCardProps = {
  items: IstioConfigItem[];
  name: string;
};

export const IstioConfigCard: React.FC<IstioConfigCardProps> = (
  props: IstioConfigCardProps,
) => {
  const columns: TableCellProps[] = [
    { title: 'Name' },
    { title: 'Status', width: 10 },
  ];

  const noIstioConfig: React.ReactNode = (
    <EmptyState
      missing="content"
      title="Istio Config List"
      description={<div>No Istio Config found for {props.name}</div>}
    />
  );

  const overviewLink = (item: IstioConfigItem): React.ReactNode => {
    return <>{item.name}</>;
  };

  const rows: tRow = props.items
    .sort((a: IstioConfigItem, b: IstioConfigItem) => {
      if (a.kind < b.kind) {
        return -1;
      } else if (a.kind > b.kind) {
        return 1;
      }
      return a.name < b.name ? -1 : 1;
    })
    .map((item, itemIdx) => {
      return {
        cells: [
          <span key={item.name}>
            <PFBadge
              badge={
                GVKToBadge[
                  getGVKTypeString(
                    getIstioObjectGVK(item.apiVersion, item.kind),
                  )
                ]
              }
              position="top"
            />
            {overviewLink(item)}
          </span>,
          <ValidationObjectSummary
            id={`${itemIdx}-config-validation`}
            key={item.name}
            validations={item.validation ? [item.validation] : []}
          />,
        ],
      };
    });

  return (
    <Card id="IstioConfigCard" style={{ height: cardsHeight }}>
      {props.items.length > 0 && (
        <>
          <CardHeader
            title={
              <Typography variant="h6" style={{ margin: '10px' }}>
                Istio Config
              </Typography>
            }
          />

          <CardContent>
            <SimpleTable
              label="Istio Config List"
              columns={columns}
              rows={rows}
              emptyState={noIstioConfig}
            />
          </CardContent>
        </>
      )}
      {props.items.length === 0 && (
        <CardContent>
          <SimpleTable
            label="Istio Config List"
            columns={columns}
            rows={rows}
            emptyState={noIstioConfig}
          />
        </CardContent>
      )}
    </Card>
  );
};
