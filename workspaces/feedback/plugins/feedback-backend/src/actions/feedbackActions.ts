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

import {
  AuthService,
  BackstageCredentials,
  DiscoveryService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';

import {
  DEFAULT_ERROR_LIST,
  DEFAULT_EXPERIENCE_LIST,
} from '@backstage-community/plugin-feedback-common';
import axios from 'axios';
import { FeedbackModel } from '../model/feedback.model';

/**
 * Options required to register the feedback actions in the actions registry.
 *
 * @public
 */
export interface RegisterFeedbackActionsOptions {
  /**
   * The registry service where actions are registered.
   */
  actionsRegistry: ActionsRegistryService;
  /**
   * Discovery service to look up the base URL of the feedback backend.
   */
  discovery: DiscoveryService;
  /**
   * Auth service used to request scoped tokens.
   */
  auth: AuthService;
  /**
   * Root config service to retrieve limits and experience settings.
   */
  config: RootConfigService;
}

async function getRequestToken(options: {
  auth: AuthService;
  credentials: BackstageCredentials;
}) {
  const { auth, credentials } = options;
  if (auth.isPrincipal(credentials, 'user')) {
    return (await auth.getLimitedUserToken(credentials)).token;
  }
  return (
    await auth.getPluginRequestToken({
      onBehalfOf: credentials,
      targetPluginId: 'feedback',
    })
  ).token;
}

/**
 * Registers all feedback-related actions (list, get, create, update, delete)
 * within the actions registry.
 *
 * @param options - The register options including dependencies.
 * @public
 */
export async function registerFeedbackActions(
  options: RegisterFeedbackActionsOptions,
) {
  const { actionsRegistry, discovery, auth, config } = options;

  const summaryLimit = config.getOptionalNumber('feedback.summaryLimit') ?? 240;
  const experienceList =
    config.getOptionalStringArray('feedback.experienceList') ??
    DEFAULT_EXPERIENCE_LIST;
  const errorList =
    config.getOptionalStringArray('feedback.errorList') ?? DEFAULT_ERROR_LIST;

  const baseApiUrl = await discovery.getBaseUrl('feedback');

  // Action 1: feedback:list
  actionsRegistry.register({
    name: 'list-feedbacks',
    title: 'List feedbacks',
    description:
      'Retrieve feedback items with pagination, optional project ID, and search term',
    attributes: { destructive: false, readOnly: true, idempotent: true },
    schema: {
      input: zod =>
        zod.object({
          projectId: zod
            .string()
            .optional()
            .describe('Entity ref of the project or "all" to get all'),
          offset: zod
            .number()
            .optional()
            .describe('Pagination offset')
            .default(0),
          limit: zod
            .number()
            .optional()
            .describe('Pagination limit')
            .default(50),
          searchKey: zod
            .string()
            .optional()
            .describe('Search query key to filter feedbacks'),
        }),
      output: zod =>
        zod.object({
          data: zod.array(
            zod.object({
              feedbackId: zod.string().nullish(),
              summary: zod.string().nullish(),
              projectId: zod.string().nullish(),
              description: zod.string().nullish(),
              url: zod.string().nullish(),
              userAgent: zod.string().nullish(),
              tag: zod.string().nullish(),
              ticketUrl: zod.string().nullish(),
              feedbackType: zod.string().nullish(),
              createdBy: zod.string().nullish(),
              updatedBy: zod.string().nullish(),
              createdAt: zod.string().nullish(),
              updatedAt: zod.string().nullish(),
            }),
          ),
          count: zod.number(),
          currentPage: zod.number(),
          pageSize: zod.number(),
        }),
    },
    async action({ input, credentials }) {
      const projectId = input.projectId ?? 'all';
      const offset = input.offset ?? 0;
      const limit = input.limit ?? 10;
      const searchKey = input.searchKey ?? '';

      const token = await getRequestToken({
        auth: auth,
        credentials: credentials,
      });

      const resp = await axios.get<{
        data: FeedbackModel[];
        count: number;
        currentPage: number;
        pageSize: number;
      }>(baseApiUrl, {
        params: {
          projectId,
          offset,
          limit,
          query: searchKey,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        output: resp.data,
      };
    },
  });

  // Action 2: feedback:get
  actionsRegistry.register({
    name: 'get-feedback',
    title: 'Get feedback',
    description: 'Retrieve details of a feedback item by its UUID',
    attributes: { destructive: false, readOnly: true, idempotent: true },
    schema: {
      input: zod =>
        zod.object({
          feedbackId: zod.string().describe('The UUID of the feedback'),
        }),
      output: zod =>
        zod.object({
          feedback: zod
            .object({
              feedbackId: zod.string().nullish(),
              summary: zod.string().nullish(),
              projectId: zod.string().nullish(),
              description: zod.string().nullish(),
              url: zod.string().nullish(),
              userAgent: zod.string().nullish(),
              tag: zod.string().nullish(),
              ticketUrl: zod.string().nullish(),
              feedbackType: zod.string().nullish(),
              createdBy: zod.string().nullish(),
              updatedBy: zod.string().nullish(),
              createdAt: zod.string().nullish(),
              updatedAt: zod.string().nullish(),
            })
            .nullish(),
        }),
    },
    async action({ input, credentials }) {
      const token = await getRequestToken({
        auth,
        credentials,
      });

      try {
        const resp = await axios.get<{
          data: FeedbackModel;
          message: string;
        }>(`${baseApiUrl}/${input.feedbackId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        return {
          output: {
            feedback: resp.data.data,
          },
        };
      } catch (err: any) {
        if (err.response?.status === 404) {
          throw new Error(`No feedback found for id ${input.feedbackId}`);
        }
        throw new Error(
          `Failed to get feedback: ${err.response?.data?.error || err.message}`,
        );
      }
    },
  });

  // Action 3: feedback:create
  actionsRegistry.register({
    name: 'create-feedback',
    title: 'Create feedback',
    description: 'Create a new feedback or issue entry',
    attributes: { destructive: false, readOnly: false, idempotent: false },
    schema: {
      input: zod =>
        zod.object({
          summary: zod
            .string()
            .describe(
              'Summary/title of the feedback, Limit of characters is 240',
            )
            .max(summaryLimit),
          projectId: zod
            .string()
            .describe('The target entity ref (project ID)'),
          description: zod.string().optional().describe('Detailed description'),
          tag: zod
            .string()
            .optional()
            .describe(
              `Feedback tag (e.g. for type FEEDBACK: [${experienceList.join(
                ', ',
              )}], for type BUG: [${errorList.join(', ')}])`,
            ),
          feedbackType: zod
            .enum(['FEEDBACK', 'BUG'])
            .describe('Type of feedback'),
          url: zod.string().optional().describe('Origin URL of feedback'),
          userAgent: zod
            .string()
            .optional()
            .describe('User agent of the reporter'),
        }),
      output: zod =>
        zod.object({
          feedbackId: zod.string(),
          projectId: zod.string(),
          ticketUrl: zod.string().optional(),
        }),
    },
    async action({ input, credentials }) {
      const token = await getRequestToken({
        auth,
        credentials,
      });

      try {
        const resp = await axios.post<{
          message: string;
          data: {
            feedbackId: string;
            projectId: string;
            ticketUrl?: string;
          };
        }>(
          baseApiUrl,
          {
            summary: input.summary,
            projectId: input.projectId,
            description: input.description,
            tag: input.tag,
            feedbackType: input.feedbackType,
            url: input.url,
            userAgent: input.userAgent || 'MCP Action',
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        return {
          output: resp.data.data,
        };
      } catch (err: any) {
        throw new Error(
          `Failed to create feedback: ${
            err.response?.data?.error || err.message
          }`,
        );
      }
    },
  });

  // Action 4: feedback:update
  actionsRegistry.register({
    name: 'update-feedback',
    title: 'Update feedback',
    description:
      'Update properties of an existing feedback item by its UUID, before running this tool, get feedback details by running `feedback:get` tool',
    attributes: { destructive: false, readOnly: false, idempotent: true },
    schema: {
      input: zod =>
        zod.object({
          feedbackId: zod
            .string()
            .describe('The UUID of the feedback to update'),
          summary: zod
            .string()
            .optional()
            .describe('New summary for the feedback'),
          projectId: zod
            .string()
            .optional()
            .describe('New project ID or entity ref'),
          description: zod
            .string()
            .optional()
            .describe('New description for the feedback'),
          tag: zod
            .string()
            .optional()
            .describe('New tag/mood for the feedback'),
          ticketUrl: zod
            .string()
            .optional()
            .describe('New external ticket URL'),
          feedbackType: zod
            .enum(['FEEDBACK', 'BUG'])
            .optional()
            .describe('New feedback type'),
          url: zod
            .string()
            .optional()
            .describe('New origin URL where feedback was submitted'),
          userAgent: zod.string().optional().describe('New user agent string'),
        }),
      output: zod =>
        zod.object({
          feedback: zod.object({
            feedbackId: zod.string().nullish(),
            summary: zod.string().nullish(),
            projectId: zod.string().nullish(),
            description: zod.string().nullish(),
            url: zod.string().nullish(),
            userAgent: zod.string().nullish(),
            tag: zod.string().nullish(),
            ticketUrl: zod.string().nullish(),
            feedbackType: zod.string().nullish(),
            createdBy: zod.string().nullish(),
            updatedBy: zod.string().nullish(),
            createdAt: zod.string().nullish(),
            updatedAt: zod.string().nullish(),
          }),
        }),
    },
    async action({ input, credentials }) {
      const token = await getRequestToken({
        auth,
        credentials,
      });

      try {
        const resp = await axios.patch<{
          data: FeedbackModel;
          message: string;
        }>(
          `${baseApiUrl}/${input.feedbackId}`,
          {
            summary: input.summary,
            projectId: input.projectId,
            description: input.description,
            tag: input.tag,
            ticketUrl: input.ticketUrl,
            feedbackType: input.feedbackType,
            url: input.url,
            userAgent: input.userAgent,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        return {
          output: {
            feedback: resp.data.data,
          },
        };
      } catch (err: any) {
        if (err.response?.status === 404) {
          throw new Error(`No feedback found for id ${input.feedbackId}`);
        }
        throw new Error(
          `Failed to update feedback: ${
            err.response?.data?.error || err.message
          }`,
        );
      }
    },
  });

  // Action 5: feedback:delete
  actionsRegistry.register({
    name: 'delete-feedback',
    title: 'Delete feedback',
    description: 'Permanently delete a feedback item by its UUID',
    attributes: { destructive: true, readOnly: false, idempotent: true },
    schema: {
      input: zod =>
        zod.object({
          feedbackId: zod
            .string()
            .describe('The UUID of the feedback to delete'),
        }),
      output: zod =>
        zod.object({
          deleted: zod.boolean(),
        }),
    },
    async action({ input, credentials }) {
      const token = await getRequestToken({
        auth,
        credentials,
      });

      try {
        await axios.delete(`${baseApiUrl}/${input.feedbackId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        return {
          output: {
            deleted: true,
          },
        };
      } catch (err: any) {
        if (err.response?.status === 404) {
          throw new Error(`No feedback found for id ${input.feedbackId}`);
        }
        throw new Error(
          `Failed to delete feedback: ${
            err.response?.data?.error || err.message
          }`,
        );
      }
    },
  });
}
