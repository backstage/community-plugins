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

import { Metric } from '@backstage-community/plugin-copilot-common';
import React from 'react';

export type LanguageStats = {
  language: string;
  totalSuggestions: number;
  totalAcceptances: number;
  acceptanceRate: number;
};

export type CardsProps = {
  team?: string;
  metrics: Metric[];
  metricsByTeam: Metric[];
  startDate: Date;
  endDate: Date;
};

export type ChartsProps = {
  team?: string;
  metrics: Metric[];
  metricsByTeam: Metric[];
};

export type FilterProps = {
  team?: string;
  setTeam: React.Dispatch<React.SetStateAction<string | undefined>>;
  options: FilterOptions;
};

export type FilterOptions = FilterOption[];

export type FilterOption = {
  label: string;
  value: string;
};
