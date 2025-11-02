import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import express, { Router } from 'express';
import { Issuer, generators } from 'openid-client';
import { isTokenExpired } from './utils';
import { DataBaseEntityApplicationStorage } from './database/storage';
import dotenv from 'dotenv';

// @public (undocumented)
export const mtaPlugin = createBackendPlugin({
  pluginId: 'mta',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        database: coreServices.database,
        userInfo: coreServices.userInfo,
        cache: coreServices.cache,
        httpAuth: coreServices.httpAuth,
        http: coreServices.httpRouter, // Automatically mounts at `/api/mta`
      },
      async init({
        logger,
        config,
        database,
        userInfo,
        cache,
        httpAuth,
        http,
      }) {
        logger.info('Initializing MTA plugin');

        const router = Router();
        router.use(express.json());

        // Setup OpenID Authentication Client
        const backstageBaseURL = config.getString('backend.baseUrl');
        const frontEndBaseURL = config.getString('app.baseUrl');
        const baseUrl = config.getString('mta.url').replace(/\/+$/, '');
        const baseURLHub = `${baseUrl}/hub`;
        const realm = config.getString('mta.providerAuth.realm');
        const clientID = config.getString('mta.providerAuth.clientID');
        const secret = config.getString('mta.providerAuth.secret');
        const baseURLAuth = `${baseUrl}/auth/realms/${realm}`;
        const mtaAuthIssuer = await Issuer.discover(baseURLAuth);

        const authClient = new mtaAuthIssuer.Client({
          client_id: clientID,
          client_secret: secret,
          response_types: ['code'],
        });

        dotenv.config();

        // No need for migrations directory - using embedded migrations
        const databaseClient = await database.getClient();
        const entityApplicationStorage =
          await DataBaseEntityApplicationStorage.create(databaseClient, logger);

        // OpenID Code Challenge
        const code_verifier = generators.codeVerifier();
        const code_challenge = generators.codeChallenge(code_verifier);

        router.use(async (request, response, next) => {
          try {
            logger.info(`Incoming request: ${request.path}`);

            if (
              request.path.includes('/cb') ||
              request.path.includes('/health')
            ) {
              next(); // Pass request through for health and callback routes
              return;
            }

            const credentials = await httpAuth.credentials(request, {
              allow: ['user'],
            });
            logger.info(
              `Credentials extracted: ${JSON.stringify(credentials)}`,
            );

            const backstageID = await userInfo.getUserInfo(credentials);
            logger.info(`Backstage user info: ${JSON.stringify(backstageID)}`);

            const userId = backstageID?.userEntityRef ?? 'undefined';

            let accessToken = await cache.get(String(userId));
            logger.info(
              `Cached access token for user ${userId}: ${accessToken ? 'Exists' : 'Not Found'}`,
            );

            if (!accessToken) {
              const refreshToken =
                await entityApplicationStorage.getRefreshTokenForUser(userId);

              if (refreshToken) {
                logger.info(`Refresh token found for user: ${userId}`);

                if (isTokenExpired(refreshToken)) {
                  logger.warn(`Refresh token expired for user: ${userId}`);
                } else {
                  const tokenSet = await authClient.refresh(
                    String(refreshToken),
                  );
                  if (tokenSet?.access_token) {
                    accessToken = tokenSet.access_token;
                    await cache.set(String(userId), accessToken, {
                      ttl: tokenSet.expires_in ?? 60 * 1000,
                    });

                    if (
                      tokenSet.refresh_token !== refreshToken &&
                      tokenSet.refresh_token
                    ) {
                      await entityApplicationStorage.saveRefreshTokenForUser(
                        String(userId),
                        tokenSet.refresh_token,
                      );
                    }
                    logger.info(
                      `Access token refreshed successfully for user: ${userId}`,
                    );
                  }
                }
              } else {
                logger.warn(`No refresh token found for user: ${userId}`);
              }
            }

            if (!accessToken) {
              const authorizationURL = authClient.authorizationUrl({
                redirect_uri: `${backstageBaseURL}/api/mta/cb/${encodeURIComponent(userId)}`,
                code_challenge,
                code_challenge_method: 'S256',
              });

              logger.info(
                `Redirecting user ${userId} to login: ${authorizationURL}`,
              );
              response.status(401).json({ loginURL: authorizationURL });
              return; // Ensures function exits after response is sent
            }

            response.locals.accessToken = accessToken;
            next();
            return; // Proceed to next middleware
          } catch (error: any) {
            logger.error('Error in authentication middleware:', error);
            response.status(500).json({ error: 'Internal Server Error' });
            return; // Ensures function always returns explicitly
          }
        });

        // Callback Routes
        router.get('/cb/:username', async (request, response) => {
          try {
            logger.info(
              `Callback triggered for user: ${request.params.username}`,
            );

            const encodedUser = request.params.username;
            const user = decodeURIComponent(encodedUser);
            const params = authClient.callbackParams(request);
            logger.info(
              `OAuth callback params received: ${JSON.stringify(params)}`,
            );

            const callbackUrl = new URL(
              `${backstageBaseURL}/api/mta/cb/${encodeURIComponent(user)}`,
            );

            logger.info(`OAuth callback URL: ${callbackUrl}`);

            const tokenSet = await authClient.callback(
              callbackUrl.toString(),
              params,
              {
                code_verifier,
              },
            );

            logger.info(
              `OAuth token set received: ${JSON.stringify(tokenSet)}`,
            );

            if (!tokenSet.access_token || !tokenSet.refresh_token) {
              logger.error('Missing access or refresh token in callback');
              response.status(401).json({ error: 'Authentication failed' });
              return;
            }

            // Store tokens in cache and database
            await cache.set(user, tokenSet.access_token, {
              ttl: tokenSet.expires_in ?? 60 * 1000,
            });

            await entityApplicationStorage.saveRefreshTokenForUser(
              user,
              tokenSet.refresh_token,
            );

            logger.info(`Tokens stored for user: ${user}`);
            response.redirect(
              request.query.continueTo?.toString() ?? frontEndBaseURL,
            );
          } catch (error: any) {
            logger.error('Error handling OAuth callback', error);
            response.status(500).json({ error: 'Internal Server Error' });
          }
        });

        // API Routes
        router.get('/tasks', async (_, response) => {
          const fetchResponse = await fetch(
            `${baseURLHub}/tasks/report/dashboard`,
            {
              credentials: 'include',
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${response.locals.accessToken}`,
              },
            },
          );

          const text = await fetchResponse.text();
          const json = text ? JSON.parse(text) : {};

          response.status(fetchResponse.status).json(json);
        });

        router.get('/targets', async (_, response) => {
          const fetchResponse = await fetch(`${baseURLHub}/targets`, {
            credentials: 'include',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${response.locals.accessToken}`,
            },
          });

          const text = await fetchResponse.text();
          const json = text ? JSON.parse(text) : {};

          response.status(fetchResponse.status).json(json);
        });

        router.get('/identities', async (_, response) => {
          const fetchResponse = await fetch(`${baseURLHub}/identities`, {
            credentials: 'include',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${response.locals.accessToken}`,
            },
          });

          const text = await fetchResponse.text();
          const json = text ? JSON.parse(text) : {};

          response.status(fetchResponse.status).json(json);
        });

        router.get('/applications', async (_, response) => {
          const fetchResponse = await fetch(`${baseURLHub}/applications`, {
            credentials: 'include',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${response.locals.accessToken}`,
            },
          });

          const text = await fetchResponse.text();
          const json = text ? JSON.parse(text) : {};

          response.status(fetchResponse.status).json(json);
        });

        router.post(
          '/analyze-application/:applicationId',
          async (request, response) => {
            const applicationId = request.params.applicationId;
            const analysisOptions = request.body; // Assuming all other required options are passed in the body
            const { application, targetList } = analysisOptions;

            logger.info('Received request to analyze application:', {
              applicationId,
              application,
              targetList,
            });

            const TASKGROUPS = `${baseURLHub}/taskgroups`;
            // Step 1: Create a task group

            const defaultTaskData: TaskData = {
              tagger: {
                enabled: true,
              },
              verbosity: 0,
              mode: {
                binary: false,
                withDeps: false,
                artifact: '',
              },
              targets: [],
              sources: [],
              scope: {
                withKnownLibs: false,
                packages: {
                  included: [],
                  excluded: [],
                },
              },
            };

            const defaultTaskgroup = {
              name: `taskgroup.analyzer`,
              data: {
                ...defaultTaskData,
              },
              tasks: [],
              kind: 'analyzer',
            };

            const createTaskgroup = async (obj: Taskgroup) => {
              console.log('obj', obj);
              const createTaskgroupResponse = await fetch(TASKGROUPS, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json, text/plain, */*',

                  Authorization: `Bearer ${response.locals.accessToken}`,
                },
                body: JSON.stringify(obj),
              });

              // Correct use of response status from the fetch call
              if (!createTaskgroupResponse.ok) {
                const contentType =
                  createTaskgroupResponse.headers.get('content-type');
                let errorText;

                // Check if the response is text/html which might indicate a redirection or an error page
                if (contentType && contentType.includes('text/html')) {
                  errorText =
                    'Received HTML response instead of JSON. Possible authorization or redirect issue.';
                } else {
                  errorText = await createTaskgroupResponse.text();
                }

                logger.error(
                  `Unable to call hub, status: ${createTaskgroupResponse.status}, message: ${errorText}`,
                );
                throw new Error(
                  `HTTP error! status: ${createTaskgroupResponse.status}, body: ${errorText}`,
                );
              }

              try {
                return await createTaskgroupResponse.json();
              } catch (e) {
                throw new Error('Failed to parse JSON response.');
              }
            };

            const submitTaskgroup = async (obj: Taskgroup) => {
              const submitTaskgroupResponse = await fetch(
                `${TASKGROUPS}/${obj.id}/submit`,
                {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json, text/plain, */*',
                    Authorization: `Bearer ${response.locals.accessToken}`,
                  },
                  body: JSON.stringify(obj),
                },
              );

              if (!submitTaskgroupResponse.ok) {
                const errorText = await submitTaskgroupResponse.text();
                logger.info(
                  `Unable to call hub, status: ${submitTaskgroupResponse.status}, message: ${errorText}`,
                );
                throw new Error(
                  `HTTP error! status: ${submitTaskgroupResponse.status}, body: ${errorText}`,
                );
              }
              // Return the status code to indicate success or no content
              logger.info(
                `Operation successful, status code: ${submitTaskgroupResponse.status}`,
              );
              return {
                status: submitTaskgroupResponse.status,
                message: 'Submission successful',
              };
            };

            try {
              const taskgroupResponse = await createTaskgroup(defaultTaskgroup);
              taskgroupResponse.tasks = [
                {
                  name: `taskgroup.analyzer.${application.name}`,
                  data: {},
                  application: {
                    id: application.id as number,
                    name: application.name,
                  },
                },
              ];
              taskgroupResponse.data.mode = {
                binary: false,
                withDeps: true,
                artifact: '',
              };
              taskgroupResponse.data.rules = {
                labels: {
                  excluded: [],
                  // included: [
                  //   'konveyor.io/target=eap8',
                  //   'konveyor.io/target=cloud-readiness',
                  //   'konveyor.io/target=quarkus',
                  // ],
                  included: targetList,
                },
              };
              console.log('submitted taskgroup', taskgroupResponse);
              await submitTaskgroup(taskgroupResponse);
              logger.info(
                `Taskgroup submitted. Status: ${response?.status ?? 'unknown'}`,
              );
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error: any) {
              logger.error(
                `Error submitting taskgroup: app ID: ${applicationId}`,
                error,
              );
              response.status(500).json({
                error: 'Internal Server Error',
                details: error.message,
              });
            }
          },
        );
        ///

        router.get('/issues/:id', async (request, response) => {
          const fetchResponse = await fetch(
            `${baseURLHub}/applications/${request.params.id}/analysis/issues`,
            {
              credentials: 'include',
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${response.locals.accessToken}`,
              },
            },
          );

          const text = await fetchResponse.text();
          const json = text ? JSON.parse(text) : {};

          response.status(fetchResponse.status).json(json);
        });

        // Attach error handler

        // Register authentication policy
        http.addAuthPolicy({
          path: '/cb/:username',
          allow: 'unauthenticated',
        });

        // Register the router with Backstage's HTTP service
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
  tagger: {
    enabled: boolean;
  };
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
    packages: {
      included: string[];
      excluded: string[];
    };
  };
  rules?: {
    path: string;
    tags: {
      excluded: string[];
    };
    repository?: Repository;
    identity?: Ref;
    labels: {
      included: string[];
      excluded: string[];
    };
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
