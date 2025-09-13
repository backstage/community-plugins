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
  resolvePackagePath,
  DatabaseService,
} from '@backstage/backend-plugin-api';
import {
  Metric,
  MetricsType,
  PeriodRange,
  CopilotIdeCodeCompletions,
  CopilotIdeLanguages,
  CopilotMetrics,
  CopilotEditors,
  CopilotModels,
  CopilotLanguages,
  CopilotChats,
  CopilotChatEditors,
  CopilotChatModels,
  EngagementMetrics,
  SeatAnalysis,
} from '@backstage-community/plugin-copilot-common';
import { Knex } from 'knex';

const migrationsDir = resolvePackagePath(
  '@backstage-community/plugin-copilot-backend',
  'migrations',
);

type Options = {
  database: DatabaseService;
};

export type Breakdown = {
  day: string;
  editor: string;
  language: string;
  lines_accepted: number;
  lines_suggested: number;
  suggestions_count: number;
  acceptances_count: number;
  active_users: number;
};

export type CopilotMetricsDb = Omit<
  CopilotMetrics,
  | 'date'
  | 'copilot_ide_code_completions'
  | 'copilot_ide_chat'
  | 'copilot_dotcom_chat'
  | 'copilot_dotcom_pull_requests'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
};

export type CopilotIdeCodeCompletionsDb = Omit<
  CopilotIdeCodeCompletions,
  'editors' | 'languages'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
};

export type CopilotIdeCodeCompletionsLanguageDb = Omit<
  CopilotIdeLanguages,
  'day' | 'name' | 'language'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
  language: string;
};

export type CopilotIdeCodeCompletionsEditorsDb = Omit<
  CopilotEditors,
  'day' | 'name' | 'models'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
  editor: string;
};

export type CopilotIdeChatsDb = Omit<CopilotChats, 'day' | 'editors'> & {
  day: string;
};

export type CopilotIdeChatsEditorsDb = Omit<
  CopilotChatEditors,
  'day' | 'name' | 'models' | 'editor'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
  editor: string;
};

export type CopilotIdeChatsEditorModelDb = Omit<
  CopilotChatModels,
  'name' | 'day' | 'model' | 'editor'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
  editor: string;
  model: string;
};

export type CopilotIdeCodeCompletionsEditorModelsDb = Omit<
  CopilotModels,
  'day' | 'editor' | 'model' | 'name' | 'languages'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
  editor: string;
  model: string;
};

export type CopilotIdeCodeCompletionsEditorModelLanguagesDb = Omit<
  CopilotLanguages,
  'day' | 'editor' | 'model' | 'name' | 'language'
> & {
  day: string;
  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;
  editor: string;
  model: string;
  language: string;
};

export type MetricDbRow = Omit<Metric, 'breakdown'> & {
  breakdown: string;
};

export class DatabaseHandler {
  static async create(options: Options): Promise<DatabaseHandler> {
    const { database } = options;
    const client = await database.getClient();

    if (!database.migrations?.skip) {
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }

    return new DatabaseHandler(client);
  }

  private constructor(private readonly db: Knex) {}

  async getPeriodRange(type: MetricsType): Promise<PeriodRange | undefined> {
    const query = this.db<MetricDbRow>('metrics').where('type', type);

    const minDate = await query.orderBy('day', 'asc').first('day');
    const maxDate = await query.orderBy('day', 'desc').first('day');

    if (!minDate?.day || !maxDate?.day) return undefined;

    return { minDate: minDate.day, maxDate: maxDate.day };
  }

  async getPeriodRangeV2(type: MetricsType): Promise<PeriodRange | undefined> {
    const query = this.db('copilot_metrics').where('type', type);

    const minDate = await query.orderBy('day', 'asc').first('day');
    const maxDate = await query.orderBy('day', 'desc').first('day');

    if (!minDate?.day || !maxDate?.day) return undefined;

    return { minDate: minDate.day, maxDate: maxDate.day };
  }

  async getTeams(
    type: MetricsType,
    startDate: string,
    endDate: string,
  ): Promise<Array<string | undefined>> {
    const result = await this.db<MetricDbRow>('copilot_metrics')
      .where('type', type)
      .whereBetween('day', [startDate, endDate])
      .whereNot('team_name', '')
      .distinct('team_name')
      .orderBy('team_name', 'asc')
      .select('team_name');

    return result.map(x => x.team_name);
  }

