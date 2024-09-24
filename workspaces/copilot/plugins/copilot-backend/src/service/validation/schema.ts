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
import Joi from 'joi';
import { MetricsType } from '@backstage-community/plugin-copilot-common';

const metricsTypeSchema = Joi.string<MetricsType>().valid(
  'enterprise',
  'organization',
);

export type MetricsQuery = {
  startDate: string;
  endDate: string;
  type: MetricsType;
  team?: string;
};

export type PeriodRangeQuery = {
  type: MetricsType;
};

export type TeamQuery = {
  type: MetricsType;
  startDate: string;
  endDate: string;
};

export const metricsQuerySchema = Joi.object<MetricsQuery>({
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  type: metricsTypeSchema.required(),
  team: Joi.string().optional(),
});

export const periodRangeQuerySchema = Joi.object<PeriodRangeQuery>({
  type: metricsTypeSchema.required(),
});

export const teamQuerySchema = Joi.object<TeamQuery>({
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  type: metricsTypeSchema.required(),
});
