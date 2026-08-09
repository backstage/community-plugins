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
import { z } from 'zod';
import { MetricsType } from '@backstage-community/plugin-copilot-common';

const metricsTypeSchema = z.enum(['enterprise', 'organization']);

const isoDateSchema = z.string().refine(date => !isNaN(Date.parse(date)), {
  message: 'Invalid date format',
});

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

export const metricsQuerySchema = z.object({
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  type: metricsTypeSchema,
  team: z.string().optional(),
});

export const periodRangeQuerySchema = z.object({
  type: metricsTypeSchema,
});

export const teamQuerySchema = z.object({
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  type: metricsTypeSchema,
});

// V2 schemas
export const v2MetricsQuerySchema = z.object({
  type: z.enum(['enterprise', 'organization']),
  entityId: z.string().min(1),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  team: z.string().optional(),
});
export type V2MetricsQuery = z.infer<typeof v2MetricsQuerySchema>;

export const v2FeatureQuerySchema = v2MetricsQuerySchema.extend({
  feature: z.string().optional(),
});
export type V2FeatureQuery = z.infer<typeof v2FeatureQuerySchema>;

export const v2TeamsQuerySchema = z.object({
  type: z.enum(['enterprise', 'organization']),
  entityId: z.string().min(1),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
    .optional(),
});
export type V2TeamsQuery = z.infer<typeof v2TeamsQuerySchema>;

export const v2PeriodRangeQuerySchema = z.object({
  type: z.enum(['enterprise', 'organization']),
  entityId: z.string().min(1),
});
export type V2PeriodRangeQuery = z.infer<typeof v2PeriodRangeQuerySchema>;

export const v2BackfillStatusQuerySchema = z.object({
  type: z.enum(['enterprise', 'organization']),
  entityId: z.string().min(1),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
    .optional(),
});
export type V2BackfillStatusQuery = z.infer<typeof v2BackfillStatusQuerySchema>;

export const v2BackfillBodySchema = z.object({
  type: z.enum(['enterprise', 'organization']),
  entityId: z.string().min(1),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  toDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
    .optional(),
});
export type V2BackfillBody = z.infer<typeof v2BackfillBodySchema>;