  async batchInsert(metrics: MetricDbRow[]): Promise<void> {
    await this.db<MetricDbRow[]>('metrics')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name'])
      .ignore();
  }

  async batchInsertMetrics(metrics: CopilotMetricsDb[]): Promise<void> {
    await this.db<CopilotMetricsDb[]>('copilot_metrics')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name'])
      .ignore();
  }

  async batchInsertIdeCompletions(
    metrics: CopilotIdeCodeCompletionsDb[],
  ): Promise<void> {
    await this.db<CopilotIdeCodeCompletionsDb[]>('ide_completions')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name'])
      .ignore();
  }

  async batchInsertIdeCompletionsLanguages(
    metrics: CopilotIdeCodeCompletionsLanguageDb[],
  ): Promise<void> {
    await this.db<CopilotIdeCodeCompletionsLanguageDb[]>(
      'ide_completions_language_users',
    )
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name', 'language'])
      .ignore();
  }

  async batchInsertIdeCompletionsEditors(
    metrics: CopilotIdeCodeCompletionsEditorsDb[],
  ): Promise<void> {
    await this.db<CopilotIdeCodeCompletionsEditorsDb[]>(
      'ide_completions_language_editors',
    )
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name', 'editor'])
      .ignore();
  }

  async batchInsertIdeCompletionsEditorModels(
    metrics: CopilotIdeCodeCompletionsEditorModelsDb[],
  ): Promise<void> {
    await this.db<CopilotIdeCodeCompletionsEditorModelsDb[]>(
      'ide_completions_language_editors_model',
    )
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name', 'editor', 'model'])
      .ignore();
  }

  async batchInsertIdeCompletionsEditorModelLanguages(
    metrics: CopilotIdeCodeCompletionsEditorModelLanguagesDb[],
  ): Promise<void> {
    await this.db<CopilotIdeCodeCompletionsEditorModelLanguagesDb[]>(
      'ide_completions_language_editors_model_language',
    )
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name', 'editor', 'model', 'language'])
      .ignore();
  }

  async batchInsertIdeChats(metrics: CopilotIdeChatsDb[]): Promise<void> {
    await this.db<CopilotIdeChatsDb[]>('ide_chats')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name'])
      .ignore();
  }

  async batchInsertIdeChatEditors(
    metrics: CopilotIdeChatsEditorsDb[],
  ): Promise<void> {
    await this.db<CopilotIdeChatsEditorsDb[]>('ide_chat_editors')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name', 'editor'])
      .ignore();
  }

  async batchInsertIdeChatEditorModels(
    metrics: CopilotIdeChatsEditorModelDb[],
  ): Promise<void> {
    await this.db<CopilotIdeChatsEditorModelDb[]>('ide_chat_editors_model')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name', 'editor', 'model'])
      .ignore();
  }

  async insertSeatAnalysys(metric: SeatAnalysis): Promise<void> {
    await this.db<SeatAnalysis>('seats')
      .insert(metric)
      .onConflict(['day', 'type', 'team_name'])
      .ignore();
  }

  async getMostRecentDayFromMetrics(
    type: MetricsType,
    teamName?: string,
  ): Promise<string | undefined> {
    try {
      const query = await this.db<MetricDbRow>('metrics')
        .where('type', type)
        .where('team_name', teamName ?? '')
        .orderBy('day', 'desc')
        .first('day');
      return query ? query.day : undefined;
    } catch (e) {
      return undefined;
    }
  }

  async getMostRecentDayFromMetricsV2(
    type: MetricsType,
    teamName?: string,
  ): Promise<string | undefined> {
    try {
      const query = this.db('copilot_metrics')
        .where('type', type)
        .where('team_name', teamName ?? '')
        .orderBy('day', 'desc')
        .first('day');
      const res = await query;
      return res ? res.day : undefined;
    } catch (e) {
      return undefined;
    }
  }

  async getEarliestDayFromMetricsV2(
    type: MetricsType,
    teamName?: string,
  ): Promise<string | undefined> {
    try {
      const query = this.db('copilot_metrics')
        .where('type', type)
        .where('team_name', teamName ?? '')
        .orderBy('day', 'asc')
        .first('day');
      const res = await query;
      return res ? res.day : undefined;
    } catch (e) {
      return undefined;
    }
  }

