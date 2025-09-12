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
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { examples } from './createSonarQubeProject.examples';

import querystring from 'querystring';

const id = 'sonarqube:create-project';

interface RequestParameters {
  name: string;
  project: string;
  mainBranch?: string;
  visibility?: string;
}

/**
 * @public
 */
export const createSonarQubeProjectAction = () => {
  return createTemplateAction({
    id: id,
    description: 'Creates a new project in SonarQube',
    examples,
    schema: {
      input: {
        baseUrl: z =>
          z
            .string()
            .url()
            .describe(
              'SonarQube server base URL. Example: "https://sonar-server.com"',
            ),
        name: z =>
          z
            .string()
            .describe(
              'Name of the project to be created in SonarQube. Example: "My Project"',
            ),
        key: z =>
          z
            .string()
            .describe(
              'Key of the project to identify the project in SonarQube. Example: "my-project"',
            ),
        branch: z =>
          z
            .string()
            .optional()
            .describe(
              'Name of the main branch of the project. If not provided, the default main branch name will be used',
            ),
        visibility: z =>
          z
            .string()
            .optional()
            .describe(
              'Whether the created project should be visible to everyone or only specific groups. If no visibility is specified, the default project visibility will be used. Allowed values: "public" or "private"',
            ),
        token: z =>
          z
            .string()
            .optional()
            .describe(
              'SonarQube authentication token. Please review the SonarQube documentation on how to create a token',
            ),
        username: z =>
          z
            .string()
            .optional()
            .describe(
              'SonarQube username. If a token is provided it will be used instead of username and password',
            ),
        password: z =>
          z
            .string()
            .optional()
            .describe(
              'SonarQube password. If a token is provided it will be used instead of username and password',
            ),
      },
      output: {
        projectUrl: z =>
          z
            .string()
            .url()
            .describe('SonarQube project URL created by this action'),
      },
    },
    async handler(ctx) {
      const {
        baseUrl,
        token,
        username,
        password,
        name,
        key,
        branch,
        visibility,
      } = ctx.input;

      if (!token && (!username || !password)) {
        throw new Error(
          '"token" or "username" and "password" are required input parameters',
        );
      }

      if (!baseUrl) {
        throw new Error('"baseUrl" is a required input parameter');
      }

      if (!name) {
        throw new Error('"name" is a required input parameter');
      }

      if (!key) {
        throw new Error('"key" is a required input parameter');
      }

      const requestParams: RequestParameters = {
        name: name,
        project: key,
      };

      if (branch) {
        requestParams.mainBranch = branch;
      }

      if (visibility) {
        requestParams.visibility = visibility;
      }

      const queryString = querystring.stringify({ ...requestParams });

      const encodedURI = encodeURI(
        `${baseUrl}/api/projects/create?${queryString}`,
      );

      const authString = token ? `${token}:` : `${username}:${password}`;

      const encodedAuthString = Buffer.from(authString).toString('base64');

      const response = await fetch(encodedURI, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${encodedAuthString}`,
        },
        method: 'POST',
      });

      if (!response.ok) {
        let errorMessage: string = response.statusText;
        if (response.status === 401) {
          errorMessage =
            'Unauthorized, please use a valid token or username and password';
        } else if (!response.statusText) {
          const responseBody = await response.json();
          const errorList = responseBody.errors;
          errorMessage = errorList[0].msg;
        }

        throw new Error(
          `Failed to create SonarQube project, status ${response.status} - ${errorMessage}`,
        );
      }

      ctx.output('projectUrl', `${baseUrl}/dashboard?id=${key}`);
    },
  });
};
