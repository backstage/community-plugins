import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import express, { Router } from 'express';

/** @public */
export const mtaPlugin = createBackendPlugin({
  pluginId: 'mta',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
      },
      async init({ logger, config, http }) {
        logger.info('Initializing MTA plugin');

        const router = Router();
        router.use(express.json());

        const baseUrl = config.getString('mta.url').replace(/\/+$/, '');
        const baseURLHub = `${baseUrl}/hub`;

        logger.info(`MTA Hub URL: ${baseURLHub}`);

        router.use(async (request, response, next) => {
          try {
            if (request.path.includes('/health')) {
              next();
              return;
            }

            const mtaAuthHeader = request.headers['x-mta-authorization'];
            if (
              !mtaAuthHeader ||
              !mtaAuthHeader.toString().startsWith('Bearer ')
            ) {
              response.status(401).json({
                error: 'Unauthorized',
                message: 'Missing X-MTA-Authorization header',
              });
              return;
            }

            response.locals.accessToken = mtaAuthHeader.toString().substring(7);
            next();
          } catch (error: any) {
            logger.error('Error in authentication middleware:', error);
            response.status(500).json({
              error: 'Authentication Error',
              message: error.message || 'Failed to process authentication',
            });
          }
        });

        router.get('/health', async (_, response) => {
          response.json({ status: 'ok' });
        });

        router.get('/tasks', async (_, response) => {
          const fetchResponse = await fetch(
            `${baseURLHub}/tasks/report/dashboard`,
            {
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${response.locals.accessToken}`,
              },
            },
          );
          const text = await fetchResponse.text();
          response
            .status(fetchResponse.status)
            .json(text ? JSON.parse(text) : {});
        });

        router.get('/targets', async (_, response) => {
          const fetchResponse = await fetch(`${baseURLHub}/targets`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${response.locals.accessToken}`,
            },
          });
          const text = await fetchResponse.text();
          response
            .status(fetchResponse.status)
            .json(text ? JSON.parse(text) : {});
        });

        router.get('/identities', async (_, response) => {
          const fetchResponse = await fetch(`${baseURLHub}/identities`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${response.locals.accessToken}`,
            },
          });
          const text = await fetchResponse.text();
          response
            .status(fetchResponse.status)
            .json(text ? JSON.parse(text) : {});
        });

        router.get('/applications', async (_, response) => {
          const fetchResponse = await fetch(`${baseURLHub}/applications`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${response.locals.accessToken}`,
            },
          });
          const text = await fetchResponse.text();
          response
            .status(fetchResponse.status)
            .json(text ? JSON.parse(text) : {});
        });

        router.post(
          '/analyze-application/:applicationId',
          async (request, response) => {
            const applicationId = request.params.applicationId;
            const { application, targetList } = request.body;

            logger.info('Analyzing application:', { applicationId });

            const TASKGROUPS = `${baseURLHub}/taskgroups`;

            const defaultTaskData: TaskData = {
              tagger: { enabled: true },
              verbosity: 0,
              mode: { binary: false, withDeps: false, artifact: '' },
              targets: [],
              sources: [],
              scope: {
                withKnownLibs: false,
                packages: { included: [], excluded: [] },
              },
            };

            const defaultTaskgroup = {
              name: `taskgroup.analyzer`,
              data: { ...defaultTaskData },
              tasks: [],
              kind: 'analyzer',
            };

            const createTaskgroup = async (obj: Taskgroup) => {
              const res = await fetch(TASKGROUPS, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  Authorization: `Bearer ${response.locals.accessToken}`,
                },
                body: JSON.stringify(obj),
              });

              if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
              }
              return res.json();
            };

            const submitTaskgroup = async (obj: Taskgroup) => {
              const res = await fetch(`${TASKGROUPS}/${obj.id}/submit`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  Authorization: `Bearer ${response.locals.accessToken}`,
                },
                body: JSON.stringify(obj),
              });

              if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
              }
              return { status: res.status, message: 'Submission successful' };
            };

            try {
              const taskgroupResponse = await createTaskgroup(defaultTaskgroup);
              taskgroupResponse.tasks = [
                {
                  name: `taskgroup.analyzer.${application.name}`,
                  data: {},
                  application: { id: application.id, name: application.name },
                },
              ];
              taskgroupResponse.data.mode = {
                binary: false,
                withDeps: true,
                artifact: '',
              };
              taskgroupResponse.data.rules = {
                labels: { excluded: [], included: targetList },
              };

              await submitTaskgroup(taskgroupResponse);
              response.json({ success: true, message: 'Analysis started' });
            } catch (error: any) {
              logger.error(`Error analyzing app ${applicationId}:`, error);
              response.status(500).json({
                error: 'Internal Server Error',
                details: error.message,
              });
            }
          },
        );

        router.get('/issues/:id', async (request, response) => {
          const fetchResponse = await fetch(
            `${baseURLHub}/applications/${request.params.id}/analysis/issues`,
            {
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${response.locals.accessToken}`,
              },
            },
          );
          const text = await fetchResponse.text();
          response
            .status(fetchResponse.status)
            .json(text ? JSON.parse(text) : {});
        });

        http.use(router);
      },
    });
  },
});

/** @internal */
export interface Taskgroup {
  id?: number;
  name: string;
  kind?: string;
  addon?: string;
  data: TaskData;
  tasks: TaskgroupTask[];
}

/** @internal */
export interface TaskData {
  tagger: { enabled: boolean };
  verbosity: number;
  mode: {
    binary: boolean;
    withDeps: boolean;
    artifact: string;
    csv?: boolean;
  };
  targets?: string[];
  sources?: string[];
  scope: {
    withKnownLibs: boolean;
    packages: { included: string[]; excluded: string[] };
  };
  rules?: {
    path: string;
    tags: { excluded: string[] };
    repository?: Repository;
    identity?: Ref;
    labels: { included: string[]; excluded: string[] };
  };
}

/** @internal */
export interface TaskgroupTask {
  name: string;
  data: any;
  application: Ref;
}

/** @internal */
export interface Ref {
  id: number;
  name: string;
}

/** @internal */
export interface Repository {
  kind?: string;
  branch?: string;
  path?: string;
  url?: string;
}