  async getMetrics(
    startDate: string,
    endDate: string,
    type: MetricsType,
    teamName?: string,
  ): Promise<MetricDbRow[]> {
    return await this.db<MetricDbRow>('metrics')
      .where('type', type)
      .where('team_name', teamName ?? '')
      .whereBetween('day', [startDate, endDate]);
  }

  async getSeatMetrics(
    startDate: string,
    endDate: string,
    type: MetricsType,
    teamName?: string,
  ): Promise<SeatAnalysis[]> {
    return await this.db<SeatAnalysis>('seats')
      .where('type', type)
      .where('team_name', teamName ?? '')
      .whereBetween('day', [startDate, endDate])
      .orderBy('day', 'asc');
  }

  async getEngagementMetrics(
    startDate: string,
    endDate: string,
    type: MetricsType,
    teamName?: string,
  ): Promise<EngagementMetrics[]> {
    let query = this.db('copilot_metrics as cm')
      .select(
        'cm.day',
        'cm.type',
        'cm.team_name',
        this.db.raw(
          'CAST(MIN(cm.total_active_users) AS INTEGER) as total_active_users',
        ),
        this.db.raw(
          'CAST(MIN(cm.total_engaged_users) AS INTEGER) as total_engaged_users',
        ),
        this.db.raw(
          'CAST(MIN(ide_completions.total_engaged_users) AS INTEGER) as ide_completions_engaged_users',
        ),
        this.db.raw(
          'CAST(MIN(ide_chats.total_engaged_users) AS INTEGER) as ide_chats_engaged_users',
        ),
        this.db.raw(
          'CAST(MIN(dotcom_chats.total_engaged_users) AS INTEGER) as dotcom_chats_engaged_users',
        ),
        this.db.raw(
          'CAST(MIN(dotcom_prs.total_engaged_users) AS INTEGER) as dotcom_prs_engaged_users',
        ),
      )
      .leftJoin('ide_completions', join => {
        join
          .on('ide_completions.day', '=', 'cm.day')
          .andOn('ide_completions.type', '=', 'cm.type');
        if (teamName) {
          join.andOn(
            'ide_completions.team_name',
            '=',
            this.db.raw('?', [teamName]),
          );
        } else {
          join.andOnNull('ide_completions.team_name');
        }
      })
      .leftJoin('ide_chats', join => {
        join
          .on('ide_chats.day', '=', 'cm.day')
          .andOn('ide_chats.type', '=', 'cm.type');
        if (teamName) {
          join.andOn('ide_chats.team_name', '=', this.db.raw('?', [teamName]));
        } else {
          join.andOnNull('ide_chats.team_name');
        }
      })
      .leftJoin('dotcom_chats', join => {
        join
          .on('dotcom_chats.day', '=', 'cm.day')
          .andOn('dotcom_chats.type', '=', 'cm.type');
        if (teamName) {
          join.andOn(
            'dotcom_chats.team_name',
            '=',
            this.db.raw('?', [teamName]),
          );
        } else {
          join.andOnNull('dotcom_chats.team_name');
        }
      })
      .leftJoin('dotcom_prs', join => {
        join
          .on('dotcom_prs.day', '=', 'cm.day')
          .andOn('dotcom_prs.type', '=', 'cm.type');
        if (teamName) {
          join.andOn('dotcom_prs.team_name', '=', this.db.raw('?', [teamName]));
        } else {
          join.andOnNull('dotcom_prs.team_name');
        }
      })
      .where('cm.type', type)
      .whereBetween('cm.day', [startDate, endDate])
      .groupBy('cm.day', 'cm.type', 'cm.team_name')
      .orderBy('cm.day', 'asc');

    if (teamName) {
      query = query.where('cm.team_name', teamName);
    } else {
      query = query.whereNull('cm.team_name');
    }

    return await query;
  }

