/*
 * Copyright 2026 The Backstage Authors
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
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';

/**
 * The `z` instance that the actions registry hands to schema callbacks.
 */
type Zod = Parameters<
  Parameters<ActionsRegistryService['register']>[0]['schema']['input']
>[0];

/**
 * Output schema for a single check definition.
 */
export const checkSchema = (z: Zod) =>
  z
    .object({
      id: z.string().describe('The unique identifier of the check'),
      type: z.string().describe('The type of the check'),
      name: z.string().describe('The human readable name of the check'),
      description: z.string().describe('What the check verifies'),
      factIds: z
        .array(z.string())
        .describe('The fact retrievers this check depends on'),
      metadata: z
        .record(z.string(), z.any())
        .describe('Additional check metadata such as category or rank')
        .optional(),
      links: z
        .array(z.object({ title: z.string(), url: z.string() }))
        .describe('Links to further information about the check')
        .optional(),
    })
    .passthrough();

/**
 * Output schema for the result of running a single check.
 */
export const checkResultSchema = (z: Zod) =>
  z.object({
    check: checkSchema(z).describe('The check that was run'),
    facts: z
      .record(z.string(), z.unknown())
      .describe('The facts the check was evaluated against'),
    result: z
      .unknown()
      .describe('The outcome of the check, `true` when it passed'),
  });
