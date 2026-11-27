/*
 * Copyright 2021 The Backstage Authors
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
  azureDevOpsGitTagReadPermission,
  azureDevOpsPipelineReadPermission,
  azureDevOpsPullRequestDashboardReadPermission,
  azureDevOpsPullRequestReadPermission,
  DashboardPullRequest,
  PullRequestOptions,
  PullRequestStatus,
  azureDevOpsReadmeReadPermission,
  getAnnotationValuesFromEntity,
  getReadmeLocation,
  AZURE_DEVOPS_REPO_ANNOTATION,
} from '@backstage-community/plugin-azure-devops-common';

import { AzureDevOpsApi } from '../api';
import { Config } from '@backstage/config';
import {
  DEFAULT_TEAMS_LIMIT,
  PullRequestsDashboardProvider,
} from '../api/PullRequestsDashboardProvider';
import Router from 'express-promise-router';
import { UrlReaderService } from '@backstage/backend-plugin-api';
import express from 'express';
import { InputError, NotAllowedError, NotFoundError } from '@backstage/errors';
import {
  AuthorizeResult,
  ResourcePermission,
} from '@backstage/plugin-permission-common';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import {
  HttpAuthService,
  LoggerService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { getConfiguredAzureDevOpsOrganizations } from '../utils/azure-devops-utils';

const DEFAULT_TOP = 10;

/**
 * @internal
 * */
export interface RouterOptions {
  azureDevOpsApi?: AzureDevOpsApi;
  logger: LoggerService;
  config: Config;
  reader: UrlReaderService;
  permissions: PermissionsService;
  httpAuth: HttpAuthService;
  catalog: CatalogService;
}

/**
 * The Azure DevOps coordinates a request is allowed to access, taken from the
 * annotations of the catalog entity it was authorized against.
 */
interface EntityAzureDevOpsTarget {
  entity: Entity;
  project: string;
  repo?: string;
  definitions: string[];
  host?: string;
  org?: string;
}