  async getMetricsV2(
    startDate: string,
    endDate: string,
    type: MetricsType,
    teamName?: string,
  ): Promise<MetricDbRow[]> {
    const query = this.db('copilot_metrics as cm')
      .select(
        'cm.day',
        'cm.type',
        'cm.team_name',
        this.db.raw(
          'CAST(MIN(cm.total_active_users) AS INTEGER) as total_active_users',
        ),
        this.db.raw(
          'CAST(MIN(ide_chats.total_engaged_users) AS INTEGER) as total_active_chat_users',
        ),
        this.db.raw(
          'CAST(SUM(icelm.total_code_suggestions) AS INTEGER) as total_suggestions_count',
        ),
        this.db.raw(
          'CAST(SUM(icelm.total_code_acceptances) AS INTEGER) as total_acceptances_count',
        ),
        this.db.raw(
          'CAST(SUM(icelm.total_code_lines_suggested) AS INTEGER) as total_lines_suggested',
        ),
        this.db.raw(
          'CAST(SUM(icelm.total_code_lines_accepted) AS INTEGER) as total_lines_accepted',
        ),
        this.db.raw(
          'CAST(SUM(icem.total_chats) AS INTEGER) as total_chat_turns',
        ),
        this.db.raw(
          'CAST(SUM(icem.total_chat_copy_events) AS INTEGER) as total_chat_acceptances',
        ),
        this.db.raw("'' as breakdown"),
      )
      .join('ide_completions', join => {
        join
          .on('ide_completions.day', '=', 'cm.day')
          .andOn('ide_completions.type', '=', 'cm.type')
          .andOn(
            'ide_completions.team_name',
            '=',
            this.db.raw('?', [teamName ?? '']),
          );
      })
      .join('ide_chats', join => {
        join
          .on('ide_chats.day', '=', 'cm.day')
          .andOn('ide_chats.type', '=', 'cm.type')
          .andOn(
            'ide_chats.team_name',
            '=',
            this.db.raw('?', [teamName ?? '']),
          );
      })
      .join(
        this.db.raw(
          `(SELECT day, type, team_name,
        SUM(total_code_suggestions) as total_code_suggestions, 
        SUM(total_code_acceptances) as total_code_acceptances, 
        SUM(total_code_lines_suggested) as total_code_lines_suggested, 
        SUM(total_code_lines_accepted) as total_code_lines_accepted 
        FROM ide_completions_language_editors_model_language GROUP BY day, type, team_name) 
        as icelm`,
        ),
        join => {
          join
            .on('icelm.day', '=', 'cm.day')
            .andOn('icelm.type', '=', 'cm.type')
            .andOn('icelm.team_name', '=', this.db.raw('?', [teamName ?? '']));
        },
      )
      .join(
        this.db.raw(
          `(SELECT day, type, team_name, SUM(total_chats) as total_chats, 
      SUM(total_chat_copy_events) as total_chat_copy_events 
      FROM ide_chat_editors_model GROUP BY day, type, team_name) as icem`,
        ),
        join => {
          join
            .on('icem.day', '=', 'cm.day')
            .andOn('icem.type', '=', 'cm.type')
            .andOn('icem.team_name', '=', this.db.raw('?', [teamName ?? '']));
        },
      )
      .where('cm.type', type)
      .where('cm.team_name', teamName ?? '')
      .whereBetween('cm.day', [startDate, endDate])
      .groupBy('cm.day', 'cm.type', 'cm.team_name')
      .orderBy('cm.day', 'asc');

    return await query;
  }

  async getBreakdown(
    startDate: string,
    endDate: string,
    type: MetricsType,
    teamName?: string,
  ): Promise<Breakdown[]> {
    const query = this.db<Breakdown>('copilot_metrics as cm')
      .select(
        'cm.day',
        'icleml.editor as editor',
        'icleml.language as language',
        this.db.raw(
          'CAST(SUM(icleml.total_engaged_users) AS INTEGER) as active_users',
        ),
        this.db.raw(
          'CAST(SUM(icleml.total_code_lines_suggested) AS INTEGER) as lines_suggested',
        ),
        this.db.raw(
          'CAST(SUM(icleml.total_code_lines_accepted) AS INTEGER) as lines_accepted',
        ),
        this.db.raw(
          'CAST(SUM(icleml.total_code_suggestions) AS INTEGER) as suggestions_count',
        ),
        this.db.raw(
          'CAST(SUM(icleml.total_code_acceptances) AS INTEGER) as acceptances_count',
        ),
      )
      .join(
        'ide_completions_language_editors_model_language as icleml',
        join => {
          join
            .on('icleml.day', '=', 'cm.day')
            .andOn('icleml.type', '=', 'cm.type')
            .andOn('icleml.team_name', '=', this.db.raw('?', [teamName ?? '']));
        },
      )
      .whereBetween('cm.day', [startDate, endDate])
      .where('icleml.model', 'default')
      .where('cm.type', type)
      .where('cm.team_name', teamName ?? '')
      .groupBy('cm.day', 'icleml.editor', 'icleml.language')
      .orderBy('cm.day', 'asc');

    return await query;
  }
}
