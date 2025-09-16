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
import {
  AuthService,
  DatabaseService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { Entity, UserEntityV1alpha1 } from '@backstage/catalog-model';
import { Config } from '@backstage/config';

import express from 'express';
import Router from 'express-promise-router';

import { JiraApiService } from '../api';
import { DatabaseFeedbackStore } from '../database/feedbackStore';
import { FeedbackCategory, FeedbackModel } from '../model/feedback.model';
import { NodeMailer } from './emails';

import { NotificationService } from '@backstage/plugin-notifications-node';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';

/** @internal */
export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  auth: AuthService;
  database: DatabaseService;
  notifications?: NotificationService;
  httpAuth: HttpAuthService;
}

/** @internal */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, discovery, auth, database, notifications, httpAuth } =
    options;
  const router = Router();
  const feedbackDB = await DatabaseFeedbackStore.create({
    database,
    skipMigrations: false,
    logger,
  });

  const mailer = new NodeMailer(config, logger);
  const catalogClient = new CatalogClient({ discoveryApi: discovery });
  const notificationsEnabled =
    (config.getOptionalBoolean('feedback.integrations.notifications') ??
      false) &&
    notifications !== undefined;

  router.use(express.json());
  logger.info('Feedback backend plugin is running');

  router.post('/', (req, res) => {
    (async () => {
      const reqData: FeedbackModel = req.body;
      if (!reqData.summary || reqData.summary?.trim().length < 1) {
        return res.status(500).json({ error: 'Summary field empty' });
      }
      reqData.createdAt = new Date().toISOString();

      const reqCredentials = (await (
        await httpAuth.credentials(req)
      ).principal) as { type?: string; userEntityRef?: string };
      if (reqCredentials.type === 'user') {
        reqData.createdBy = reqCredentials.userEntityRef;
      }

      reqData.updatedBy = reqData.createdBy;
      reqData.updatedAt = reqData.createdAt;

      if (reqData.feedbackType?.toUpperCase() === 'FEEDBACK')
        reqData.feedbackType = FeedbackCategory.FEEDBACK;
      else if (reqData.feedbackType?.toUpperCase() === 'BUG')
        reqData.feedbackType = FeedbackCategory.BUG;
      else
        return res.status(400).json({
          error: `The value of feedbackType should be either 'FEEDBACK'/'BUG'`,
        });

      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entityRef: Entity | undefined = await catalogClient.getEntityByRef(
        reqData.projectId!,
        {
          token,
        },
      );
      if (!entityRef) {
        return res
          .status(404)
          .json({ error: `Entity not found: ${reqData.projectId}` });
      }

      const entityRoute = `${config.getString('app.baseUrl')}/catalog/${
        entityRef.metadata.namespace
      }/${entityRef.kind}/${entityRef.metadata.name}/feedback`;

      const feedbackType =
        reqData.feedbackType === 'FEEDBACK' ? 'Feedback' : 'Issue';

      if (reqData.summary?.length > 255) {
        reqData.description = reqData.summary
          ?.concat('\n\n')
          .concat(reqData.description ?? '');
        reqData.summary = `${feedbackType} reported by ${
          reqData.createdBy?.split('/')[1]
        } for ${entityRef.metadata.title ?? entityRef.metadata.name}`;
      }

      const respObj = await feedbackDB.storeFeedbackGetUuid(reqData);
      if (respObj === 0) {
        return res.status(500).json({
          error: `Failed to create ${feedbackType}`,
        });
      }

      reqData.feedbackId = respObj.feedbackId;
      res.status(201).json({
        message: `${feedbackType} created successfully`,
        data: respObj,
      });

      if (notificationsEnabled) {
        notifications.send({
          recipients: { type: 'entity', entityRef: reqData.projectId! },
          payload: {
            title: `New ${feedbackType.toLocaleLowerCase('en-US')} for ${
              entityRef.metadata.title ?? entityRef.metadata.name
            }`,
            description: reqData.summary,
            link: `${entityRoute}`,
            severity: 'normal',
            topic: `feedback-${reqData.projectId}`,
          },
        });
      }

      if (entityRef.metadata.annotations) {
        const annotations = entityRef.metadata.annotations;
        const type = annotations['feedback/type'];
        const replyTo = annotations['feedback/email-to'];
        const reporterEmail = (
          (await catalogClient.getEntityByRef(reqData.createdBy!, {
            token,
          })) as UserEntityV1alpha1
        ).spec.profile?.email;
        const appTitle = config.getString('app.title');

        if (
          type.toUpperCase() === 'JIRA' &&
          !reqData.tag?.match(/(Excellent|Good)/g)
        ) {
          let host = annotations['feedback/host'];
          let serviceConfig: Config;
          // if host is undefined then
          // use the first host from config
          try {
            serviceConfig =
              config
                .getConfigArray('feedback.integrations.jira')
                .find(hostConfig => host === hostConfig.getString('host')) ??
              config.getConfigArray('feedback.integrations.jira')[0];
          } catch {
            return logger.error('Jira integeration not found');
          }
          host = serviceConfig.getString('host');
          const apiHost = serviceConfig.getOptionalString('apiHost') ?? host;
          const authToken = serviceConfig.getString('token');
          const hostType = serviceConfig.getOptionalString('hostType');

          const projectKey = entityRef.metadata.annotations['jira/project-key'];
          const jiraService = new JiraApiService(
            apiHost,
            authToken,
            logger,
            hostType,
          );
          const jiraUsername = reporterEmail
            ? await jiraService.getJiraUsernameByEmail(reporterEmail)
            : undefined;

          // if jira id is not there for reporter, add reporter email in description
          const jiraDescription = reqData.description!.concat(
            `\n\n${
              jiraUsername === undefined
                ? `Reported by: ${reporterEmail}`
                : '\r'
            }\n*Submitted from ${appTitle}*\n[${feedbackType} link|${entityRoute}?id=${
              reqData.feedbackId
            }]`,
          );

          const resp = await jiraService.createJiraTicket({
            projectKey: projectKey,
            summary: reqData.summary,
            description: jiraDescription,
            tag: reqData.tag!.toLowerCase().split(' ').join('-'),
            feedbackType: reqData.feedbackType,
            reporter: jiraUsername,
            jiraComponent: entityRef.metadata.annotations['jira/component'],
          });
          if (resp.key) {
            reqData.ticketUrl = `${host}/browse/${resp.key}`;
            await feedbackDB.updateFeedback(reqData);
          }
        }

        if (type.toUpperCase() === 'MAIL' || replyTo) {
          mailer.sendMail({
            to: reporterEmail ?? replyTo,
            replyTo: replyTo,
            subject: `${reqData.tag} - ${feedbackType} reported for ${
              reqData.projectId?.split('/')[1]
            }`,
            body: `
            <div>
              Hi ${reqData.createdBy?.split('/')[1]},
              <br/> 
              <br/> 
              We have received your feedback for 
                <b>
                  ${entityRef.metadata.title ?? entityRef.metadata.name}
                </b>, 
              and here are the details:
              <br/>
              <br/>
              Summary: ${reqData.summary}
              <br/>
              <br/>
              ${
                reqData.description?.length! > 0
                  ? `Description: ${reqData.description}
                <br/>
                <br/>`
                  : '\r'
              }
              Submitted from: ${reqData.url}
              <br/>
              Submitted at: ${new Date(reqData.createdAt).toUTCString()} 
              <br/>
              <br/>
              <a href="${entityRoute}?id=${reqData.feedbackId}">
                View on ${appTitle}
              </a>
            </div>`,
          });
        }
      }
      return 1;
    })();
  });

  router.get('/', (req, res) => {
    (async () => {
      const projectId = req.query.projectId
        ? (req.query.projectId as string)
        : 'all';
      const offset = req.query.offset
        ? parseInt(req.query.offset as string, 10)
        : 0;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;
      const searchKey = req.query.query?.toString() ?? '';

      const feedbackData = await feedbackDB.getAllFeedbacks(
        projectId,
        offset,
        limit,
        searchKey,
      );
      const page = offset / limit + 1;
      return res
        .status(200)
        .json({ ...feedbackData, currentPage: page, pageSize: limit });
    })();
  });

  router.get('/:id', (req, res) => {
    (async () => {
      const feedbackId = req.params.id;

      if (await feedbackDB.checkFeedbackId(feedbackId)) {
        const feedback: FeedbackModel = await feedbackDB.getFeedbackByUuid(
          feedbackId,
        );
        return res.status(200).json({
          data: feedback,
          message: 'Feedback fetched successfully',
        });
      }
      return res
        .status(404)
        .json({ error: `No feedback found for id ${feedbackId}` });
    })();
  });

  router.get('/:id/ticket', (req, res) => {
    (async () => {
      const ticketId = req.query.ticketId
        ? (req.query.ticketId as string)
        : null;
      const projectId = req.query.projectId
        ? (req.query.projectId as string)
        : null;

      if (ticketId && projectId) {
        const { token } = await auth.getPluginRequestToken({
          onBehalfOf: await auth.getOwnServiceCredentials(),
          targetPluginId: 'catalog',
        });
        const entityRef: Entity | undefined =
          await catalogClient.getEntityByRef(projectId, { token });
        if (!entityRef) {
          return res
            .status(404)
            .json({ error: `Entity not found: ${projectId}` });
        }
        const feedbackType = entityRef.metadata.annotations?.['feedback/type'];
        if (feedbackType?.toLowerCase() === 'jira') {
          let host = entityRef.metadata.annotations?.['feedback/host'];

          // if host is undefined then
          // use the first host from config
          const serviceConfig =
            config
              .getConfigArray('feedback.integrations.jira')
              .find(hostConfig => host === hostConfig.getString('host')) ??
            config.getConfigArray('feedback.integrations.jira')[0];
          host = serviceConfig.getString('host');
          const apiHost = serviceConfig.getOptionalString('apiHost') ?? host;
          const authToken = serviceConfig.getString('token');

          const resp = await new JiraApiService(
            apiHost,
            authToken,
            logger,
          ).getTicketDetails(ticketId);
          return res.status(200).json({
            data: { ...resp },
            message: 'fetched successfully',
          });
        }
      }

      return res
        .status(404)
        .json({ error: `Unable to fetch jira ticket ${ticketId}` });
    })();
  });

  // patch and delete apis
  router.patch('/:id', (req, res) => {
    (async () => {
      const feedbackId = req.params.id;
      const data: FeedbackModel = req.body;

      if (await feedbackDB.checkFeedbackId(feedbackId)) {
        data.feedbackId = feedbackId;
        data.updatedAt = new Date().toISOString();
        const updatedData = await feedbackDB.updateFeedback(data);
        if (updatedData) {
          return res.status(200).json({
            data: updatedData,
            message: 'Feedback updated successfully',
          });
        }
        return res.status(500).json({ error: 'Failed to edit the feedback' });
      }

      return res
        .status(404)
        .json({ error: `No feedback found for id ${feedbackId}` });
    })();
  });

  router.delete('/:id', (req, res) => {
    (async () => {
      const feedbackId = req.params.id;
      if (await feedbackDB.checkFeedbackId(feedbackId)) {
        await feedbackDB.deleteFeedbackById(feedbackId);
        return res.status(200).json({ message: 'Deleted successfully' });
      }

      logger.error(`No feedback found for id ${feedbackId}`);
      return res
        .status(404)
        .json({ error: `No feedback found for id ${feedbackId}` });
    })();
  });

  router.use(MiddlewareFactory.create({ config, logger }).error());
  return router;
}
