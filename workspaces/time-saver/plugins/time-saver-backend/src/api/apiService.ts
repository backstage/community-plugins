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
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { ScaffolderClient } from './scaffolderClient';
import { ScaffolderStore } from '../database/ScaffolderDatabase';
import { TimeSaverStore } from '../database/TimeSaverDatabase';

export interface TemplateSpecs {
  specs: {
    templateInfo: {
      entity: {
        metadata: {
          substitute: object;
        };
      };
    };
  };
}

export interface SampleMigrationClassificationConfigOptions {
  useScaffolderTasksEntries?: boolean;
}

const DEFAULT_SAMPLE_CLASSIFICATION = {
  engineering: {
    devops: 8,
    development_team: 8,
    security: 3,
  },
};

const DEFAULT_SAMPLE_TEMPLATES_TASKS = [
  'template:default/create-github-project',
  'template:default/create-nodejs-service',
  'template:default/create-golang-service',
];

export class TsApi {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: RootConfigService,
    private readonly auth: AuthService,
    private readonly timeSaverDb: TimeSaverStore,
    private readonly scaffolderDb: ScaffolderStore,
  ) {}
  private readonly tsTableName = 'ts_template_time_savings';

  public async getStatsByTemplateTaskId(templateTaskId: string) {
    const templateName = await this.timeSaverDb.getTemplateNameByTsId(
      templateTaskId,
    );
    const queryResult = await this.timeSaverDb.getStatsByTemplateTaskId(
      templateTaskId,
    );
    const outputBody = {
      templateTaskId: templateTaskId,
      templateName: templateName,
      stats: queryResult,
    };
    this.logger.debug(JSON.stringify(outputBody));
    return outputBody;
  }

  public async getStatsByTeam(team: string) {
    const queryResult = await this.timeSaverDb.getStatsByTeam(team);
    const outputBody = {
      team: team,
      stats: queryResult,
    };
    this.logger.debug(JSON.stringify(outputBody));
    return outputBody;
  }

  public async getStatsByTemplate(template: string) {
    const queryResult = await this.timeSaverDb.getStatsByTemplate(template);
    const outputBody = {
      template_name: template,
      stats: queryResult,
    };
    this.logger.debug(JSON.stringify(outputBody));
    return outputBody;
  }

  public async getAllStats() {
    const queryResult = await this.timeSaverDb.getAllStats();
    const outputBody = {
      stats: queryResult,
    };
    this.logger.debug(JSON.stringify(outputBody));
    return outputBody;
  }

  public async getGroupDivisionStats() {
    const queryResult = await this.timeSaverDb.getGroupSavingsDivision();
    const outputBody = {
      stats: queryResult,
    };
    this.logger.debug(JSON.stringify(outputBody));
    return outputBody;
  }

  public async getDailyTimeSummariesTeamWise() {
    const queryResult = await this.timeSaverDb.getDailyTimeSummariesTeamWise();
    const outputBody = {
      stats: queryResult,
    };
    this.logger.debug(JSON.stringify(outputBody));
    return outputBody;
  }
  public async getDailyTimeSummariesTemplateWise() {
    const queryResult =
      await this.timeSaverDb.getDailyTimeSummariesTemplateWise();
    const outputBody = {
      stats: queryResult,
    };
    this.logger.debug(JSON.stringify(outputBody));
    return outputBody;
  }

  public async getTimeSummarySavedTeamWise() {
    const queryResult = await this.timeSaverDb.getTimeSummarySavedTeamWise();
    const outputBody = {
      stats: queryResult,
    };
    this.logger.debug(JSON.stringify(outputBody));
    return outputBody;
  }
  public async getTimeSummarySavedTemplateWise() {
    const queryResult =
      await this.timeSaverDb.getTimeSummarySavedTemplateWise();
    const outputBody = {
      stats: queryResult,
    };
    this.logger.debug(JSON.stringify(outputBody));
    return outputBody;
  }

  public async getSampleMigrationClassificationConfig(
    customClassificationRequest?: object,
    options?: SampleMigrationClassificationConfigOptions,
  ) {
    if (
      typeof customClassificationRequest === 'object' &&
      !Object.keys(customClassificationRequest).length
    ) {
      const errorMessage = `getSampleMigrationClassificationConfig : customClassificationRequest cannot be an empty object`;
      this.logger.error(
        `getSampleMigrationClassificationConfig : customClassificationRequest cannot be an empty object`,
      );
      return {
        status: 'FAIL',
        errorMessage,
      };
    }

    const sampleClassification =
      customClassificationRequest || DEFAULT_SAMPLE_CLASSIFICATION;
    const templatesList = options?.useScaffolderTasksEntries
      ? (await this.getAllTemplateTasks()).templateTasks
      : DEFAULT_SAMPLE_TEMPLATES_TASKS;
    this.logger.debug(
      `Generating sample classification configuration with ${
        options?.useScaffolderTasksEntries ? 'scaffolder DB' : 'user-defined'
      } templates tasks list and ${
        customClassificationRequest ? 'user-defined' : 'default'
      } classification`,
    );
    return {
      status: 'OK',
      data: templatesList.map(t => ({
        entityRef: t,
        ...sampleClassification,
      })),
    };
  }

  public async updateTemplatesWithSubstituteData(
    requestData?: string,
  ): Promise<{
    status: string;
    message?: string;
    migrationStatisticsReport?: object;
    error?: Error;
  }> {
    let templateClassification: [];
    let migrationStatisticsReport: {
      updatedTemplates: {
        total: number;
        list: string[];
      };
      missingTemplates: {
        total: number;
        list: string[];
      };
    } = {
      updatedTemplates: {
        total: 0,
        list: [],
      },
      missingTemplates: {
        total: 0,
        list: [],
      },
    };
    if (requestData) {
      try {
        if (typeof requestData !== 'object') {
          templateClassification = JSON.parse(requestData);
        } else {
          templateClassification = requestData;
        }

        if (
          !templateClassification ||
          !Object.keys(templateClassification).length
        ) {
          throw new Error(
            `Invalid classification ${JSON.stringify(
              requestData,
            )}. Either it was empty or could not parse JSON string. Aborting...`,
          );
        }
        this.logger.debug(
          `Found classification in API POST body: ${JSON.stringify(
            templateClassification,
          )}`,
        );
      } catch (error) {
        const msg = `Migration: Could not parse JSON object from POST call body "${JSON.stringify(
          requestData,
        )}", aborting...`;
        this.logger.error(msg, error ? (error as Error) : undefined);
        return {
          status: 'FAIL',
          message: `${msg} - ${error}`,
        };
      }
    } else {
      const tsConfigObj =
        this.config.getOptionalString('ts.backward.config') || undefined;
      if (!tsConfigObj) {
        const errorMessage =
          'Migration: Could not find backward migration configuration in app-config.x.yaml, aborting...';
        this.logger.error(errorMessage);
        return {
          status: 'FAIL',
          message: errorMessage,
        };
      }

      try {
        templateClassification = JSON.parse(String(tsConfigObj));
        this.logger.debug(
          `Found classification in app-config.x.yaml: ${JSON.stringify(
            templateClassification,
          )}`,
        );
      } catch (error) {
        const msg =
          'Migration: Could not parse backward migration configuration as JSON object from app-config.x.yaml, aborting...';
        this.logger.error(msg, error ? (error as Error) : undefined);
        return {
          status: 'FAIL',
          message: `${msg} - ${error}`,
        };
      }
    }

    try {
      interface ClassificationMigrationEntry {
        entityRef?: number;
        [key: string]: unknown;
      }

      this.logger.info(`Starting backward migration`);
      const taskTemplateList = await new ScaffolderClient(
        this.logger,
        this.config,
        this.auth,
      ).fetchTemplatesFromScaffolder();
      for (let i = 0; i < taskTemplateList.length; i++) {
        const scaffolderTaskRecord = taskTemplateList[i];
        this.logger.debug(
          `Migrating template ${JSON.stringify(scaffolderTaskRecord)}`,
        );
        const { entityRef: templateEntityRef } =
          scaffolderTaskRecord.spec.templateInfo;
        this.logger.debug(
          `Found template with entityRef: ${templateEntityRef}`,
        );
        const classificationEntry = templateClassification.find(
          (con: { entityRef: string | undefined }) =>
            con.entityRef === templateEntityRef,
        );

        if (classificationEntry) {
          //  Delete entityRef
          const newClassificationEntry = Object.assign(
            {},
            classificationEntry as ClassificationMigrationEntry,
          );
          delete newClassificationEntry.entityRef;

          const newTemplateTaskRecordSpecs = {
            ...scaffolderTaskRecord.spec,
            templateInfo: {
              ...scaffolderTaskRecord.spec.templateInfo,
              entity: {
                ...scaffolderTaskRecord.spec.templateInfo.entity,
                metadata: {
                  ...scaffolderTaskRecord.spec.templateInfo.entity.metadata,
                  substitute: newClassificationEntry,
                },
              },
            },
          };

          const patchQueryResult =
            await this.scaffolderDb.updateTemplateTaskById(
              scaffolderTaskRecord.id,
              JSON.stringify(newTemplateTaskRecordSpecs),
            );

          if (patchQueryResult) {
            migrationStatisticsReport = {
              ...migrationStatisticsReport,
              updatedTemplates: {
                total: ++migrationStatisticsReport.updatedTemplates.total,
                list: [
                  ...migrationStatisticsReport.updatedTemplates.list,
                  scaffolderTaskRecord.id,
                ],
              },
            };
            this.logger.debug(
              `scaffolderTaskRecord with id ${scaffolderTaskRecord.id} was patched`,
            );
          }
        } else {
          migrationStatisticsReport = {
            ...migrationStatisticsReport,
            missingTemplates: {
              total: ++migrationStatisticsReport.missingTemplates.total,
              list: [
                ...migrationStatisticsReport.missingTemplates.list,
                scaffolderTaskRecord.id,
              ],
            },
          };
          this.logger.debug(
            `scaffolderTaskRecord with id ${scaffolderTaskRecord.id} was not found in scaffolder DB`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Could not continue with backward migration, aborting...`,
        error ? (error as Error) : undefined,
      );
      return {
        status: 'error',
        error: error ? (error as Error) : undefined,
      };
    }
    return {
      status: 'SUCCESS',
      migrationStatisticsReport,
    };
  }

  public async getAllGroups() {
    let groups: string[];
    let outputBody: {
      groups: string[];
      errorMessage: string;
    } = {
      groups: [],
      errorMessage: '',
    };

    const queryResult = await this.timeSaverDb.getDistinctColumn(
      this.tsTableName,
      'team',
    );

    if (queryResult && queryResult.length > 0) {
      groups = queryResult.map(row => row.team);
      outputBody = {
        ...outputBody,
        groups,
      };
      this.logger.debug(JSON.stringify(outputBody));
    } else {
      const errorMessage = 'getAllGroups - DB returned 0 rows';
      outputBody = {
        ...outputBody,
        errorMessage,
      };
      this.logger.warn(errorMessage);
    }
    return outputBody;
  }

  public async getAllTemplateNames() {
    let templates: string[];
    let outputBody: {
      templates: string[];
      errorMessage: string;
    } = {
      templates: [],
      errorMessage: '',
    };

    const queryResult = await this.timeSaverDb.getDistinctColumn(
      this.tsTableName,
      'template_name',
    );

    if (queryResult && queryResult.length > 0) {
      templates = queryResult.map(row => row.template_name);
      outputBody = {
        ...outputBody,
        templates,
      };
      this.logger.debug(JSON.stringify(outputBody));
    } else {
      const errorMessage = 'getAllGroups - DB returned 0 rows';
      outputBody = {
        ...outputBody,
        errorMessage,
      };
      this.logger.warn(errorMessage);
    }
    return outputBody;
  }

  public async getAllTemplateTasks() {
    let templateTasks: string[];
    let outputBody: {
      templateTasks: string[];
      errorMessage: string;
    } = {
      templateTasks: [],
      errorMessage: '',
    };

    const queryResult = await this.timeSaverDb.getDistinctColumn(
      this.tsTableName,
      'template_task_id',
    );

    if (queryResult && queryResult.length > 0) {
      templateTasks = queryResult.map(row => row.template_task_id);
      outputBody = {
        ...outputBody,
        templateTasks,
      };
      this.logger.debug(JSON.stringify(outputBody));
    } else {
      const errorMessage = 'getAllGroups - DB returned 0 rows';
      outputBody = {
        ...outputBody,
        errorMessage,
      };
      this.logger.warn(errorMessage);
    }
    return outputBody;
  }

  public async getTemplateCount() {
    let outputBody;
    const queryResult = (await this.timeSaverDb.getTemplateCount()) as {
      count: string;
    }[];

    if (queryResult && queryResult?.length > 0) {
      outputBody = {
        templateTasks: parseInt(queryResult[0].count, 10),
      };
      this.logger.debug(`getTemplateCount: ${JSON.stringify(outputBody)}`);
    } else {
      const errorMessage = 'getTemplateCount did not return any results';
      outputBody = {
        templateTasks: 0,
        errorMessage,
      };
      this.logger.warn(errorMessage);
    }

    return outputBody;
  }

  // public async getTimeSavedSum(divider?: number): Promise<{ timeSaved?: number | undefined; errorMessage?: string | undefined }> {
  public async getTimeSavedSum(divider?: number) {
    let outputBody: {
      timeSaved?: number;
      errorMessage?: string;
    } = {
      timeSaved: 0,
      errorMessage: '',
    };

    const dividerInt = divider ?? 1;
    const queryResult = await this.timeSaverDb.getTimeSavedSum(
      this.tsTableName,
      'time_saved',
    );

    if (queryResult && queryResult.length > 0) {
      outputBody = {
        timeSaved: queryResult[0].sum / dividerInt,
      };
      this.logger.debug(JSON.stringify(outputBody));
    } else {
      const errorMessage = 'getTimeSavedSum - DB returned 0 rows';
      outputBody = {
        errorMessage,
      };
      this.logger.warn(errorMessage);
    }
    return outputBody;
  }
}
