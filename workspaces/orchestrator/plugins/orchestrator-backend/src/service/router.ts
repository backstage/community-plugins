import {
  createLegacyAuthAdapters,
  errorHandler,
  resolvePackagePath,
} from '@backstage/backend-common';
import {
  HttpAuthService,
  LoggerService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { PluginTaskScheduler } from '@backstage/backend-tasks';
import { Config } from '@backstage/config';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import {
  AuthorizeResult,
  BasicPermission,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import { JsonObject, JsonValue } from '@backstage/types';

import { fullFormats } from 'ajv-formats/dist/formats';
import express from 'express';
import Router from 'express-promise-router';
import { Request as HttpRequest } from 'express-serve-static-core';
import { OpenAPIBackend, Request } from 'openapi-backend';

import {
  AuditLogger,
  DefaultAuditLogger,
} from '@janus-idp/backstage-plugin-audit-log-node';
import {
  openApiDocument,
  orchestratorPermissions,
  orchestratorWorkflowExecutePermission,
  orchestratorWorkflowInstanceAbortPermission,
  orchestratorWorkflowInstanceReadPermission,
  orchestratorWorkflowInstancesReadPermission,
  orchestratorWorkflowReadPermission,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  QUERY_PARAM_BUSINESS_KEY,
  QUERY_PARAM_INCLUDE_ASSESSMENT,
  QUERY_PARAM_INSTANCE_ID,
  WorkflowInputSchemaResponse,
} from '@backstage-community/plugin-orchestrator-common';
import { UnauthorizedError } from '@janus-idp/backstage-plugin-rbac-common';

import * as pkg from '../../package.json';
import { RouterArgs } from '../routerWrapper';
import { buildFilter } from '../types/filters';
import { buildPagination } from '../types/pagination';
import { V1 } from './api/v1';
import { V2 } from './api/v2';
import { INTERNAL_SERVER_ERROR_MESSAGE } from './constants';
import { DataIndexService } from './DataIndexService';
import { DataInputSchemaService } from './DataInputSchemaService';
import { OrchestratorService } from './OrchestratorService';
import { ScaffolderService } from './ScaffolderService';
import { SonataFlowService } from './SonataFlowService';
import { WorkflowCacheService } from './WorkflowCacheService';

interface PublicServices {
  dataInputSchemaService: DataInputSchemaService;
  orchestratorService: OrchestratorService;
}

interface RouterApi {
  openApiBackend: OpenAPIBackend;
  v1: V1;
  v2: V2;
}

const authorize = async (
  request: HttpRequest,
  permission: BasicPermission,
  permissionsSvc: PermissionsService,
  httpAuth: HttpAuthService,
) => {
  const decision = (
    await permissionsSvc.authorize([{ permission: permission }], {
      credentials: await httpAuth.credentials(request),
    })
  )[0];

  return decision;
};

export async function createBackendRouter(
  args: RouterArgs,
): Promise<express.Router> {
  const {
    config,
    logger,
    discovery,
    catalogApi,
    urlReader,
    scheduler,
    permissions,
  } = args;
  const { auth, httpAuth } = createLegacyAuthAdapters({
    httpAuth: args.httpAuth,
    discovery: args.discovery,
    auth: args.auth,
  });
  const publicServices = initPublicServices(logger, config, scheduler);

  const routerApi = await initRouterApi(publicServices.orchestratorService);

  const auditLogger = new DefaultAuditLogger({
    logger: logger,
    authService: auth,
    httpAuthService: httpAuth,
  });

  const router = Router();
  const permissionsIntegrationRouter = createPermissionIntegrationRouter({
    permissions: orchestratorPermissions,
  });
  router.use(express.json());
  router.use(permissionsIntegrationRouter);
  router.use('/workflows', express.text());
  router.use('/static', express.static(resolvePackagePath(pkg.name, 'static')));

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const scaffolderService: ScaffolderService = new ScaffolderService(
    logger,
    config,
    catalogApi,
    urlReader,
  );

  setupInternalRoutes(
    router,
    publicServices,
    routerApi,
    permissions,
    httpAuth,
    auditLogger,
  );
  setupExternalRoutes(router, discovery, scaffolderService, auditLogger);

  router.use((req, res, next) => {
    if (!next) {
      throw new Error('next is undefined');
    }

    routerApi.openApiBackend.handleRequest(req as Request, req, res, next);
  });

  router.use(errorHandler());
  return router;
}

function initPublicServices(
  logger: LoggerService,
  config: Config,
  scheduler: PluginTaskScheduler,
): PublicServices {
  const dataIndexUrl = config.getString('orchestrator.dataIndexService.url');
  const dataIndexService = new DataIndexService(dataIndexUrl, logger);
  const sonataFlowService = new SonataFlowService(dataIndexService, logger);

  const workflowCacheService = new WorkflowCacheService(
    logger,
    dataIndexService,
    sonataFlowService,
  );
  workflowCacheService.schedule({ scheduler: scheduler });

  const orchestratorService = new OrchestratorService(
    sonataFlowService,
    dataIndexService,
    workflowCacheService,
  );

  const dataInputSchemaService = new DataInputSchemaService();

  return {
    orchestratorService,
    dataInputSchemaService,
  };
}

async function initRouterApi(
  orchestratorService: OrchestratorService,
): Promise<RouterApi> {
  const openApiBackend = new OpenAPIBackend({
    definition: openApiDocument,
    strict: false,
    ajvOpts: {
      strict: false,
      strictSchema: false,
      verbose: true,
      addUsedSchema: false,
      formats: fullFormats, // open issue: https://github.com/openapistack/openapi-backend/issues/280
    },
    handlers: {
      validationFail: async (
        c,
        _req: express.Request,
        res: express.Response,
      ) => {
        console.log('validationFail', c.operation);
        res.status(400).json({ err: c.validation.errors });
      },
      notFound: async (_c, req: express.Request, res: express.Response) => {
        res.status(404).json({ err: `${req.path} path not found` });
      },
      notImplemented: async (_c, req: express.Request, res: express.Response) =>
        res.status(500).json({ err: `${req.path} not implemented` }),
    },
  });
  await openApiBackend.init();
  const v1 = new V1(orchestratorService);
  const v2 = new V2(orchestratorService, v1);
  return { v1, v2, openApiBackend };
}

// ======================================================
// Internal Backstage API calls to delegate to SonataFlow
// ======================================================
function setupInternalRoutes(
  router: express.Router,
  services: PublicServices,
  routerApi: RouterApi,
  permissions: PermissionsService,
  httpAuth: HttpAuthService,
  auditLogger: AuditLogger,
) {
  function manageDenyAuthorization(
    endpointName: string,
    endpoint: string,
    req: HttpRequest,
  ) {
    const error = new UnauthorizedError();
    auditLogger.auditLog({
      eventName: `${endpointName}EndpointHit`,
      stage: 'authorization',
      status: 'failed',
      level: 'error',
      request: req,
      response: {
        status: 403,
        body: {
          errors: [
            {
              name: error.name,
              message: error.message,
            },
          ],
        },
      },
      errors: [error],
      message: `Not authorize to request the ${endpoint} endpoint`,
    });
    throw error;
  }

  function auditLogRequestError(
    error: any,
    endpointName: string,
    endpoint: string,
    req: HttpRequest,
  ) {
    auditLogger.auditLog({
      eventName: `${endpointName}EndpointHit`,
      stage: 'completion',
      status: 'failed',
      level: 'error',
      request: req,
      response: {
        status: 500,
        body: {
          errors: [
            {
              name: error.name,
              message: error.message || INTERNAL_SERVER_ERROR_MESSAGE,
            },
          ],
        },
      },
      errors: [error],
      message: `Error occured while requesting the '${endpoint}' endpoint`,
    });
  }

  // v2
  routerApi.openApiBackend.register(
    'getWorkflowsOverview',
    async (_c, req, res: express.Response, next) => {
      const endpointName = 'getWorkflowsOverview';
      const endpoint = '/v2/workflows/overview';

      auditLogger.auditLog({
        eventName: 'getWorkflowsOverview',
        stage: 'start',
        status: 'succeeded',
        level: 'debug',
        request: req,
        message: `Received request to '${endpoint}' endpoint`,
      });
      const decision = await authorize(
        req,
        orchestratorWorkflowInstancesReadPermission,
        permissions,
        httpAuth,
      );
      if (decision.result === AuthorizeResult.DENY) {
        manageDenyAuthorization(endpointName, endpoint, req);
      }
      await routerApi.v2
        .getWorkflowsOverview(buildPagination(req), buildFilter(req))
        .then(result => res.json(result))
        .catch(error => {
          auditLogRequestError(error, endpointName, endpoint, req);
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
          next();
        });
    },
  );

  // v1
  router.get('/workflows/:workflowId', async (req, res) => {
    const {
      params: { workflowId },
    } = req;
    const endpointName = 'WorkflowsOverview';
    const endpoint = '/v1/workflows/overview';

    auditLogger.auditLog({
      eventName: endpointName,
      stage: 'start',
      status: 'succeeded',
      level: 'debug',
      request: req,
      message: `Received request to '${endpoint}' endpoint`,
    });
    const decision = await authorize(
      req,
      orchestratorWorkflowReadPermission,
      permissions,
      httpAuth,
    );
    if (decision.result === AuthorizeResult.DENY) {
      manageDenyAuthorization(endpointName, endpoint, req);
    }
    await routerApi.v1
      .getWorkflowById(workflowId)
      .then(result => res.status(200).json(result))
      .catch(error => {
        auditLogRequestError(error, endpointName, endpoint, req);
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  routerApi.openApiBackend.register(
    'getWorkflowById',
    async (c, _req, res, next) => {
      const workflowId = c.request.params.workflowId as string;
      const endpointName = 'getWorkflowById';
      const endpoint = `/v2/workflows/${workflowId}`;

      auditLogger.auditLog({
        eventName: endpointName,
        stage: 'start',
        status: 'succeeded',
        level: 'debug',
        request: _req,
        message: `Received request to '${endpoint}' endpoint`,
      });

      const decision = await authorize(
        _req,
        orchestratorWorkflowReadPermission,
        permissions,
        httpAuth,
      );
      if (decision.result === AuthorizeResult.DENY) {
        manageDenyAuthorization(endpointName, endpoint, _req);
      }
      await routerApi.v2
        .getWorkflowById(workflowId)
        .then(result => res.json(result))
        .catch(error => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
          next();
        });
    },
  );

  // v1
  router.get('/workflows/:workflowId/source', async (req, res) => {
    const {
      params: { workflowId },
    } = req;
    const endpointName = 'WorkflowsWorkflowIdSource';
    const endpoint = `/v1/workflows/${workflowId}/source`;

    auditLogger.auditLog({
      eventName: endpointName,
      stage: 'start',
      status: 'succeeded',
      level: 'debug',
      request: req,
      message: `Received request to '${endpoint}' endpoint`,
    });

    const decision = await authorize(
      req,
      orchestratorWorkflowReadPermission,
      permissions,
      httpAuth,
    );
    if (decision.result === AuthorizeResult.DENY) {
      manageDenyAuthorization(endpointName, endpoint, req);
    }

    try {
      const result = await routerApi.v1.getWorkflowSourceById(workflowId);
      res.status(200).contentType('text/plain').send(result);
    } catch (error) {
      res
        .status(500)
        .contentType('text/plain')
        .send((error as Error)?.message || INTERNAL_SERVER_ERROR_MESSAGE);
    }
  });

  // v2
  routerApi.openApiBackend.register(
    'getWorkflowSourceById',
    async (c, _req, res, next) => {
      const workflowId = c.request.params.workflowId as string;
      const endpointName = 'getWorkflowSourceById';
      const endpoint = `/v2/workflows/${workflowId}/source`;

      auditLogger.auditLog({
        eventName: endpointName,
        stage: 'start',
        status: 'succeeded',
        level: 'debug',
        request: _req,
        message: `Received request to '${endpoint}' endpoint`,
      });

      const decision = await authorize(
        _req,
        orchestratorWorkflowReadPermission,
        permissions,
        httpAuth,
      );
      if (decision.result === AuthorizeResult.DENY) {
        manageDenyAuthorization(endpointName, endpoint, _req);
      }

      try {
        const result = await routerApi.v2.getWorkflowSourceById(workflowId);
        res.status(200).contentType('plain/text').send(result);
      } catch (error) {
        auditLogRequestError(error, endpointName, endpoint, _req);
        res
          .status(500)
          .contentType('plain/text')
          .send((error as Error)?.message || INTERNAL_SERVER_ERROR_MESSAGE);
        next();
      }
    },
  );

  // v1
  router.post('/workflows/:workflowId/execute', async (req, res) => {
    const {
      params: { workflowId },
    } = req;
    const endpointName = 'WorkflowsWorkflowIdExecute';
    const endpoint = `/v1/workflows/${workflowId}/execute`;

    auditLogger.auditLog({
      eventName: endpointName,
      stage: 'start',
      status: 'succeeded',
      level: 'debug',
      request: req,
      message: `Received request to '${endpoint}' endpoint`,
    });

    const decision = await authorize(
      req,
      orchestratorWorkflowExecutePermission,
      permissions,
      httpAuth,
    );
    if (decision.result === AuthorizeResult.DENY) {
      manageDenyAuthorization(endpointName, endpoint, req);
    }

    const businessKey = routerApi.v1.extractQueryParam(
      req,
      QUERY_PARAM_BUSINESS_KEY,
    );

    await routerApi.v1
      .executeWorkflow(req.body, workflowId, businessKey)
      .then(result => res.status(200).json(result))
      .catch((error: { message: string }) => {
        auditLogRequestError(error, endpointName, endpoint, req);
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  routerApi.openApiBackend.register(
    'executeWorkflow',
    async (c, req: express.Request, res: express.Response) => {
      const workflowId = c.request.params.workflowId as string;
      const endpointName = 'executeWorkflow';
      const endpoint = `/v2/workflows/${workflowId}/execute`;

      auditLogger.auditLog({
        eventName: endpointName,
        stage: 'start',
        status: 'succeeded',
        level: 'debug',
        request: req,
        message: `Received request to '${endpoint}' endpoint`,
      });

      const decision = await authorize(
        req,
        orchestratorWorkflowExecutePermission,
        permissions,
        httpAuth,
      );
      if (decision.result === AuthorizeResult.DENY) {
        manageDenyAuthorization(endpointName, endpoint, req);
      }

      const businessKey = routerApi.v2.extractQueryParam(
        c.request,
        QUERY_PARAM_BUSINESS_KEY,
      );

      const executeWorkflowRequestDTO = req.body;

      await routerApi.v2
        .executeWorkflow(executeWorkflowRequestDTO, workflowId, businessKey)
        .then(result => res.status(200).json(result))
        .catch((error: { message: string }) => {
          auditLogRequestError(error, endpointName, endpoint, req);
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
        });
    },
  );

  // v2
  routerApi.openApiBackend.register(
    'getWorkflowOverviewById',
    async (c, _req: express.Request, res: express.Response, next) => {
      const workflowId = c.request.params.workflowId as string;
      const endpointName = 'getWorkflowOverviewById';
      const endpoint = `/v2/workflows/${workflowId}/overview`;

      auditLogger.auditLog({
        eventName: endpointName,
        stage: 'start',
        status: 'succeeded',
        level: 'debug',
        request: _req,
        message: `Received request to '${endpoint}' endpoint`,
      });

      const decision = await authorize(
        _req,
        orchestratorWorkflowReadPermission,
        permissions,
        httpAuth,
      );
      if (decision.result === AuthorizeResult.DENY) {
        manageDenyAuthorization(endpointName, endpoint, _req);
      }

      await routerApi.v2
        .getWorkflowOverviewById(workflowId)
        .then(result => res.json(result))
        .catch(next);
    },
  );

  // v1
  router.get('/workflows/:workflowId/inputSchema', async (req, res) => {
    const {
      params: { workflowId },
    } = req;
    const endpointName = 'WorkflowsWorkflowIdInputSchema';
    const endpoint = `/v1/workflows/${workflowId}/inputSchema`;

    auditLogger.auditLog({
      eventName: endpointName,
      stage: 'start',
      status: 'succeeded',
      level: 'debug',
      request: req,
      message: `Received request to '${endpoint}' endpoint`,
    });

    const decision = await authorize(
      req,
      orchestratorWorkflowReadPermission,
      permissions,
      httpAuth,
    );
    if (decision.result === AuthorizeResult.DENY) {
      manageDenyAuthorization(endpointName, endpoint, req);
    }

    const instanceId = routerApi.v1.extractQueryParam(
      req,
      QUERY_PARAM_INSTANCE_ID,
    );
    const assessmentInstanceId = routerApi.v1.extractQueryParam(
      req,
      QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
    );

    const workflowDefinition =
      await services.orchestratorService.fetchWorkflowInfo({
        definitionId: workflowId,
        cacheHandler: 'throw',
      });

    if (!workflowDefinition) {
      auditLogRequestError(
        new Error(`Couldn't fetch workflow definition ${workflowId}`),
        endpointName,
        endpoint,
        req,
      );
      res.status(500).send(`Couldn't fetch workflow definition ${workflowId}`);
      return;
    }
    const serviceUrl = workflowDefinition.serviceUrl;
    if (!serviceUrl) {
      auditLogRequestError(
        new Error(`Service URL is not defined for workflow ${workflowId}`),
        endpointName,
        endpoint,
        req,
      );
      res
        .status(500)
        .send(`Service URL is not defined for workflow ${workflowId}`);
      return;
    }

    // workflow source
    const definition =
      await services.orchestratorService.fetchWorkflowDefinition({
        definitionId: workflowId,
        cacheHandler: 'throw',
      });

    if (!definition) {
      auditLogRequestError(
        new Error(
          `Couldn't fetch workflow definition of workflow source ${workflowId}`,
        ),
        endpointName,
        endpoint,
        req,
      );
      res
        .status(500)
        .send(
          `Couldn't fetch workflow definition of workflow source ${workflowId}`,
        );
      return;
    }

    const response: WorkflowInputSchemaResponse = {
      definition,
      schemaSteps: [],
      isComposedSchema: false,
    };

    if (!definition.dataInputSchema) {
      res.status(200).json(response);
      return;
    }

    const workflowInfo =
      await services.orchestratorService.fetchWorkflowInfoOnService({
        definitionId: workflowId,
        serviceUrl,
        cacheHandler: 'throw',
      });

    if (!workflowInfo) {
      auditLogRequestError(
        new Error(`couldn't fetch workflow info ${workflowId}`),
        endpointName,
        endpoint,
        req,
      );
      res.status(500).send(`couldn't fetch workflow info ${workflowId}`);
      return;
    }

    if (!workflowInfo.inputSchema) {
      auditLogRequestError(
        new Error(
          `failed to retreive schema ${JSON.stringify(
            definition.dataInputSchema,
          )}`,
        ),
        endpointName,
        endpoint,
        req,
      );

      res
        .status(500)
        .send(
          `failed to retreive schema ${JSON.stringify(
            definition.dataInputSchema,
          )}`,
        );
      return;
    }

    const instanceVariables = instanceId
      ? await services.orchestratorService.fetchInstanceVariables({
          instanceId,
          cacheHandler: 'throw',
        })
      : undefined;

    const assessmentInstanceVariables = assessmentInstanceId
      ? await services.orchestratorService.fetchInstanceVariables({
          instanceId: assessmentInstanceId,
          cacheHandler: 'throw',
        })
      : undefined;

    res
      .status(200)
      .json(
        services.dataInputSchemaService.getWorkflowInputSchemaResponse(
          definition,
          workflowInfo.inputSchema,
          instanceVariables,
          assessmentInstanceVariables,
        ),
      );
  });

  // v2
  routerApi.openApiBackend.register(
    'getWorkflowStatuses',
    async (_c, _req: express.Request, res: express.Response) => {
      const endpointName = 'getWorkflowStatuses';
      const endpoint = '/v2/workflows/instances/statuses';

      auditLogger.auditLog({
        eventName: endpointName,
        stage: 'start',
        status: 'succeeded',
        level: 'debug',
        request: _req,
        message: `Received request to '${endpoint}' endpoint`,
      });
      const decision = await authorize(
        _req,
        orchestratorWorkflowInstanceReadPermission,
        permissions,
        httpAuth,
      );
      if (decision.result === AuthorizeResult.DENY) {
        manageDenyAuthorization(endpointName, endpoint, _req);
      }
      await routerApi.v2
        .getWorkflowStatuses()
        .then(result => res.status(200).json(result))
        .catch((error: { message: string }) => {
          auditLogRequestError(error, endpointName, endpoint, _req);
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
        });
    },
  );

  // v2
  routerApi.openApiBackend.register(
    'getInstances',
    async (_c, req: express.Request, res: express.Response, next) => {
      const endpointName = 'getInstances';
      const endpoint = `/v2/instances`;

      auditLogger.auditLog({
        eventName: endpointName,
        stage: 'start',
        status: 'succeeded',
        level: 'debug',
        request: req,
        message: `Received request to '${endpoint}' endpoint`,
      });

      const decision = await authorize(
        req,
        orchestratorWorkflowInstancesReadPermission,
        permissions,
        httpAuth,
      );
      if (decision.result === AuthorizeResult.DENY) {
        manageDenyAuthorization(endpointName, endpoint, req);
      }
      await routerApi.v2
        .getInstances(buildPagination(req), buildFilter(req))
        .then(result => res.json(result))
        .catch(next);
    },
  );

  // v2
  routerApi.openApiBackend.register(
    'getInstanceById',
    async (c, _req: express.Request, res: express.Response, next) => {
      const instanceId = c.request.params.instanceId as string;
      const endpointName = 'getInstanceById';
      const endpoint = `/v2/instances/${instanceId}`;

      auditLogger.auditLog({
        eventName: endpointName,
        stage: 'start',
        status: 'succeeded',
        level: 'debug',
        request: _req,
        message: `Received request to '${endpoint}' endpoint`,
      });

      const decision = await authorize(
        _req,
        orchestratorWorkflowInstanceReadPermission,
        permissions,
        httpAuth,
      );
      if (decision.result === AuthorizeResult.DENY) {
        manageDenyAuthorization(endpointName, endpoint, _req);
      }
      const includeAssessment = routerApi.v2.extractQueryParam(
        c.request,
        QUERY_PARAM_INCLUDE_ASSESSMENT,
      );
      await routerApi.v2
        .getInstanceById(instanceId, !!includeAssessment)
        .then(result => res.status(200).json(result))
        .catch(error => {
          auditLogRequestError(error, endpointName, endpoint, _req);
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
          next();
        });
    },
  );

  // v1
  router.delete('/instances/:instanceId/abort', async (req, res) => {
    const {
      params: { instanceId },
    } = req;
    const endpointName = 'InstancesInstanceIdAbort';
    const endpoint = `/v1/instances/${instanceId}/abort`;

    auditLogger.auditLog({
      eventName: endpointName,
      stage: 'start',
      status: 'succeeded',
      level: 'debug',
      request: req,
      message: `Received request to '${endpoint}' endpoint`,
    });

    const decision = await authorize(
      req,
      orchestratorWorkflowInstanceAbortPermission,
      permissions,
      httpAuth,
    );
    if (decision.result === AuthorizeResult.DENY) {
      manageDenyAuthorization(endpointName, endpoint, req);
    }

    try {
      await routerApi.v1.abortWorkflow(instanceId);
      res.status(200).send();
    } catch (error) {
      auditLogRequestError(error, endpointName, endpoint, req);
      res
        .status(500)
        .contentType('plain/text')
        .send((error as Error)?.message || INTERNAL_SERVER_ERROR_MESSAGE);
    }
  });

  // v2
  routerApi.openApiBackend.register(
    'abortWorkflow',
    async (c, _req, res, next) => {
      const instanceId = c.request.params.instanceId as string;
      const endpointName = 'getInstanceById';
      const endpoint = `/v2/instances/${instanceId}/abort`;

      auditLogger.auditLog({
        eventName: endpointName,
        stage: 'start',
        status: 'succeeded',
        level: 'debug',
        request: _req,
        message: `Received request to '${endpoint}' endpoint`,
      });

      const decision = await authorize(
        _req,
        orchestratorWorkflowInstanceAbortPermission,
        permissions,
        httpAuth,
      );
      if (decision.result === AuthorizeResult.DENY) {
        manageDenyAuthorization(endpointName, endpoint, _req);
      }
      await routerApi.v2
        .abortWorkflow(instanceId)
        .then(result => res.json(result))
        .catch(error => {
          auditLogRequestError(error, endpointName, endpoint, _req);
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
          next();
        });
    },
  );

  // v1
  router.post('/instances/:instanceId/retrigger', async (req, res) => {
    const {
      params: { instanceId },
    } = req;
    const endpointName = 'InstancesInstanceIdRetrigger';
    const endpoint = `/v1/instances/${instanceId}/retrigger`;

    auditLogger.auditLog({
      eventName: endpointName,
      stage: 'start',
      status: 'succeeded',
      level: 'debug',
      request: req,
      message: `Received request to '${endpoint}' endpoint`,
    });

    const decision = await authorize(
      req,
      orchestratorWorkflowExecutePermission,
      permissions,
      httpAuth,
    );
    if (decision.result === AuthorizeResult.DENY) {
      manageDenyAuthorization(endpointName, endpoint, req);
    }

    await routerApi.v1
      .retriggerInstanceInError(instanceId, req.body)
      .then(result => res.status(200).json(result))
      .catch((error: { message: string }) => {
        auditLogRequestError(error, endpointName, endpoint, req);
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });
}

// ======================================================
// External SonataFlow API calls to delegate to Backstage
// ======================================================
function setupExternalRoutes(
  router: express.Router,
  discovery: DiscoveryApi,
  scaffolderService: ScaffolderService,
  auditLogger: AuditLogger,
) {
  router.get('/actions', async (req, res) => {
    auditLogger.auditLog({
      eventName: 'ActionsEndpointHit',
      stage: 'start',
      status: 'succeeded',
      level: 'debug',
      request: req,
      message: `Received request to '/actions' endpoint`,
    });
    const scaffolderUrl = await discovery.getBaseUrl('scaffolder');
    const response = await fetch(`${scaffolderUrl}/v2/actions`);
    const json = await response.json();
    res.status(response.status).json(json);
  });

  router.post('/actions/:actionId', async (req, res) => {
    const { actionId } = req.params;
    auditLogger.auditLog({
      eventName: 'ActionsActionIdEndpointHit',
      stage: 'start',
      status: 'succeeded',
      level: 'debug',
      request: req,
      message: `Received request to '/actions/${actionId}' endpoint`,
    });
    const instanceId: string | undefined = req.header('kogitoprocinstanceid');
    const body: JsonObject = (await req.body) as JsonObject;

    const filteredBody = Object.fromEntries(
      Object.entries(body).filter(
        ([, value]) => value !== undefined && value !== null,
      ),
    );

    const result: JsonValue = await scaffolderService.executeAction({
      actionId,
      instanceId,
      input: filteredBody,
    });
    res.status(200).json(result);
  });
}
