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
  DatabaseService,
  LoggerService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';

import { Knex } from 'knex';
import short from 'short-uuid';

import { FeedbackModel } from '../model/feedback.model';

export interface FeedbackStore {
  getFeedbackByUuid(uuid: string): Promise<FeedbackModel>;

  storeFeedbackGetUuid(
    data: FeedbackModel,
  ): Promise<{ feedbackId: string; projectId: string } | 0>;

  getAllFeedbacks(
    projectId: string,
    page: number,
    pageSize: number,
    searchKey: string,
  ): Promise<{ data: FeedbackModel[]; count: number }>;

  checkFeedbackId(feedbackId: string): Promise<boolean>;
  updateFeedback(data: FeedbackModel): Promise<FeedbackModel | undefined>;
  deleteFeedbackById(id: string): Promise<number>;
}

const migrationsDir = resolvePackagePath(
  '@backstage-community/plugin-feedback-backend', // Package name
  'migrations', // Migrations directory
);

export class DatabaseFeedbackStore implements FeedbackStore {
  private constructor(
    private readonly db: Knex,
    private readonly logger: LoggerService,
  ) {}

  static async create({
    database,
    skipMigrations,
    logger,
  }: {
    database: DatabaseService;
    skipMigrations: boolean;
    logger: LoggerService;
  }): Promise<DatabaseFeedbackStore> {
    const client = await database.getClient();

    if (!database.migrations?.skip && !skipMigrations) {
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }
    return new DatabaseFeedbackStore(client, logger);
  }

  async getFeedbackByUuid(feedbackId: string): Promise<FeedbackModel> {
    const result: FeedbackModel = await this.db('feedback')
      .select('*')
      .where({ feedbackId: feedbackId })
      .first();
    return result;
  }

  async getAllFeedbacks(
    projectId: string,
    offset: number,
    limit: number,
    searchKey: string,
  ): Promise<{ data: FeedbackModel[]; count: number }> {
    const operator = this.db.client.config.client === 'pg' ? 'ilike' : 'like';
    const countKey =
      this.db.client.config.client === 'pg' ? 'count' : 'count(`feedbackId`)';

    const result: FeedbackModel[] = [];

    if (projectId !== 'all') {
      const model =
        searchKey.length > 0
          ? this.db('feedback')
              .where('projectId', projectId)
              .andWhere(builder => {
                builder.orWhere('summary', operator, `%${searchKey}%`);
                builder.orWhere('ticketUrl', operator, `%${searchKey}%`);
                builder.orWhere('tag', operator, `%${searchKey}%`);
                builder.orWhere('feedbackType', operator, `%${searchKey}%`);
                builder.orWhere('projectId', operator, `%${searchKey}%`);
              })
          : this.db('feedback').where('projectId', projectId);
      try {
        const tempFeedbacksArr = await model
          .clone()
          .count('feedbackId')
          .groupBy('projectId');

        const totalFeedbacks = tempFeedbacksArr[0]?.[countKey] ?? 0;
        await model
          .clone()
          .orderBy('updatedAt', 'desc')
          .offset(offset)
          .limit(limit)
          .then(res => {
            res.forEach(data => result.push(data));
          });
        return {
          data: result,
          count: parseInt(totalFeedbacks as string, 10),
        };
      } catch (error: any) {
        this.logger.error(error.message);
      }
      return { data: result, count: 0 };
    }
    try {
      const model =
        searchKey.length > 0
          ? this.db('feedback').where(builder => {
              builder.orWhere('summary', operator, `%${searchKey}%`);
              builder.orWhere('ticketUrl', operator, `%${searchKey}%`);
              builder.orWhere('projectId', operator, `%${searchKey}%`);
              builder.orWhere('tag', operator, `%${searchKey}%`);
              builder.orWhere('feedbackType', operator, `%${searchKey}%`);
            })
          : this.db('feedback');

      const totalFeedbacks =
        (await model.clone().count('feedbackId'))[0]?.[countKey] ?? 0;
      await model
        .clone()
        .orderBy('updatedAt', 'desc')
        .limit(limit)
        .offset(offset)
        .then(res => {
          res.forEach(data => result.push(data));
        });
      return {
        data: result,
        count: parseInt(totalFeedbacks as string, 10),
      };
    } catch (error: any) {
      this.logger.error(error.message);
    }
    return {
      data: result,
      count: 0,
    };
  }

  async storeFeedbackGetUuid(
    data: FeedbackModel,
  ): Promise<{ projectId: string; feedbackId: string } | 0> {
    try {
      const id = short().generate();
      if (await this.checkFeedbackId(id))
        return await this.storeFeedbackGetUuid(data);
      await this.db('feedback').insert({
        feedbackId: id,
        summary: data.summary,
        projectId: data.projectId,
        description: data.description,
        tag: data.tag,
        ticketUrl: data.ticketUrl,
        feedbackType: data.feedbackType,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
        url: data.url,
        userAgent: data.userAgent,
      });

      return {
        feedbackId: id,
        projectId: data.projectId as string,
      };
    } catch (error: any) {
      this.logger.error(error.message);
      return 0;
    }
  }

  async checkFeedbackId(feedbackId: string): Promise<boolean> {
    const result: string = await this.db('feedback')
      .select('feedbackId')
      .where({ feedbackId: feedbackId })
      .first();

    if (result === undefined) {
      return false;
    }
    return true;
  }

  async updateFeedback(
    data: FeedbackModel,
  ): Promise<FeedbackModel | undefined> {
    const model = this.db('feedback').where('feedbackId', data.feedbackId);

    if (data.projectId) model.update('projectId', data.projectId);
    if (data.summary) model.update('summary', data.summary);
    if (data.description) model.update('description', data.description);
    if (data.tag) model.update('tag', data.tag);
    if (data.ticketUrl) model.update('ticketUrl', data.ticketUrl);
    if (data.feedbackType) model.update('feedbackType', data.feedbackType);
    if (data.createdAt) model.update('createdAt', data.createdAt);
    if (data.createdBy) model.update('createdBy', data.createdBy);
    if (data.updatedAt) model.update('updatedAt', data.updatedAt);
    if (data.updatedBy) model.update('updatedBy', data.updatedBy);
    if (data.userAgent) model.update('userAgent', data.userAgent);
    if (data.url) model.update('url', data.url);

    try {
      await model.clone();
      const result: FeedbackModel = await this.db('feedback')
        .select('*')
        .where({ feedbackId: data.feedbackId })
        .first();
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to update feedback: ${error.message}`);
      return undefined;
    }
  }

  async deleteFeedbackById(id: string): Promise<number> {
    return await this.db('feedback').where('feedbackId', id).del();
  }
}
