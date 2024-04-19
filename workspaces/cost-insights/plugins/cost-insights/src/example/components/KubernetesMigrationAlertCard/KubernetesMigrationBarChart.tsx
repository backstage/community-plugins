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

import React from 'react';
import { BarChart } from '../../../components';
import {
  BarChartOptions,
  CostInsightsTheme,
  ResourceData,
} from '../../../types';
import { Entity } from '@backstage-community/plugin-cost-insights-common';
import { useTheme } from '@material-ui/core/styles';

type MigrationBarChartProps = {
  currentProduct: string;
  comparedProduct: string;
  services: Array<Entity>;
};

export const KubernetesMigrationBarChart = ({
  currentProduct,
  comparedProduct,
  services,
}: MigrationBarChartProps) => {
  const theme = useTheme<CostInsightsTheme>();

  const options: BarChartOptions = {
    previousFill: theme.palette.magenta,
    currentFill: theme.palette.yellow,
    previousName: comparedProduct,
    currentName: currentProduct,
  };

  const resources: ResourceData[] = services.map(service => ({
    name: service.id,
    previous: service.aggregation[0],
    current: service.aggregation[1],
  }));

  return <BarChart resources={resources} options={options} />;
};