/**
 * @internal
 * */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, reader, config, permissions, httpAuth, catalog } = options;

  // Get configured organizations from pull request dashboard config and legacy config
  const organizations = getConfiguredAzureDevOpsOrganizations(config);

  const azureDevOpsApi =
    options.azureDevOpsApi ||
    AzureDevOpsApi.fromConfig(config, { logger, urlReader: reader });

  const pullRequestsDashboardProvider =
    await PullRequestsDashboardProvider.create(logger, azureDevOpsApi);

  /**
   * Authorizes the request against the entity given in the `entityRef` query
   * parameter and checks that the requested Azure DevOps project, host and
   * organization are the ones annotated on that entity. Without this check an
   * authorized entity could be used to read data from any other repository.
   */
  const authorizeEntityRequest = async (
    req: express.Request,
    permission: ResourcePermission<'catalog-entity'>,
    // 'repo' routes are checked against the source repository annotation,
    // 'pipeline' routes against the project the build definitions live in.
    // The two can differ when the pipeline is in another project.
    scope: 'repo' | 'pipeline',
  ): Promise<EntityAzureDevOpsTarget> => {
    const entityRef = req.query.entityRef;
    if (typeof entityRef !== 'string') {
      throw new InputError('Invalid entityRef, not a string');
    }

    const credentials = await httpAuth.credentials(req);
    const decision = (
      await permissions.authorize([{ permission, resourceRef: entityRef }], {
        credentials,
      })
    )[0];

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }

    const entity = await catalog.getEntityByRef(entityRef, { credentials });
    if (!entity) {
      throw new NotFoundError(`Entity ${entityRef} not found`);
    }

    let annotations: ReturnType<typeof getAnnotationValuesFromEntity>;
    try {
      annotations = getAnnotationValuesFromEntity(entity);
    } catch (e) {
      throw new NotAllowedError(
        'Entity is not annotated for Azure DevOps access',
      );
    }

    let project = annotations.project;
    let repo = annotations.repo;
    if (scope === 'repo') {
      const [repoProject, repoName, ...rest] = (
        entity.metadata.annotations?.[AZURE_DEVOPS_REPO_ANNOTATION] ?? ''
      ).split('/');
      if (!repoProject || !repoName || rest.length > 0) {
        throw new NotAllowedError(
          'Entity is not annotated with an Azure DevOps repository',
        );
      }
      project = repoProject;
      repo = repoName;
    }

    const definitions =
      annotations.definition
        ?.split(',')
        .map(d => d.trim())
        .filter(Boolean) ?? [];
    // Fail closed when a malformed annotation leaves nothing to filter on,
    // or when a build definition annotation is set but contains no names,
    // otherwise pipeline routes would drop that restriction
    if (scope === 'pipeline' && definitions.length === 0) {
      if (annotations.definition !== undefined) {
        throw new NotAllowedError(
          'The dev.azure.com/build-definition annotation does not contain any build definition names',
        );
      }
      if (!repo) {
        throw new NotAllowedError(
          'Entity is not annotated with an Azure DevOps repository or build definition',
        );
      }
    }

    const host = req.query.host?.toString();
    const org = req.query.org?.toString();
    if (
      req.params.projectName !== project ||
      host !== annotations.host ||
      org !== annotations.org
    ) {
      throw new NotAllowedError(
        'Requested Azure DevOps resource does not match the entity annotations',
      );
    }

    return {
      entity,
      project,
      repo,
      definitions,
      host: annotations.host,
      org: annotations.org,
    };
  };

  const assertRepoMatches = (
    target: EntityAzureDevOpsTarget,
    repoName: string | undefined,
  ) => {
    if (repoName !== undefined && repoName !== target.repo) {
      throw new NotAllowedError(
        'Requested Azure DevOps resource does not match the entity annotations',
      );
    }
  };

  const router = Router();
  router.use(express.json());

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.get('/projects', async (req, res) => {
    const host = req.query.host?.toString();
    const org = req.query.org?.toString();

    // Validate that host and org are provided
    if (!host || !org) {
      throw new InputError('host and org query parameters are required');
    }

    const decision = (
      await permissions.authorize(
        [
          {
            permission: azureDevOpsPullRequestDashboardReadPermission,
          },
        ],
        { credentials: await httpAuth.credentials(req) },
      )
    )[0];

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }

    // Validate that the provided host and org are in the configured organizations
    const isValidOrganization = organizations.some(
      configuredOrg =>
        configuredOrg.host === host && configuredOrg.organization === org,
    );

    if (!isValidOrganization) {
      throw new InputError(
        `Host '${host}' with Organization '${org}' is not configured. Please check your configuration.`,
      );
    }

    const projects = await azureDevOpsApi.getProjects(host, org);
    res.status(200).json(projects);
  });

  router.get('/repository/:projectName/:repoName', async (req, res) => {
    const target = await authorizeEntityRequest(
      req,
      azureDevOpsPullRequestReadPermission,
      'repo',
    );
    assertRepoMatches(target, req.params.repoName);

    const gitRepository = await azureDevOpsApi.getGitRepository(
      target.project,
      req.params.repoName,
      target.host,
      target.org,
    );
    res.status(200).json(gitRepository);
  });

  router.get('/builds/:projectName/:repoId', async (req, res) => {
    const { repoId } = req.params;
    const top = req.query.top ? Number(req.query.top) : DEFAULT_TOP;

    const target = await authorizeEntityRequest(
      req,
      azureDevOpsPipelineReadPermission,
      'pipeline',
    );
    if (!target.repo) {
      throw new NotAllowedError(
        'Requested Azure DevOps resource does not match the entity annotations',
      );
    }
    const repository = await azureDevOpsApi.getGitRepository(
      target.project,
      target.repo,
      target.host,
      target.org,
    );
    if (repository.id?.toLowerCase() !== repoId.toLowerCase()) {
      throw new NotAllowedError(
        'Requested Azure DevOps resource does not match the entity annotations',
      );
    }

    const buildList = await azureDevOpsApi.getBuildList(
      target.project,
      repoId,
      top,
      target.host,
      target.org,
      target.definitions,
    );
    res.status(200).json(buildList);
  });

  router.get('/git-tags/:projectName/:repoName', async (req, res) => {
    const { projectName, repoName } = req.params;
    const host = req.query.host?.toString();
    const org = req.query.org?.toString();

    const target = await authorizeEntityRequest(
      req,
      azureDevOpsGitTagReadPermission,
      'repo',
    );
    assertRepoMatches(target, repoName);

    const gitTags = await azureDevOpsApi.getGitTags(
      projectName,
      repoName,
      host,
      org,
    );
    res.status(200).json(gitTags);
  });

  router.get('/pull-requests/:projectName/:repoName', async (req, res) => {
    const { projectName, repoName } = req.params;

    const top = req.query.top ? Number(req.query.top) : DEFAULT_TOP;
    const teamsLimit = req.query.teamsLimit
      ? Number(req.query.teamsLimit)
      : DEFAULT_TEAMS_LIMIT;
    const host = req.query.host?.toString();
    const org = req.query.org?.toString();
    const status = req.query.status
      ? Number(req.query.status)
      : PullRequestStatus.Active;

    const pullRequestOptions: PullRequestOptions = {
      top: top,
      status: status,
      teamsLimit: teamsLimit,
    };

    const target = await authorizeEntityRequest(
      req,
      azureDevOpsPullRequestReadPermission,
      'repo',
    );
    assertRepoMatches(target, repoName);

    const gitPullRequest = await azureDevOpsApi.getPullRequests(
      projectName,
      repoName,
      pullRequestOptions,
      host,
      org,
    );

    res.status(200).json(gitPullRequest);
  });

  router.get('/dashboard-pull-requests/:projectName', async (req, res) => {
    const { projectName } = req.params;

    const top = req.query.top ? Number(req.query.top) : DEFAULT_TOP;
    const teamsLimit = req.query.teamsLimit
      ? Number(req.query.teamsLimit)
      : DEFAULT_TEAMS_LIMIT;

    const status = req.query.status
      ? Number(req.query.status)
      : PullRequestStatus.Active;

    const host = req.query.host?.toString();
    const org = req.query.org?.toString();

    const pullRequestOptions: PullRequestOptions = {
      top: top,
      status: status,
      teamsLimit: teamsLimit,
    };

    const decision = (
      await permissions.authorize(
        [
          {
            permission: azureDevOpsPullRequestDashboardReadPermission,
          },
        ],
        { credentials: await httpAuth.credentials(req) },
      )
    )[0];

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }

    if (host || org) {
      if (!host || !org) {
        throw new InputError(
          'Both host and org query parameters are required when either is provided',
        );
      }

      const isValidOrganization = organizations.some(
        configuredOrg =>
          configuredOrg.host === host && configuredOrg.organization === org,
      );

      if (!isValidOrganization) {
        throw new InputError(
          `Host '${host}' with Organization '${org}' is not configured. Please check your configuration.`,
        );
      }
    }

    const pullRequests: DashboardPullRequest[] =
      await pullRequestsDashboardProvider.getDashboardPullRequests(
        projectName,
        pullRequestOptions,
        host,
        org,
      );

    res.status(200).json(pullRequests);
  });

  router.get('/all-teams', async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const host = req.query.host?.toString();
    const org = req.query.org?.toString();

    // Validate that host and org are provided
    if (!host || !org) {
      throw new InputError('host and org query parameters are required');
    }

    const decision = (
      await permissions.authorize(
        [
          {
            permission: azureDevOpsPullRequestDashboardReadPermission,
          },
        ],
        { credentials: await httpAuth.credentials(req) },
      )
    )[0];

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }

    // Validate that the provided host and org are in the configured organizations
    const isValidOrganization = organizations.some(
      configuredOrg =>
        configuredOrg.host === host && configuredOrg.organization === org,
    );

    if (!isValidOrganization) {
      throw new InputError(
        `Host '${host}' with Organization '${org}' is not configured. Please check your configuration.`,
      );
    }

    const allTeams = await pullRequestsDashboardProvider.getAllTeams({
      limit,
      host,
      org,
    });
    res.status(200).json(allTeams);
  });

  router.get('/builds/:projectName', async (req, res) => {
    const { projectName } = req.params;
    const repoName = req.query.repoName?.toString();
    const definitionName = req.query.definitionName?.toString();
    const top = req.query.top ? Number(req.query.top) : DEFAULT_TOP;
    const host = req.query.host?.toString();
    const org = req.query.org?.toString();

    const target = await authorizeEntityRequest(
      req,
      azureDevOpsPipelineReadPermission,
      'pipeline',
    );
    assertRepoMatches(target, repoName);
    // Annotated build definitions always apply: a request without a
    // definition name would otherwise list every build in the project
    // or repository.
    const definitionAllowed =
      target.definitions.length === 0
        ? definitionName === undefined
        : definitionName !== undefined &&
          target.definitions.includes(definitionName.trim());
    if (!definitionAllowed) {
      throw new NotAllowedError(
        'Requested Azure DevOps resource does not match the entity annotations',
      );
    }

    const builds = await azureDevOpsApi.getBuildRuns(
      projectName,
      top,
      target.repo,
      definitionName,
      host,
      org,
    );
    res.status(200).json(builds);
  });

  router.get('/users/:userId/team-ids', async (req, res) => {
    const { userId } = req.params;
    const host = req.query.host?.toString();
    const org = req.query.org?.toString();

    // Validate that host and org are provided
    if (!host || !org) {
      throw new InputError('host and org query parameters are required');
    }

    const decision = (
      await permissions.authorize(
        [
          {
            permission: azureDevOpsPullRequestDashboardReadPermission,
          },
        ],
        { credentials: await httpAuth.credentials(req) },
      )
    )[0];

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }

    // Validate that the provided host and org are in the configured organizations
    const isValidOrganization = organizations.some(
      configuredOrg =>
        configuredOrg.host === host && configuredOrg.organization === org,
    );

    if (!isValidOrganization) {
      throw new InputError(
        `Host '${host}' with Organization '${org}' is not configured. Please check your configuration.`,
      );
    }

    const teamIds = await pullRequestsDashboardProvider.getUserTeamIds(
      userId,
      host,
      org,
    );
    res.status(200).json(teamIds);
  });

  router.get('/readme/:projectName/:repoName', async (req, res) => {
    const host =
      req.query.host?.toString() ?? config.getString('azureDevOps.host');
    const org =
      req.query.org?.toString() ?? config.getString('azureDevOps.organization');
    const { projectName, repoName } = req.params;

    const target = await authorizeEntityRequest(
      req,
      azureDevOpsReadmeReadPermission,
      'repo',
    );
    assertRepoMatches(target, repoName);

    // The file path and version come from the entity annotations rather than
    // the request, so only the README configured for the entity can be read
    let readmeLocation: ReturnType<typeof getReadmeLocation>;
    try {
      readmeLocation = getReadmeLocation(target.entity);
    } catch (e) {
      throw new InputError(e instanceof Error ? e.message : String(e));
    }

    const readme = await azureDevOpsApi.getReadme(
      host,
      org,
      projectName,
      repoName,
      readmeLocation.path,
      readmeLocation.version,
    );

    res.status(200).json(readme);
  });

  router.get('/builds/:projectName/build/:buildId/log', async (req, res) => {
    const { projectName } = req.params;
    const buildId = Number(req.params.buildId);
    const host = req.query.host?.toString();
    const org = req.query.org?.toString();

    if (isNaN(buildId)) {
      throw new InputError('Invalid buildId parameter');
    }

    const target = await authorizeEntityRequest(
      req,
      azureDevOpsPipelineReadPermission,
      'pipeline',
    );

    // The build must belong to the entity's annotated repository and to one
    // of its annotated build definitions, whichever of the two are set
    const build = await azureDevOpsApi.getBuild(
      projectName,
      buildId,
      host,
      org,
    );
    if (!build) {
      res.status(200).json({ log: [] });
      return;
    }
    // Compare by ID: repository names are only unique within a project and
    // repository type, and definition annotations can be name patterns
    let matchesRepo = true;
    if (target.repo !== undefined) {
      const repository = await azureDevOpsApi.getGitRepository(
        target.project,
        target.repo,
        target.host,
        target.org,
      );
      matchesRepo =
        repository?.id !== undefined &&
        build.repository?.type === 'TfsGit' &&
        build.repository?.id?.toLowerCase() === repository.id.toLowerCase();
    }
    let matchesDefinition = true;
    if (target.definitions.length > 0) {
      const definitionIds = await azureDevOpsApi.getBuildDefinitionIds(
        target.project,
        target.definitions,
        target.host,
        target.org,
      );
      matchesDefinition =
        build.definition?.id !== undefined &&
        definitionIds.includes(build.definition.id);
    }
    const belongsToEntity = matchesRepo && matchesDefinition;
    if (!belongsToEntity) {
      throw new NotAllowedError(
        'Requested Azure DevOps resource does not match the entity annotations',
      );
    }

    const logForBuild = await azureDevOpsApi.getBuildRunLog(
      projectName,
      Number(buildId),
      host,
      org,
    );

    res.status(200).json({ log: logForBuild });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
