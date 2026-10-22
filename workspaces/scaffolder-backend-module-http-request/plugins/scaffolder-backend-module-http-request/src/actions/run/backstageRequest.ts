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
// Copyright 2021 Larder Software Limited
// Migrated from https://github.com/RoadieHQ/roadie-backstage-plugins in 2026.

import { AuthService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import {
  generateBackstageUrl,
  getObjFieldCaseInsensitively,
  getPluginId,
  http,
} from './helpers';
import { Body, HttpOptions } from './types';

/**
 * Creates a new action that sends an HTTP request to the Backstage API.
 *
 * @param options - Configuration options for the action, including the Discovery API,
 * optional Auth Service and optional Config API for the Zero-Leak Policy.
 * @returns A Scaffolder Template Action.
 * @public
 */
export function createHttpBackstageAction(options: {
  discovery: DiscoveryApi;
  auth?: AuthService;
  config?: Config;
}) {
  const { discovery, auth } = options;
  const actionId = 'http:backstage:request';

  return createTemplateAction({
    id: actionId,
    description:
      'Sends a HTTP request to the Backstage API. It uses the token of the user who triggers the task to authenticate requests.',
    supportsDryRun: true,
    schema: {
      input: z =>
        z.object({
          path: z.string().describe('The url path you want to query'),
          method: z
            .enum([
              'GET',
              'HEAD',
              'OPTIONS',
              'POST',
              'UPDATE',
              'DELETE',
              'PUT',
              'PATCH',
            ])
            .describe('The method type of the request'),
          headers: z
            .record(z.any())
            .optional()
            .describe('The headers you would like to pass to your request'),
          params: z
            .record(z.any())
            .optional()
            .describe(
              'The query parameters you would like to pass to your request',
            ),
          body: z
            .any()
            .optional()
            .describe('The body you would like to pass to your request'),
          logRequestPath: z
            .boolean()
            .optional()
            .describe('Option to turn request path logging off. On by default'),
          continueOnBadResponse: z
            .boolean()
            .optional()
            .describe(
              'Return response code and body and continue to next scaffolder step if the response status is 4xx or 5xx. By default the step will fail if any status code is returned 400 and above.',
            ),
          timeout: z
            .number()
            .optional()
            .describe('Timeout for the request (milliseconds)')
            .default(60000),
          useBackstageToken: z
            .boolean()
            .optional()
            .describe(
              "When true, use the backstageToken from task secrets as the Authorization header instead of exchanging initiator credentials for a plugin token. Useful when the request needs to carry the caller's token directly.",
            ),
          idempotencyKey: z
            .string()
            .optional()
            .describe(
              "When set and the scaffolder supports checkpoints (experimental task recovery), the request is wrapped in a checkpoint with this key. The HTTP request is then executed at most once per task: on a task restart/recovery the cached response is returned instead of sending the request again. Use a key that is stable and unique within the template (e.g. 'jira.create.parent'). This makes non-idempotent requests (creating tickets, issues, etc.) safe to use with recoverable templates. When omitted, behaviour is unchanged and the request is sent on every run.",
            ),
        }),
      output: z =>
        z.object({
          code: z
            .string()
            .describe('The response code of the request')
            .optional(),
          headers: z
            .record(z.any())
            .describe('The headers of the response')
            .optional(),
          body: z.any().describe('The body of the response').optional(),
        }),
    },

    async handler(ctx) {
      const { input } = ctx;
      const pluginId = getPluginId(input.path);
      const { token } =
        input.useBackstageToken && ctx.secrets?.backstageToken
          ? { token: ctx.secrets.backstageToken }
          : (await auth?.getPluginRequestToken({
              onBehalfOf: await ctx.getInitiatorCredentials(),
              targetPluginId: pluginId,
            })) ?? { token: ctx.secrets?.backstageToken };
      const { method, params } = input;
      const logRequestPath = input.logRequestPath ?? true;

      if (options.config) {
        const allowedMethods =
          options.config.getOptionalStringArray(
            'scaffolder.http.allowedMethods',
          ) ?? [];
        if (allowedMethods.length > 0 && !allowedMethods.includes(method)) {
          throw new Error(
            `SSRF Blocked: HTTP method '${method}' is not permitted by 'scaffolder.http.allowedMethods'.`,
          );
        }

        const allowedHosts =
          options.config.getOptionalStringArray(
            'scaffolder.http.allowedHosts',
          ) ?? [];
        if (allowedHosts.length > 0) {
          let hostToMatch: string;
          try {
            const parsedUrl = new URL(input.path);
            hostToMatch = parsedUrl.hostname;
          } catch (e) {
            throw new Error(
              `SSRF Blocked: Invalid URL format in path '${input.path}'.`,
            );
          }

          const isHostAllowed = allowedHosts.some(
            (host: string) =>
              hostToMatch === host || hostToMatch.endsWith(`.${host}`),
          );
          if (!isHostAllowed) {
            throw new Error(
              `SSRF Blocked: The target host '${hostToMatch}' does not match any 'scaffolder.http.allowedHosts'.`,
            );
          }
        }
      }
      const continueOnBadResponse = input.continueOnBadResponse || false;
      const url = await generateBackstageUrl(discovery, input.path);
      if (logRequestPath) {
        ctx.logger.info(
          `Creating ${method} request with ${actionId} scaffolder action against ${input.path}`,
        );
      } else {
        ctx.logger.info(
          `Creating ${method} request with ${actionId} scaffolder action`,
        );
      }

      const queryParams: string = params
        ? new URLSearchParams(params).toString()
        : '';

      let inputBody: Body = undefined;

      const inputHeaders: [string, any][] | undefined =
        input.headers && Object.entries(input.headers);
      if (
        input.body &&
        typeof input.body !== 'string' &&
        inputHeaders &&
        inputHeaders.find(
          kv =>
            kv[0].toLowerCase() === 'content-type' &&
            kv[1].toLowerCase().includes('json'),
        )
      ) {
        inputBody = JSON.stringify(input.body);
      } else {
        inputBody = input.body;
      }

      const httpOptions: HttpOptions = {
        method: input.method,
        timeout: input.timeout,
        url: queryParams !== '' ? `${url}?${queryParams}` : url,
        headers: input.headers ? { ...input.headers } : {},
        body: inputBody,
      };

      const authToken = getObjFieldCaseInsensitively(
        input.headers,
        'authorization',
      );

      if (token && !authToken) {
        ctx.logger.info(`Token is defined. Setting authorization header.`);
        httpOptions.headers.authorization = `Bearer ${token}`;
      }

      const dryRunSafeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
      if (ctx.isDryRun === true && !dryRunSafeMethods.has(method)) {
        ctx.logger.info(
          `Dry run mode. Skipping non dry-run safe method '${method}' request to ${
            queryParams !== '' ? `${input.path}?${queryParams}` : input.path
          }`,
        );
        return;
      }

      const sendRequest = () =>
        http(httpOptions, ctx.logger, continueOnBadResponse);

      // When an idempotencyKey is provided and the scaffolder supports
      // checkpoints (experimental task recovery), wrap the request so it is
      // executed at most once per task: on recovery the stored response is
      // returned instead of re-sending the request. Otherwise behave exactly
      // as before and send the request on every run.
      const { code, headers, body } =
        input.idempotencyKey && ctx.checkpoint
          ? await ctx.checkpoint({
              key: input.idempotencyKey,
              fn: sendRequest,
            })
          : await sendRequest();

      ctx.output('code', code);
      ctx.output('headers', headers);
      ctx.output('body', body);
    },
  });
}
