import express from 'express';
import Router from 'express-promise-router';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import {
  LoggerService,
  DiscoveryService,
  AuthService,
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  dataFindingParser,
  dataMatcher,
  dataProjectParser,
  fetchQueryPagination,
} from './data.service.helpers';
import { MendDataService } from './data.service';
import { MendAuthSevice } from './auth.service';
import {
  PaginationQueryParams,
  ProjectStatisticsSuccessResponseData,
  OrganizationProjectSuccessResponseData,
  CodeFindingSuccessResponseData,
  DependenciesFindingSuccessResponseData,
  ContainersFindingSuccessResponseData,
} from './data.service.types';
import {
  mendReadPermission,
  transformConditions,
  permissionIntegrationRouter,
  type FilterProps,
} from '../permission';

/** @internal */
export type RouterOptions = {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  auth: AuthService;
  httpAuth: HttpAuthService;
  permissions: PermissionsService;
};

enum ROUTE {
  PROJECT = '/project',
  FINDING = '/finding',
}

/** @internal */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, discovery, auth, httpAuth, permissions } = options;

  const router = Router();
  router.use(express.json());

  router.use(permissionIntegrationRouter);

  const checkForAuth = (
    _request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    if (MendAuthSevice.getAuthToken()) {
      next();
      return;
    }

    MendAuthSevice.connect()
      .then(next)
      .catch(() => {
        response.status(401).json({ error: 'Oops! Unauthorized' });
      });
  };

  const baseUrl = config.getString('mend.baseUrl');
  const activationKey = config.getString('mend.activationKey');

  // Init api service
  const mendDataService = new MendDataService({
    baseUrl,
    activationKey,
  });

  // Init catalog client
  const catalogClient = new CatalogClient({ discoveryApi: discovery });

  // Routes
  router.get(ROUTE.PROJECT, checkForAuth, async (request, response) => {
    try {
      // service to service auth
      const credentials = await httpAuth.credentials(request);
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'plugin.catalog.service',
      });

      // entity to project match
      const results = await Promise.all([
        catalogClient.getEntities(
          { filter: [{ kind: ['Component'] }] },
          { token },
        ),
        fetchQueryPagination<ProjectStatisticsSuccessResponseData>(
          mendDataService.getProjectStatistics,
        ),
        fetchQueryPagination<OrganizationProjectSuccessResponseData>(
          mendDataService.getOrganizationProject,
        ),
      ]);

      // permission - filter to exclude or include project
      const decision = (
        await permissions.authorizeConditional(
          [{ permission: mendReadPermission }],
          {
            credentials,
          },
        )
      )[0];

      let items;
      if (decision.result === AuthorizeResult.CONDITIONAL) {
        const filter = transformConditions(decision.conditions) as FilterProps;
        items = results[1].filter(item =>
          filter?.exclude
            ? !filter.ids.includes(item.uuid)
            : filter.ids.includes(item.uuid),
        );
      }

      const data = dataMatcher(results[0].items, items || results[1]);

      // parse data
      const projects = dataProjectParser(data, results[2]);

      response.json({
        ...projects,
        clientUrl: MendAuthSevice.getClientUrl(),
        clientName: MendAuthSevice.getClientName(),
      });
      // Allow any object structure here
    } catch (error: any) {
      logger.error('/project', error);
      response.status(500).json({ error: 'Oops! Please try again later.' });
    }
  });

  router.post(ROUTE.FINDING, checkForAuth, async (request, response) => {
    try {
      // service to service auth
      const credentials = await httpAuth.credentials(request);
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'plugin.catalog.service',
      });

      // entity to project match
      const uid = request.body.uid;

      if (!uid) {
        response.status(401).json({ error: 'Oops! No UUID provided' });
        return;
      }

      const projectResult = await Promise.all([
        catalogClient.getEntities(
          { filter: [{ 'metadata.uid': uid }] },
          { token },
        ),
        fetchQueryPagination<ProjectStatisticsSuccessResponseData>(
          mendDataService.getProjectStatistics,
        ),
        fetchQueryPagination<OrganizationProjectSuccessResponseData>(
          mendDataService.getOrganizationProject,
        ),
      ]);

      // permission - filter to exclude or include project
      const decision = (
        await permissions.authorizeConditional(
          [{ permission: mendReadPermission }],
          {
            credentials,
          },
        )
      )[0];

      let items;
      if (decision.result === AuthorizeResult.CONDITIONAL) {
        const filter = transformConditions(decision.conditions) as FilterProps;
        items = projectResult[1].filter(item =>
          filter?.exclude
            ? !filter.ids.includes(item.uuid)
            : filter.ids.includes(item.uuid),
        );
      }

      const data = dataMatcher(
        projectResult[0].items,
        items || projectResult[1],
      );

      if (!data.length) {
        response.json({
          findingList: [],
          projectName: '',
          projectUuid: '',
          clientUrl: MendAuthSevice.getClientUrl(),
          clientName: MendAuthSevice.getClientName(),
        });
        return;
      }

      const params = {
        pathParams: {
          uuid: data[0].uuid,
        },
      };

      // get project findings
      const findingResult = await Promise.all([
        fetchQueryPagination<CodeFindingSuccessResponseData>(
          (queryParam: PaginationQueryParams) =>
            mendDataService.getCodeFinding({
              ...params,
              ...queryParam,
            }),
        ),
        fetchQueryPagination<DependenciesFindingSuccessResponseData>(
          (queryParam: PaginationQueryParams) =>
            mendDataService.getDependenciesFinding({
              ...params,
              ...queryParam,
            }),
        ),
        fetchQueryPagination<ContainersFindingSuccessResponseData>(
          (queryParam: PaginationQueryParams) =>
            mendDataService.getContainersFinding({
              ...params,
              ...queryParam,
            }),
        ),
      ]);

      const project = dataProjectParser(data, projectResult[2]);
      const findingList = dataFindingParser(
        findingResult[0].filter(item => !item.suppressed), // NOTE: Do not show suppressed item
        findingResult[1].filter(
          item => !(item.findingInfo.status === 'IGNORED'),
        ), // NOTE: Do not show ignored item
        findingResult[2], // ESC-51: Follow Jira activity
      );

      response.json({
        findingList,
        projectName: project.projectList[0].entity.params.repo,
        projectUuid: project.projectList[0].uuid,
        clientUrl: MendAuthSevice.getClientUrl(),
        clientName: MendAuthSevice.getClientName(),
      });
      // Allow any object structure here
    } catch (error: any) {
      logger.error('/finding', error);
      response.status(500).json({ error: 'Oops! Please try again later.' });
    }
  });

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
