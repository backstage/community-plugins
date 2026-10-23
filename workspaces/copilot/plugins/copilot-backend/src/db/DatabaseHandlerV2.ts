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
import { DatabaseService } from '@backstage/backend-plugin-api';
import {
  PeriodRange,
  V2CustomizationMetricRow,
  V2CustomizationSummaryRow,
  V2CostCenterRow,
  V2CostCenterListResponse,
  V2DailyTotal,
  V2DashboardData,
  V2IngestionLogRow,
  V2MetricsByCliRow,
  V2MetricsByFeatureRow,
  V2MetricsByIdeRow,
  V2MetricsByLanguageFeatureRow,
  V2MetricsByModelFeatureRow,
  V2MetricsByLanguageModelRow,
  V2MetricsByVscodeAgentRow,
  V2PrMetricsRow,
  V2UserDashboardData,
  V2UserMetricRow,
  V2UserCostCenterRow,
  V2UserMetricsByFeatureRow,
  V2UserMetricsByIdeRow,
  V2UserMetricsByLanguageFeatureRow,
  V2UserMetricsByModelFeatureRow,
  V2UserMetricsByLanguageModelRow,
  V2UserTeamRow,
  MetricsScope,
} from '@backstage-community/plugin-copilot-common';
import { DateTime } from 'luxon';
import { Knex } from 'knex';
import { migrationsDir } from './DatabaseHandler';
import { batchInsertInChunks } from '../utils/batchInsert';
import {
  bucketCostCenterBreakdown,
  CostCenterBreakdownKind,
} from './longTailBucketing';
import { UserBreakdownData } from '../utils/reportParser';
import type { TeamAggregates } from '../utils/teamAggregator';

type Options = {
  database: DatabaseService;
};

type DayValue = string | Date;

type TeamActivityRow = {
  day: DayValue;
  user_id: number;
  used_agent: boolean | number | null;
  used_chat: boolean | number | null;
};

export function parseComponentsLoaded(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string');
  }

  if (typeof value !== 'string') {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === 'string')
      : [];
  } catch {
    return [];
  }
}

type CostCenterScopedRow = {
  cost_center_id?: string;
  without_cost_center?: boolean;
};

export type CostCenterCustomizationMetricRow = CostCenterScopedRow & {
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  category: string;
  item_name: string;
  interaction_count: number;
};

export type CostCenterDashboardScope =
  | { kind: 'costCenter'; id: string }
  | { kind: 'noCostCenter' };

type CostCenterFilter = string | { kind: 'noCostCenter' };

export type CostCenterAggregateRows = {
  dailyTotals: V2DailyTotal[];
  prMetrics: V2PrMetricsRow[];
  byFeature: V2MetricsByFeatureRow[];
  byIde: V2MetricsByIdeRow[];
  byLanguageFeature: V2MetricsByLanguageFeatureRow[];
  byModelFeature: V2MetricsByModelFeatureRow[];
  byLanguageModel: V2MetricsByLanguageModelRow[];
  byCli: V2MetricsByCliRow[];
  byVscodeAgent: V2MetricsByVscodeAgentRow[];
  customizationMetrics?: CostCenterCustomizationMetricRow[];
};

const costCenterAggregateTables = [
  'copilot_daily_totals',
  'copilot_pr_metrics',
  'copilot_metrics_by_feature',
  'copilot_metrics_by_ide',
  'copilot_metrics_by_language_feature',
  'copilot_metrics_by_model_feature',
  'copilot_metrics_by_language_model',
  'copilot_metrics_by_cli',
  'copilot_metrics_by_vscode_agent',
  'copilot_customization_metrics_by_cost_center',
] as const;

const WEEKLY_ACTIVE_USERS_WINDOW_DAYS = 7;
const MONTHLY_ACTIVE_USERS_WINDOW_DAYS = 28;

const teamAggregateTables = [
  'copilot_daily_totals',
  'copilot_pr_metrics',
  'copilot_metrics_by_feature',
  'copilot_metrics_by_ide',
  'copilot_metrics_by_language_feature',
  'copilot_metrics_by_model_feature',
  'copilot_metrics_by_language_model',
  'copilot_metrics_by_cli',
  'copilot_metrics_by_vscode_agent',
  'copilot_customization_metrics',
] as const;

const teamAggregateRowsByTable = (
  aggregates: TeamAggregates,
): Array<[string, object[]]> => [
  ['copilot_daily_totals', aggregates.dailyTotals],
  ['copilot_metrics_by_feature', aggregates.byFeature],
  ['copilot_metrics_by_ide', aggregates.byIde],
  ['copilot_metrics_by_language_feature', aggregates.byLanguageFeature],
  ['copilot_metrics_by_model_feature', aggregates.byModelFeature],
  ['copilot_metrics_by_language_model', aggregates.byLanguageModel],
  ['copilot_metrics_by_cli', aggregates.byCli ?? []],
  ['copilot_metrics_by_vscode_agent', aggregates.byVscodeAgent ?? []],
  ['copilot_customization_metrics', aggregates.customizationMetrics],
];

export class DatabaseHandlerV2 {
  static async create(options: Options): Promise<DatabaseHandlerV2> {
    const { database } = options;
    const client = await database.getClient();

    if (!database.migrations?.skip) {
      await client.migrate.latest({ directory: migrationsDir });
    }

    return new DatabaseHandlerV2(client);
  }

  private constructor(private readonly db: Knex) {}

  private addCostCenterFilter(
    query: Knex.QueryBuilder,
    costCenter?: CostCenterFilter,
    aggregateTable?: string,
  ): void {
    if (typeof costCenter === 'string') {
      query
        .where('cost_center_id', costCenter)
        .where('without_cost_center', false);
    } else if (costCenter?.kind === 'noCostCenter') {
      query.where('cost_center_id', '').where('without_cost_center', true);
      if (!aggregateTable) {
        throw new Error(
          'An aggregate table is required for the no-cost-center filter.',
        );
      }

      const database = this.db;
      query.whereExists(function hasCompleteUnassignedSnapshot() {
        this.select(database.raw('1'))
          .from('copilot_cost_center_aggregation_log as done')
          .whereRaw('?? = ??', ['done.day', `${aggregateTable}.day`])
          .whereRaw('?? = ??', [
            'done.metrics_type',
            `${aggregateTable}.metrics_type`,
          ])
          .whereRaw('?? = ??', [
            'done.entity_id',
            `${aggregateTable}.entity_id`,
          ])
          .where('done.unassigned_complete', true);
      });
    } else {
      query.where('cost_center_id', '').where('without_cost_center', false);
    }
  }

  private normalizeAggregateRow<T extends { day: unknown }>(
    row: T & { without_cost_center?: boolean },
  ): Omit<T, 'without_cost_center'> & { day: string } {
    const { without_cost_center: _withoutCostCenter, ...publicRow } = row;
    return {
      ...publicRow,
      day: this.normalizeRequiredDay(row.day),
    };
  }

  private validateTeamReplacementRows(
    day: string,
    userTeams: V2UserTeamRow[],
  ): void {
    if (userTeams.some(row => row.day !== day)) {
      throw new Error(
        'Team replacement memberships must match the requested day and scope.',
      );
    }
  }

  private async insertTeamAggregateRows(
    transaction: Knex.Transaction,
    aggregates: TeamAggregates,
  ): Promise<void> {
    for (const [tableName, rows] of teamAggregateRowsByTable(aggregates)) {
      if (!rows.length) {
        continue;
      }
      const normalizedRows =
        tableName === 'copilot_customization_metrics'
          ? rows
          : this.withDefaultCostCenter(rows as CostCenterScopedRow[]);
      await batchInsertInChunks(normalizedRows, 100, async chunk => {
        await transaction(tableName).insert(chunk);
      });
    }
  }

  private async deleteTeamAggregateRows(
    transaction: Knex.Transaction,
    day: string,
    metricsType: MetricsScope,
    entityId: string,
  ): Promise<void> {
    for (const tableName of teamAggregateTables) {
      const query = transaction(tableName).where({
        day,
        metrics_type: metricsType,
        entity_id: entityId,
      });
      query.whereNot('team_slug', '');
      if (tableName === 'copilot_customization_metrics') {
        query.where('scope', 'team');
      } else {
        query.where('cost_center_id', '').where('without_cost_center', false);
      }
      await query.del();
    }
  }

  async replaceTeamAggregates(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
    userTeams: V2UserTeamRow[],
    aggregates: TeamAggregates,
  ): Promise<void> {
    this.validateTeamReplacementRows(day, userTeams);

    await this.db.transaction(async transaction => {
      await transaction('copilot_user_teams')
        .where({ day, metrics_type: metricsType, entity_id: entityId })
        .del();
      await batchInsertInChunks(userTeams, 100, async chunk => {
        await transaction<V2UserTeamRow>('copilot_user_teams')
          .insert(chunk)
          .onConflict([
            'day',
            'metrics_type',
            'entity_id',
            'user_id',
            'team_id',
          ])
          .ignore();
      });

      await this.deleteTeamAggregateRows(
        transaction,
        day,
        metricsType,
        entityId,
      );
      await this.insertTeamAggregateRows(transaction, aggregates);
    });
  }

  async getBackfillStatus(
    metricsType: MetricsScope,
    entityId: string,
    from?: string,
    to?: string,
  ): Promise<V2IngestionLogRow[]> {
    return this.getIngestionLog(metricsType, entityId, from, to);
  }

  private withDefaultCostCenter<T extends CostCenterScopedRow>(
    rows: T[],
  ): Array<T & { cost_center_id: string; without_cost_center: boolean }> {
    return rows.map(row => ({
      ...row,
      cost_center_id: row.cost_center_id ?? '',
      without_cost_center: row.without_cost_center ?? false,
    }));
  }

  async insertDailyTotals(rows: V2DailyTotal[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(
      this.withDefaultCostCenter(rows),
      100,
      async chunk => {
        await this.db<V2DailyTotal>('copilot_daily_totals')
          .insert(chunk)
          // Merge `total_ai_credits_used`/`daily_active_vscode_agent_users` on
          // conflict (rather than ignoring) so that re-ingesting a day that
          // was already stored before these columns existed backfills the new
          // metrics in place.
          .onConflict([
            'day',
            'metrics_type',
            'entity_id',
            'team_slug',
            'cost_center_id',
            'without_cost_center',
          ])
          .merge(['total_ai_credits_used', 'daily_active_vscode_agent_users']);
      },
    );
  }

  async insertPrMetrics(rows: V2PrMetricsRow[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(
      this.withDefaultCostCenter(rows),
      100,
      async chunk => {
        await this.db<V2PrMetricsRow>('copilot_pr_metrics')
          .insert(chunk)
          .onConflict([
            'day',
            'metrics_type',
            'entity_id',
            'team_slug',
            'cost_center_id',
            'without_cost_center',
          ])
          .ignore();
      },
    );
  }

  async insertByFeature(rows: V2MetricsByFeatureRow[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(
      this.withDefaultCostCenter(rows),
      100,
      async chunk => {
        await this.db<V2MetricsByFeatureRow>('copilot_metrics_by_feature')
          .insert(chunk)
          .onConflict([
            'day',
            'metrics_type',
            'entity_id',
            'team_slug',
            'cost_center_id',
            'without_cost_center',
            'feature',
          ])
          .ignore();
      },
    );
  }

  async insertByIde(rows: V2MetricsByIdeRow[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(
      this.withDefaultCostCenter(rows),
      100,
      async chunk => {
        await this.db<V2MetricsByIdeRow>('copilot_metrics_by_ide')
          .insert(chunk)
          .onConflict([
            'day',
            'metrics_type',
            'entity_id',
            'team_slug',
            'cost_center_id',
            'without_cost_center',
            'ide',
          ])
          .ignore();
      },
    );
  }

  async insertByLanguageFeature(
    rows: V2MetricsByLanguageFeatureRow[],
  ): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(
      this.withDefaultCostCenter(rows),
      100,
      async chunk => {
        await this.db<V2MetricsByLanguageFeatureRow>(
          'copilot_metrics_by_language_feature',
        )
          .insert(chunk)
          .onConflict([
            'day',
            'metrics_type',
            'entity_id',
            'team_slug',
            'cost_center_id',
            'without_cost_center',
            'language',
            'feature',
          ])
          .ignore();
      },
    );
  }

  async insertByModelFeature(
    rows: V2MetricsByModelFeatureRow[],
  ): Promise<void> {
    if (!rows.length) return;
    await batchInsertInChunks(
      this.withDefaultCostCenter(rows),
      100,
      async chunk => {
        await this.db<V2MetricsByModelFeatureRow>(
          'copilot_metrics_by_model_feature',
        )
          .insert(chunk)
          .onConflict([
            'day',
            'metrics_type',
            'entity_id',
            'team_slug',
            'cost_center_id',
            'without_cost_center',
            'model_id',
            'feature',
          ])
          .ignore();
      },
    );
  }

  async insertByLanguageModel(
    rows: V2MetricsByLanguageModelRow[],
  ): Promise<void> {
    if (!rows.length) return;
    await batchInsertInChunks(
      this.withDefaultCostCenter(rows),
      100,
      async chunk => {
        await this.db<V2MetricsByLanguageModelRow>(
          'copilot_metrics_by_language_model',
        )
          .insert(chunk)
          .onConflict([
            'day',
            'metrics_type',
            'entity_id',
            'team_slug',
            'cost_center_id',
            'without_cost_center',
            'language',
            'model_id',
          ])
          .ignore();
      },
    );
  }

  async insertByCli(rows: V2MetricsByCliRow[]): Promise<void> {
    if (!rows.length) return;
    await batchInsertInChunks(
      this.withDefaultCostCenter(rows),
      100,
      async chunk => {
        await this.db<V2MetricsByCliRow>('copilot_metrics_by_cli')
          .insert(chunk)
          .onConflict([
            'day',
            'metrics_type',
            'entity_id',
            'team_slug',
            'cost_center_id',
            'without_cost_center',
          ])
          // Merge (rather than ignore) on conflict so that re-ingesting a day
          // updates any stale/zeroed row already stored for that key — e.g.
          // rows written before the `output_tokens_sum`/`prompt_tokens_sum`
          // columns were widened to `bigint` (see
          // 202608240000_widen_cli_token_sum_columns.js), which would
          // otherwise be silently skipped forever by `.ignore()`.
          .merge([
            'prompt_count',
            'request_count',
            'session_count',
            'avg_tokens_per_request',
            'output_tokens_sum',
            'prompt_tokens_sum',
          ]);
      },
    );
  }

  async insertByVscodeAgent(rows: V2MetricsByVscodeAgentRow[]): Promise<void> {
    if (!rows.length) return;
    await batchInsertInChunks(
      this.withDefaultCostCenter(rows),
      100,
      async chunk => {
        await this.db<V2MetricsByVscodeAgentRow>(
          'copilot_metrics_by_vscode_agent',
        )
          .insert(chunk)
          .onConflict([
            'day',
            'metrics_type',
            'entity_id',
            'team_slug',
            'cost_center_id',
            'without_cost_center',
          ])
          // Merge (rather than ignore) on conflict so that re-ingesting a day
          // updates any stale/zeroed row already stored for that key, mirroring
          // insertByCli above.
          .merge(['session_count', 'total_user_messages']);
      },
    );
  }

  async insertCustomizationMetrics(
    rows: V2CustomizationMetricRow[],
  ): Promise<void> {
    if (!rows.length) return;

    const normalizedRows = rows.map(row => ({
      ...row,
      user_login: row.user_login.toLowerCase(),
    }));

    await batchInsertInChunks(normalizedRows, 100, async chunk => {
      await this.db<V2CustomizationMetricRow>('copilot_customization_metrics')
        .insert(chunk)
        .onConflict([
          'day',
          'metrics_type',
          'entity_id',
          'scope',
          'team_slug',
          'user_id',
          'category',
          'item_name',
        ])
        .merge(['interaction_count', 'user_login']);
    });
  }

  async insertCustomizationSummaries(
    rows: V2CustomizationSummaryRow[],
  ): Promise<void> {
    if (!rows.length) return;

    const normalizedRows = rows.map(row => ({
      ...row,
      user_login: row.user_login.toLowerCase(),
    }));

    await batchInsertInChunks(normalizedRows, 100, async chunk => {
      await this.db<V2CustomizationSummaryRow>(
        'copilot_customization_summaries',
      )
        .insert(chunk)
        .onConflict([
          'day',
          'metrics_type',
          'entity_id',
          'scope',
          'team_slug',
          'user_id',
          'category',
        ])
        .merge(['distinct_item_count', 'user_login']);
    });
  }

  async insertUserMetrics(rows: V2UserMetricRow[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2UserMetricRow>('copilot_user_metrics')
        .insert(chunk)
        // Merge `ai_credits_used`/`used_vscode_agent` on conflict (rather
        // than ignoring) so that re-ingesting a day that was already stored
        // before these columns existed backfills the new metrics in place.
        .onConflict(['day', 'metrics_type', 'entity_id', 'user_id'])
        .merge(['ai_credits_used', 'used_vscode_agent']);
    });
  }

  async insertUserTeams(rows: V2UserTeamRow[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2UserTeamRow>('copilot_user_teams')
        .insert(chunk)
        .onConflict(['day', 'metrics_type', 'entity_id', 'user_id', 'team_id'])
        .ignore();
    });
  }

  async upsertCostCenters(rows: V2CostCenterRow[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    const updatedAt = new Date();
    const rowsWithUpdatedAt = rows.map(row => ({
      ...row,
      updated_at: updatedAt,
    }));

    await batchInsertInChunks(rowsWithUpdatedAt, 100, async chunk => {
      await this.db<V2CostCenterRow>('copilot_cost_centers')
        .insert(chunk)
        .onConflict(['metrics_type', 'entity_id', 'cost_center_id'])
        .merge(['name', 'updated_at']);
    });
  }

  async upsertUserCostCenters(rows: V2UserCostCenterRow[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2UserCostCenterRow>('copilot_user_cost_centers')
        .insert(chunk)
        .onConflict(['day', 'metrics_type', 'entity_id', 'user_id'])
        .merge(['user_login', 'cost_center_id']);
    });
  }

  /**
   * Replaces all cost-center-derived state for a day atomically.
   */
  async replaceCostCenterAggregates(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
    userCostCenters: V2UserCostCenterRow[],
    aggregates: CostCenterAggregateRows,
    unassignedComplete: boolean = true,
  ): Promise<void> {
    const rowsByTable = {
      copilot_daily_totals: this.withDefaultCostCenter(aggregates.dailyTotals),
      copilot_pr_metrics: this.withDefaultCostCenter(aggregates.prMetrics),
      copilot_metrics_by_feature: this.withDefaultCostCenter(
        aggregates.byFeature,
      ),
      copilot_metrics_by_ide: this.withDefaultCostCenter(aggregates.byIde),
      copilot_metrics_by_language_feature: this.withDefaultCostCenter(
        aggregates.byLanguageFeature,
      ),
      copilot_metrics_by_model_feature: this.withDefaultCostCenter(
        aggregates.byModelFeature,
      ),
      copilot_metrics_by_language_model: this.withDefaultCostCenter(
        aggregates.byLanguageModel,
      ),
      copilot_metrics_by_cli: this.withDefaultCostCenter(aggregates.byCli),
      copilot_metrics_by_vscode_agent: this.withDefaultCostCenter(
        aggregates.byVscodeAgent,
      ),
      copilot_customization_metrics_by_cost_center: this.withDefaultCostCenter(
        aggregates.customizationMetrics ?? [],
      ),
    };
    const rowsWithCostCenter = Object.values(rowsByTable).flat();

    if (
      rowsWithCostCenter.some(row =>
        row.without_cost_center
          ? row.cost_center_id !== ''
          : row.cost_center_id === '',
      )
    ) {
      throw new Error(
        'Cost-center replacement rows must match the requested day and scope and must not include a team scope.',
      );
    }

    await this.db.transaction(async transaction => {
      await transaction('copilot_user_cost_centers')
        .where({ day, metrics_type: metricsType, entity_id: entityId })
        .del();

      await batchInsertInChunks(userCostCenters, 100, async chunk => {
        await transaction<V2UserCostCenterRow>(
          'copilot_user_cost_centers',
        ).insert(chunk);
      });

      for (const tableName of costCenterAggregateTables) {
        await transaction(tableName)
          .where({ day, metrics_type: metricsType, entity_id: entityId })
          .andWhere(function removeCostCenterScopes() {
            this.whereNot('cost_center_id', '').orWhere(
              'without_cost_center',
              true,
            );
          })
          .del();
      }

      for (const [tableName, rows] of Object.entries(rowsByTable)) {
        await batchInsertInChunks<object>(rows, 100, async chunk => {
          await transaction(tableName).insert(chunk);
        });
      }

      await transaction('copilot_cost_center_aggregation_log')
        .insert({
          day,
          metrics_type: metricsType,
          entity_id: entityId,
          unassigned_complete: unassignedComplete,
          aggregated_at: this.db.fn.now(),
        })
        .onConflict(['day', 'metrics_type', 'entity_id'])
        .merge(['unassigned_complete', 'aggregated_at']);
    });
  }

  async insertUserMetricsByFeature(
    rows: V2UserMetricsByFeatureRow[],
  ): Promise<void> {
    if (!rows.length) return;
    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2UserMetricsByFeatureRow>(
        'copilot_user_metrics_by_feature',
      )
        .insert(chunk)
        .onConflict(['day', 'metrics_type', 'entity_id', 'user_id', 'feature'])
        .ignore();
    });
  }

  async insertUserMetricsByIde(rows: V2UserMetricsByIdeRow[]): Promise<void> {
    if (!rows.length) return;
    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2UserMetricsByIdeRow>('copilot_user_metrics_by_ide')
        .insert(chunk)
        .onConflict(['day', 'metrics_type', 'entity_id', 'user_id', 'ide'])
        .ignore();
    });
  }

  async insertUserMetricsByLanguageFeature(
    rows: V2UserMetricsByLanguageFeatureRow[],
  ): Promise<void> {
    if (!rows.length) return;
    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2UserMetricsByLanguageFeatureRow>(
        'copilot_user_metrics_by_language_feature',
      )
        .insert(chunk)
        .onConflict([
          'day',
          'metrics_type',
          'entity_id',
          'user_id',
          'language',
          'feature',
        ])
        .ignore();
    });
  }

  async insertUserMetricsByModelFeature(
    rows: V2UserMetricsByModelFeatureRow[],
  ): Promise<void> {
    if (!rows.length) return;
    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2UserMetricsByModelFeatureRow>(
        'copilot_user_metrics_by_model_feature',
      )
        .insert(chunk)
        .onConflict([
          'day',
          'metrics_type',
          'entity_id',
          'user_id',
          'model_id',
          'feature',
        ])
        .ignore();
    });
  }

  async insertUserMetricsByLanguageModel(
    rows: V2UserMetricsByLanguageModelRow[],
  ): Promise<void> {
    if (!rows.length) return;
    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2UserMetricsByLanguageModelRow>(
        'copilot_user_metrics_by_language_model',
      )
        .insert(chunk)
        .onConflict([
          'day',
          'metrics_type',
          'entity_id',
          'user_id',
          'language',
          'model_id',
        ])
        .ignore();
    });
  }

  async upsertIngestionLog(row: V2IngestionLogRow): Promise<void> {
    await this.db.transaction(async transaction => {
      const scope = {
        day: row.day,
        metrics_type: row.metrics_type,
        entity_id: row.entity_id,
      };
      await transaction<V2IngestionLogRow>('copilot_ingestion_log')
        .insert(row)
        .onConflict(['day', 'metrics_type', 'entity_id'])
        .ignore();

      const existing = await transaction<V2IngestionLogRow>(
        'copilot_ingestion_log',
      )
        .where(scope)
        .forUpdate()
        .first();
      if (!existing) {
        throw new Error('Ingestion log row could not be initialized.');
      }

      const componentsLoaded = [
        ...new Set([
          ...parseComponentsLoaded(existing.components_loaded),
          ...parseComponentsLoaded(row.components_loaded),
        ]),
      ];
      const preserveSuccessfulStatus =
        existing.status === 'success' && row.status !== 'success';
      let errorMessage = row.error_message;
      if (errorMessage === undefined) {
        errorMessage = preserveSuccessfulStatus ? existing.error_message : null;
      }

      await transaction('copilot_ingestion_log')
        .where(scope)
        .update({
          status: preserveSuccessfulStatus ? 'success' : row.status,
          components_loaded: JSON.stringify(componentsLoaded),
          error_message: errorMessage,
          source: row.source,
        });
    });
  }

  async getMissingDays(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    requiredComponents: string[] = ['totals'],
  ): Promise<string[]> {
    const ingestionRows = await this.db('copilot_ingestion_log')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to])
      .select('day', 'components_loaded');

    const completeDays = new Set(
      ingestionRows
        .filter(row =>
          this.hasRequiredComponents(row.components_loaded, requiredComponents),
        )
        .map(row => this.normalizeDay(row.day))
        .filter((day): day is string => Boolean(day)),
    );

    const start = DateTime.fromISO(from, { zone: 'utc' }).startOf('day');
    const end = DateTime.fromISO(to, { zone: 'utc' }).startOf('day');

    if (!start.isValid || !end.isValid || start > end) {
      return [];
    }

    const missingDays: string[] = [];
    for (let cursor = start; cursor <= end; cursor = cursor.plus({ days: 1 })) {
      const day = cursor.toISODate();
      if (day && !completeDays.has(day)) {
        missingDays.push(day);
      }
    }

    return missingDays;
  }

  async getLastIngestedDay(
    metricsType: MetricsScope,
    entityId: string,
  ): Promise<string | null> {
    const row = await this.db('copilot_ingestion_log')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .where('status', 'success')
      .orderBy('day', 'desc')
      .first('day');

    return this.normalizeDay(row?.day);
  }

  async getIngestionLog(
    metricsType: MetricsScope,
    entityId: string,
    from?: string,
    to?: string,
  ): Promise<V2IngestionLogRow[]> {
    const query = this.db<V2IngestionLogRow>('copilot_ingestion_log')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId);

    if (from && to) {
      query.whereBetween('day', [from, to]);
    } else if (from) {
      query.where('day', '>=', from);
    } else if (to) {
      query.where('day', '<=', to);
    }

    const rows = await query.orderBy('day', 'asc').select('*');
    return rows.map(row => ({
      ...row,
      day: this.normalizeRequiredDay(row.day),
    }));
  }

  async getDaysMissingCostCenterAggregation(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
  ): Promise<string[]> {
    const [metricRows, ingestionRows, completedRows] = await Promise.all([
      this.db('copilot_user_metrics')
        .where({ metrics_type: metricsType, entity_id: entityId })
        .whereBetween('day', [from, to])
        .distinct('day')
        .select('day'),
      this.db('copilot_ingestion_log')
        .where({ metrics_type: metricsType, entity_id: entityId })
        .whereBetween('day', [from, to])
        .select('day', 'components_loaded'),
      this.db('copilot_cost_center_aggregation_log')
        .where({ metrics_type: metricsType, entity_id: entityId })
        .whereBetween('day', [from, to])
        .select('day'),
    ]);

    const daysToAggregate = new Set<string>();
    for (const row of metricRows) {
      const day = this.normalizeDay(row.day);
      if (day) {
        daysToAggregate.add(day);
      }
    }
    for (const row of ingestionRows) {
      if (!this.hasRequiredComponents(row.components_loaded, ['users'])) {
        continue;
      }

      const day = this.normalizeDay(row.day);
      if (day) {
        daysToAggregate.add(day);
      }
    }

    const completedDays = new Set(
      completedRows
        .map(row => this.normalizeDay(row.day))
        .filter((day): day is string => Boolean(day)),
    );

    return [...daysToAggregate].filter(day => !completedDays.has(day)).sort();
  }

  async getDaysWithIncompleteCostCenterAggregation(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
  ): Promise<string[]> {
    const rows = await this.db('copilot_cost_center_aggregation_log')
      .where({
        metrics_type: metricsType,
        entity_id: entityId,
        unassigned_complete: false,
      })
      .whereBetween('day', [from, to])
      .select('day');

    return rows
      .map(row => this.normalizeDay(row.day))
      .filter((day): day is string => Boolean(day))
      .sort();
  }

  async markCostCenterAggregationDone(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
    unassignedComplete: boolean = true,
  ): Promise<void> {
    await this.db('copilot_cost_center_aggregation_log')
      .insert({
        day,
        metrics_type: metricsType,
        entity_id: entityId,
        unassigned_complete: unassignedComplete,
        aggregated_at: this.db.fn.now(),
      })
      .onConflict(['day', 'metrics_type', 'entity_id'])
      .merge(['unassigned_complete', 'aggregated_at']);
  }

  /**
   * Callers MUST enforce the minimum-member threshold for team or cost-center
   * scopes before exposing these results; the router enforces this.
   */
  async getDailyTotals(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
    costCenter?: CostCenterFilter,
  ): Promise<V2DailyTotal[]> {
    const query = this.db<V2DailyTotal>('copilot_daily_totals')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);

    query.where('team_slug', teamSlug ?? '');
    this.addCostCenterFilter(query, costCenter, 'copilot_daily_totals');

    const rows = (await query.orderBy('day', 'asc').select('*')).map(row =>
      this.normalizeAggregateRow(row),
    );

    // Unscoped org/enterprise rows already carry rolling counts from GitHub.
    // Team and cost-center aggregates are derived from daily per-user data,
    // so their rolling counts are computed from the membership snapshots.
    if (teamSlug || costCenter) {
      return this.enrichScopedRollingActiveUsers(
        rows,
        metricsType,
        entityId,
        from,
        to,
        teamSlug,
        costCenter,
      );
    }

    return rows;
  }

  /**
   * Enrich scoped daily totals with rolling weekly/monthly active-user counts
   * derived from per-user activity and the selected membership snapshots.
   *
   * Definitions follow GitHub's standard rolling windows:
   * - weekly_active_users: distinct active users over the trailing 7 days
   * - monthly_active_users: distinct active users over the trailing 28 days
   * - monthly_active_agent_users / monthly_active_chat_users: distinct users
   *   that used agent/chat over the trailing 28 days
   *
   * A user is active for a scope on a day when they have a per-user metrics
   * row and matching team or cost-center membership for that day.
   */
  private async enrichScopedRollingActiveUsers(
    rows: V2DailyTotal[],
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
    costCenter?: CostCenterFilter,
  ): Promise<V2DailyTotal[]> {
    if (rows.length === 0) {
      return rows;
    }

    const activityRows = await this.loadScopedActivityRows(
      metricsType,
      entityId,
      from,
      to,
      teamSlug,
      costCenter,
      MONTHLY_ACTIVE_USERS_WINDOW_DAYS,
    );

    const { activeByDay, agentByDay, chatByDay } =
      this.collectRollingUsersByDay(activityRows as TeamActivityRow[]);
    let completeUnassignedDays: Set<string> | undefined;
    if (typeof costCenter !== 'string' && costCenter?.kind === 'noCostCenter') {
      const lowerBound = DateTime.fromISO(from)
        .minus({ days: MONTHLY_ACTIVE_USERS_WINDOW_DAYS - 1 })
        .toFormat('yyyy-MM-dd');
      const completionRows = await this.db(
        'copilot_cost_center_aggregation_log',
      )
        .where({
          metrics_type: metricsType,
          entity_id: entityId,
          unassigned_complete: true,
        })
        .whereBetween('day', [lowerBound, to])
        .select('day');
      completeUnassignedDays = new Set(
        completionRows
          .map(completion => this.normalizeDay(completion.day))
          .filter((day): day is string => Boolean(day)),
      );
    }

    return rows.map(row =>
      this.enrichDailyTotalWithRollingUsers(row, {
        activeByDay,
        agentByDay,
        chatByDay,
        weeklyWindowDays: WEEKLY_ACTIVE_USERS_WINDOW_DAYS,
        monthlyWindowDays: MONTHLY_ACTIVE_USERS_WINDOW_DAYS,
        completeUnassignedDays,
      }),
    );
  }

  private async loadScopedActivityRows(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug: string | undefined,
    costCenter: CostCenterFilter | undefined,
    monthlyWindowDays: number,
  ) {
    // Each emitted row's rolling value is anchored at *that row's own day* and
    // looks backwards. `fetchLowerBound` only widens the SQL fetch so the
    // earliest days in [from, to] still have a full trailing window available.
    const fetchLowerBound = DateTime.fromISO(from)
      .minus({ days: monthlyWindowDays - 1 })
      .toFormat('yyyy-MM-dd');

    const database = this.db;
    const query = database('copilot_user_metrics as m');

    if (teamSlug) {
      query.join('copilot_user_teams as t', function joinTeam() {
        this.on('m.day', '=', 't.day')
          .andOn('m.user_id', '=', 't.user_id')
          .andOn('m.metrics_type', '=', 't.metrics_type')
          .andOn('m.entity_id', '=', 't.entity_id');
      });
    }

    if (typeof costCenter === 'string') {
      query.join('copilot_user_cost_centers as c', function joinCostCenter() {
        this.on('m.day', '=', 'c.day')
          .andOn('m.user_id', '=', 'c.user_id')
          .andOn('m.metrics_type', '=', 'c.metrics_type')
          .andOn('m.entity_id', '=', 'c.entity_id');
      });
    } else if (costCenter?.kind === 'noCostCenter') {
      // Only treat a day as unassigned when its cost-center snapshot was
      // transactionally completed; an absent snapshot is not evidence that a
      // user had no cost center.
      query.join(
        'copilot_cost_center_aggregation_log as cost_center_done',
        function joinCompletedCostCenterDay() {
          this.on('m.day', '=', 'cost_center_done.day')
            .andOn('m.metrics_type', '=', 'cost_center_done.metrics_type')
            .andOn('m.entity_id', '=', 'cost_center_done.entity_id');
        },
      );
      query.where('cost_center_done.unassigned_complete', true);
    }

    query
      .where('m.metrics_type', metricsType)
      .where('m.entity_id', entityId)
      .whereBetween('m.day', [fetchLowerBound, to]);

    if (teamSlug) {
      query.where('t.team_slug', teamSlug);
    }

    if (typeof costCenter === 'string') {
      query.where('c.cost_center_id', costCenter);
    } else if (costCenter?.kind === 'noCostCenter') {
      query.whereNotExists(function userHasCostCenter() {
        this.select(database.raw('1'))
          .from('copilot_user_cost_centers as c')
          .whereRaw('?? = ??', ['c.day', 'm.day'])
          .whereRaw('?? = ??', ['c.metrics_type', 'm.metrics_type'])
          .whereRaw('?? = ??', ['c.entity_id', 'm.entity_id'])
          .whereRaw('?? = ??', ['c.user_id', 'm.user_id']);
      });
    }

    return query.select(
      'm.day as day',
      'm.user_id as user_id',
      'm.used_agent as used_agent',
      'm.used_chat as used_chat',
    );
  }

  private enrichDailyTotalWithRollingUsers(
    row: V2DailyTotal,
    params: {
      activeByDay: Map<string, Set<number>>;
      agentByDay: Map<string, Set<number>>;
      chatByDay: Map<string, Set<number>>;
      weeklyWindowDays: number;
      monthlyWindowDays: number;
      completeUnassignedDays?: Set<string>;
    },
  ): V2DailyTotal {
    const day = this.normalizeDay(row.day);
    if (!day) {
      return row;
    }

    const weeklyWindowComplete =
      !params.completeUnassignedDays ||
      this.isRollingWindowComplete(
        params.completeUnassignedDays,
        day,
        params.weeklyWindowDays,
      );
    const monthlyWindowComplete =
      !params.completeUnassignedDays ||
      this.isRollingWindowComplete(
        params.completeUnassignedDays,
        day,
        params.monthlyWindowDays,
      );

    return {
      ...row,
      weekly_active_users: weeklyWindowComplete
        ? this.countDistinctUsersOverWindow(
            params.activeByDay,
            day,
            params.weeklyWindowDays,
          )
        : undefined,
      monthly_active_users: monthlyWindowComplete
        ? this.countDistinctUsersOverWindow(
            params.activeByDay,
            day,
            params.monthlyWindowDays,
          )
        : undefined,
      monthly_active_agent_users: monthlyWindowComplete
        ? this.countDistinctUsersOverWindow(
            params.agentByDay,
            day,
            params.monthlyWindowDays,
          )
        : undefined,
      monthly_active_chat_users: monthlyWindowComplete
        ? this.countDistinctUsersOverWindow(
            params.chatByDay,
            day,
            params.monthlyWindowDays,
          )
        : undefined,
    };
  }

  private isRollingWindowComplete(
    completeDays: Set<string>,
    endDay: string,
    windowDays: number,
  ): boolean {
    const end = DateTime.fromISO(endDay, { zone: 'utc' });
    if (!end.isValid) {
      return false;
    }

    for (let dayOffset = 0; dayOffset < windowDays; dayOffset++) {
      const dayKey = end.minus({ days: dayOffset }).toFormat('yyyy-MM-dd');
      if (!completeDays.has(dayKey)) {
        return false;
      }
    }

    return true;
  }

  private collectRollingUsersByDay(activityRows: TeamActivityRow[]): {
    activeByDay: Map<string, Set<number>>;
    agentByDay: Map<string, Set<number>>;
    chatByDay: Map<string, Set<number>>;
  } {
    const activeByDay = new Map<string, Set<number>>();
    const agentByDay = new Map<string, Set<number>>();
    const chatByDay = new Map<string, Set<number>>();

    for (const row of activityRows) {
      const day = this.normalizeDay(row.day);
      if (!day) {
        continue;
      }

      const userId = Number(row.user_id);
      this.addUserToDayMap(activeByDay, day, userId);

      if (row.used_agent) {
        this.addUserToDayMap(agentByDay, day, userId);
      }

      if (row.used_chat) {
        this.addUserToDayMap(chatByDay, day, userId);
      }
    }

    return { activeByDay, agentByDay, chatByDay };
  }

  private countDistinctUsersOverWindow(
    byDay: Map<string, Set<number>>,
    endDay: string,
    windowDays: number,
  ): number {
    const end = DateTime.fromISO(endDay, { zone: 'utc' });
    if (!end.isValid) {
      return 0;
    }

    const users = new Set<number>();
    for (let dayOffset = 0; dayOffset < windowDays; dayOffset++) {
      const dayKey = end.minus({ days: dayOffset }).toFormat('yyyy-MM-dd');
      const dayUsers = byDay.get(dayKey);
      if (!dayUsers) {
        continue;
      }

      for (const userId of dayUsers) {
        users.add(userId);
      }
    }

    return users.size;
  }

  private addUserToDayMap(
    byDay: Map<string, Set<number>>,
    day: string,
    userId: number,
  ): void {
    const users = byDay.get(day) ?? new Set<number>();
    users.add(userId);
    byDay.set(day, users);
  }

  private applyCostCenterBreakdownBucketing<T extends { day: string }>(
    rows: T[],
    costCenter: CostCenterFilter | undefined,
    kind: CostCenterBreakdownKind,
  ): T[] {
    return costCenter ? bucketCostCenterBreakdown(rows, kind) : rows;
  }

  /**
   * Callers MUST enforce the minimum-member threshold for team or cost-center
   * scopes before exposing these results; the router enforces this.
   */
  async getPrMetrics(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
    costCenter?: CostCenterFilter,
  ): Promise<V2PrMetricsRow[]> {
    const query = this.db<V2PrMetricsRow>('copilot_pr_metrics')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);

    query.where('team_slug', teamSlug ?? '');
    this.addCostCenterFilter(query, costCenter, 'copilot_pr_metrics');

    const rows = await query.orderBy('day', 'asc').select('*');
    return rows.map(row => this.normalizeAggregateRow(row));
  }

  /**
   * Callers MUST enforce the minimum-member threshold for team or cost-center
   * scopes before exposing these results; the router enforces this.
   */
  async getByFeature(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
    costCenter?: CostCenterFilter,
  ): Promise<V2MetricsByFeatureRow[]> {
    const query = this.db<V2MetricsByFeatureRow>('copilot_metrics_by_feature')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);

    query.where('team_slug', teamSlug ?? '');
    this.addCostCenterFilter(query, costCenter, 'copilot_metrics_by_feature');

    const rows = await query.orderBy('day', 'asc').select('*');
    return this.applyCostCenterBreakdownBucketing(
      rows.map(row => this.normalizeAggregateRow(row)),
      costCenter,
      'feature',
    );
  }

  /**
   * Callers MUST enforce the minimum-member threshold for team or cost-center
   * scopes before exposing these results; the router enforces this.
   */
  async getByIde(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
    costCenter?: CostCenterFilter,
  ): Promise<V2MetricsByIdeRow[]> {
    const query = this.db<V2MetricsByIdeRow>('copilot_metrics_by_ide')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);

    query.where('team_slug', teamSlug ?? '');
    this.addCostCenterFilter(query, costCenter, 'copilot_metrics_by_ide');

    const rows = await query.orderBy('day', 'asc').select('*');
    return this.applyCostCenterBreakdownBucketing(
      rows.map(row => this.normalizeAggregateRow(row)),
      costCenter,
      'ide',
    );
  }

  /**
   * Callers MUST enforce the minimum-member threshold for team or cost-center
   * scopes before exposing these results; the router enforces this.
   */
  async getByLanguageFeature(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
    feature?: string,
    costCenter?: CostCenterFilter,
  ): Promise<V2MetricsByLanguageFeatureRow[]> {
    const query = this.db<V2MetricsByLanguageFeatureRow>(
      'copilot_metrics_by_language_feature',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);

    query.where('team_slug', teamSlug ?? '');
    this.addCostCenterFilter(
      query,
      costCenter,
      'copilot_metrics_by_language_feature',
    );

    if (feature !== undefined) {
      query.where('feature', feature);
    }

    const rows = await query.orderBy('day', 'asc').select('*');
    return this.applyCostCenterBreakdownBucketing(
      rows.map(row => this.normalizeAggregateRow(row)),
      costCenter,
      'language-feature',
    );
  }

  /**
   * Callers MUST enforce the minimum-member threshold for team or cost-center
   * scopes before exposing these results; the router enforces this.
   */
  async getByModelFeature(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
    costCenter?: CostCenterFilter,
  ): Promise<V2MetricsByModelFeatureRow[]> {
    const query = this.db<V2MetricsByModelFeatureRow>(
      'copilot_metrics_by_model_feature',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);
    query.where('team_slug', teamSlug ?? '');
    this.addCostCenterFilter(
      query,
      costCenter,
      'copilot_metrics_by_model_feature',
    );
    const rows = await query.orderBy('day', 'asc').select('*');
    return this.applyCostCenterBreakdownBucketing(
      rows.map(row => this.normalizeAggregateRow(row)),
      costCenter,
      'model-feature',
    );
  }

  /**
   * Callers MUST enforce the minimum-member threshold for team or cost-center
   * scopes before exposing these results; the router enforces this.
   */
  async getByLanguageModel(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
    costCenter?: CostCenterFilter,
  ): Promise<V2MetricsByLanguageModelRow[]> {
    const query = this.db<V2MetricsByLanguageModelRow>(
      'copilot_metrics_by_language_model',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);
    query.where('team_slug', teamSlug ?? '');
    this.addCostCenterFilter(
      query,
      costCenter,
      'copilot_metrics_by_language_model',
    );
    const rows = await query.orderBy('day', 'asc').select('*');
    return this.applyCostCenterBreakdownBucketing(
      rows.map(row => this.normalizeAggregateRow(row)),
      costCenter,
      'language-model',
    );
  }

  async getCustomizationMetrics(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
    costCenter?: CostCenterFilter,
  ): Promise<V2CustomizationMetricRow[]> {
    if (costCenter) {
      const query = this.db<CostCenterCustomizationMetricRow>(
        'copilot_customization_metrics_by_cost_center',
      )
        .where('metrics_type', metricsType)
        .where('entity_id', entityId)
        .whereBetween('day', [from, to]);
      this.addCostCenterFilter(
        query,
        costCenter,
        'copilot_customization_metrics_by_cost_center',
      );
      const rows = await query.orderBy('day', 'asc').select('*');
      const normalizedRows: V2CustomizationMetricRow[] = rows.map(row => ({
        day: this.normalizeRequiredDay(row.day),
        metrics_type: row.metrics_type,
        entity_id: row.entity_id,
        scope: 'aggregate',
        team_slug: '',
        user_id: 0,
        user_login: '',
        category: row.category,
        item_name: row.item_name,
        interaction_count: row.interaction_count,
      }));

      return this.applyCostCenterBreakdownBucketing(
        normalizedRows,
        costCenter,
        'customization',
      );
    }

    const query = this.db<V2CustomizationMetricRow>(
      'copilot_customization_metrics',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to])
      .where('scope', teamSlug ? 'team' : 'aggregate')
      .where('team_slug', teamSlug ?? '')
      .orderBy('day', 'asc');

    const rows = await query.select('*');
    return rows.map(row => ({
      ...row,
      day: this.normalizeRequiredDay(row.day),
    }));
  }

  async getCustomizationSummaries(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
    costCenter?: CostCenterFilter,
  ): Promise<V2CustomizationSummaryRow[]> {
    if (teamSlug || costCenter) {
      return [];
    }

    const rows = await this.db<V2CustomizationSummaryRow>(
      'copilot_customization_summaries',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to])
      .where('scope', 'aggregate')
      .where('team_slug', '')
      .orderBy('day', 'asc')
      .select('*');

    return rows.map(row => ({
      ...row,
      day: this.normalizeRequiredDay(row.day),
    }));
  }

  /**
   * Callers MUST enforce the minimum-member threshold for team or cost-center
   * scopes before exposing these results; the router enforces this.
   */
  async getDashboardData(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
    costCenterScope?: CostCenterDashboardScope,
  ): Promise<V2DashboardData> {
    const costCenter: CostCenterFilter | undefined =
      costCenterScope?.kind === 'costCenter'
        ? costCenterScope.id
        : costCenterScope;

    const [
      daily,
      byFeature,
      byLanguage,
      byModelFeature,
      byLanguageModel,
      prMetrics,
      customizationMetrics,
      customizationSummaries,
    ] = await Promise.all([
      this.getDailyTotals(
        metricsType,
        entityId,
        from,
        to,
        teamSlug,
        costCenter,
      ),
      this.getByFeature(metricsType, entityId, from, to, teamSlug, costCenter),
      this.getByLanguageFeature(
        metricsType,
        entityId,
        from,
        to,
        teamSlug,
        undefined,
        costCenter,
      ),
      this.getByModelFeature(
        metricsType,
        entityId,
        from,
        to,
        teamSlug,
        costCenter,
      ),
      this.getByLanguageModel(
        metricsType,
        entityId,
        from,
        to,
        teamSlug,
        costCenter,
      ),
      this.getPrMetrics(metricsType, entityId, from, to, teamSlug, costCenter),
      this.getCustomizationMetrics(
        metricsType,
        entityId,
        from,
        to,
        teamSlug,
        costCenter,
      ),
      this.getCustomizationSummaries(
        metricsType,
        entityId,
        from,
        to,
        teamSlug,
        costCenter,
      ),
    ]);

    return {
      daily,
      byFeature,
      byLanguage,
      byModelFeature,
      byLanguageModel,
      prMetrics,
      customizationMetrics,
      customizationSummaries,
    };
  }

  /**
   * Fetch daily per-user metric rows for a single, specific user.
   *
   * `userLogin` is a required parameter (not optional) by design: there is
   * intentionally no variant of this method that returns rows for more than
   * one user, since this data backs privacy-scoped "my metrics" APIs that
   * must never be able to return another user's data.
   */
  async getUserMetrics(
    metricsType: MetricsScope,
    entityId: string,
    userLogin: string,
    from: string,
    to: string,
  ): Promise<V2UserMetricRow[]> {
    const rows = await this.db<V2UserMetricRow>('copilot_user_metrics')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereRaw('LOWER(user_login) = ?', [userLogin.toLowerCase()])
      .whereBetween('day', [from, to])
      .orderBy('day', 'asc')
      .select('*');

    return rows.map(row => ({
      ...row,
      day: this.normalizeRequiredDay(row.day),
    }));
  }

  async getUserMetricsByFeature(
    metricsType: MetricsScope,
    entityId: string,
    userLogin: string,
    from: string,
    to: string,
  ): Promise<V2UserMetricsByFeatureRow[]> {
    const rows = await this.db<V2UserMetricsByFeatureRow>(
      'copilot_user_metrics_by_feature',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereRaw('LOWER(user_login) = ?', [userLogin.toLowerCase()])
      .whereBetween('day', [from, to])
      .orderBy('day', 'asc')
      .select('*');

    return rows.map(row => ({
      ...row,
      day: this.normalizeRequiredDay(row.day),
    }));
  }

  async getUserMetricsByIde(
    metricsType: MetricsScope,
    entityId: string,
    userLogin: string,
    from: string,
    to: string,
  ): Promise<V2UserMetricsByIdeRow[]> {
    const rows = await this.db<V2UserMetricsByIdeRow>(
      'copilot_user_metrics_by_ide',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereRaw('LOWER(user_login) = ?', [userLogin.toLowerCase()])
      .whereBetween('day', [from, to])
      .orderBy('day', 'asc')
      .select('*');

    return rows.map(row => ({
      ...row,
      day: this.normalizeRequiredDay(row.day),
    }));
  }

  async getUserMetricsByLanguageFeature(
    metricsType: MetricsScope,
    entityId: string,
    userLogin: string,
    from: string,
    to: string,
  ): Promise<V2UserMetricsByLanguageFeatureRow[]> {
    const rows = await this.db<V2UserMetricsByLanguageFeatureRow>(
      'copilot_user_metrics_by_language_feature',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereRaw('LOWER(user_login) = ?', [userLogin.toLowerCase()])
      .whereBetween('day', [from, to])
      .orderBy('day', 'asc')
      .select('*');

    return rows.map(row => ({
      ...row,
      day: this.normalizeRequiredDay(row.day),
    }));
  }

  async getUserMetricsByModelFeature(
    metricsType: MetricsScope,
    entityId: string,
    userLogin: string,
    from: string,
    to: string,
  ): Promise<V2UserMetricsByModelFeatureRow[]> {
    const rows = await this.db<V2UserMetricsByModelFeatureRow>(
      'copilot_user_metrics_by_model_feature',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereRaw('LOWER(user_login) = ?', [userLogin.toLowerCase()])
      .whereBetween('day', [from, to])
      .orderBy('day', 'asc')
      .select('*');

    return rows.map(row => ({
      ...row,
      day: this.normalizeRequiredDay(row.day),
    }));
  }

  async getUserMetricsByLanguageModel(
    metricsType: MetricsScope,
    entityId: string,
    userLogin: string,
    from: string,
    to: string,
  ): Promise<V2UserMetricsByLanguageModelRow[]> {
    const rows = await this.db<V2UserMetricsByLanguageModelRow>(
      'copilot_user_metrics_by_language_model',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereRaw('LOWER(user_login) = ?', [userLogin.toLowerCase()])
      .whereBetween('day', [from, to])
      .orderBy('day', 'asc')
      .select('*');

    return rows.map(row => ({
      ...row,
      day: this.normalizeRequiredDay(row.day),
    }));
  }

  private async getUserCustomizationMetrics(
    metricsType: MetricsScope,
    entityId: string,
    userLogin: string,
    from: string,
    to: string,
  ): Promise<V2CustomizationMetricRow[]> {
    const rows = await this.db<V2CustomizationMetricRow>(
      'copilot_customization_metrics',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .where('scope', 'user')
      .where('user_login', userLogin.toLowerCase())
      .whereBetween('day', [from, to])
      .orderBy('day', 'asc')
      .select('*');

    return rows.map(row => ({
      ...row,
      day: this.normalizeRequiredDay(row.day),
    }));
  }

  private async getUserCustomizationSummaries(
    metricsType: MetricsScope,
    entityId: string,
    userLogin: string,
    from: string,
    to: string,
  ): Promise<V2CustomizationSummaryRow[]> {
    const rows = await this.db<V2CustomizationSummaryRow>(
      'copilot_customization_summaries',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .where('scope', 'user')
      .where('user_login', userLogin.toLowerCase())
      .whereBetween('day', [from, to])
      .orderBy('day', 'asc')
      .select('*');

    return rows.map(row => ({
      ...row,
      day: this.normalizeRequiredDay(row.day),
    }));
  }

  /**
   * Fetch the full set of chart data needed to render an individual user's
   * "my metrics" dashboard, scoped strictly to `userLogin`. Backs the
   * `/v2/me/dashboard` endpoint, whose route handler resolves `userLogin`
   * itself from the caller's own Backstage identity — this method has no
   * knowledge of, and cannot be called with, an unauthenticated or
   * arbitrary user identifier from client input.
   */
  async getUserDashboardData(
    metricsType: MetricsScope,
    entityId: string,
    userLogin: string,
    from: string,
    to: string,
  ): Promise<V2UserDashboardData> {
    const [
      daily,
      byFeature,
      byIde,
      byLanguage,
      byModelFeature,
      byLanguageModel,
      customizationMetrics,
      customizationSummaries,
    ] = await Promise.all([
      this.getUserMetrics(metricsType, entityId, userLogin, from, to),
      this.getUserMetricsByFeature(metricsType, entityId, userLogin, from, to),
      this.getUserMetricsByIde(metricsType, entityId, userLogin, from, to),
      this.getUserMetricsByLanguageFeature(
        metricsType,
        entityId,
        userLogin,
        from,
        to,
      ),
      this.getUserMetricsByModelFeature(
        metricsType,
        entityId,
        userLogin,
        from,
        to,
      ),
      this.getUserMetricsByLanguageModel(
        metricsType,
        entityId,
        userLogin,
        from,
        to,
      ),
      this.getUserCustomizationMetrics(
        metricsType,
        entityId,
        userLogin,
        from,
        to,
      ),
      this.getUserCustomizationSummaries(
        metricsType,
        entityId,
        userLogin,
        from,
        to,
      ),
    ]);

    return {
      userLogin,
      daily,
      byFeature,
      byIde,
      byLanguage,
      byModelFeature,
      byLanguageModel,
      customizationMetrics,
      customizationSummaries,
    };
  }

  async getUserMetricsForDay(
    metricsType: MetricsScope,
    entityId: string,
    day: string,
  ): Promise<V2UserMetricRow[]> {
    const rows = await this.db<V2UserMetricRow>('copilot_user_metrics')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .where('day', day)
      .orderBy('user_id', 'asc')
      .select('*');

    return rows.map(row => ({
      ...row,
      day: this.normalizeRequiredDay(row.day),
      user_id: Number(row.user_id),
    }));
  }

  async getUserBreakdownsForDay(
    metricsType: MetricsScope,
    entityId: string,
    day: string,
  ): Promise<UserBreakdownData[]> {
    const getRows = (tableName: string) =>
      this.db(tableName)
        .where('metrics_type', metricsType)
        .where('entity_id', entityId)
        .where('day', day)
        .orderBy('user_id', 'asc')
        .select('*');

    const [
      featureRows,
      ideRows,
      languageFeatureRows,
      modelFeatureRows,
      languageModelRows,
      customizationRows,
    ] = await Promise.all([
      getRows('copilot_user_metrics_by_feature'),
      getRows('copilot_user_metrics_by_ide'),
      getRows('copilot_user_metrics_by_language_feature'),
      getRows('copilot_user_metrics_by_model_feature'),
      getRows('copilot_user_metrics_by_language_model'),
      this.db<V2CustomizationMetricRow>('copilot_customization_metrics')
        .where({
          metrics_type: metricsType,
          entity_id: entityId,
          day,
          scope: 'user',
        })
        .orderBy('user_id', 'asc')
        .orderBy('category', 'asc')
        .orderBy('item_name', 'asc')
        .select('*'),
    ]);

    const breakdowns = new Map<number, UserBreakdownData>();
    const getBreakdown = (
      userIdValue: unknown,
      userLogin: string,
    ): UserBreakdownData => {
      const userId = Number(userIdValue);
      const existing = breakdowns.get(userId);
      if (existing) {
        return existing;
      }

      const breakdown: UserBreakdownData = {
        user_id: userId,
        user_login: userLogin,
        byFeature: [],
        byIde: [],
        byLanguageFeature: [],
        byModelFeature: [],
        byLanguageModel: [],
        customizations: [],
      };
      breakdowns.set(userId, breakdown);
      return breakdown;
    };

    for (const row of featureRows) {
      getBreakdown(row.user_id, row.user_login).byFeature.push({
        feature: row.feature,
        user_initiated_interaction_count: row.user_initiated_interaction_count,
        code_generation_activity_count: row.code_generation_activity_count,
        code_acceptance_activity_count: row.code_acceptance_activity_count,
        loc_added_sum: row.loc_added_sum,
        loc_deleted_sum: row.loc_deleted_sum,
        loc_suggested_to_add_sum: row.loc_suggested_to_add_sum,
        loc_suggested_to_delete_sum: row.loc_suggested_to_delete_sum,
      });
    }

    for (const row of ideRows) {
      getBreakdown(row.user_id, row.user_login).byIde.push({
        ide: row.ide,
        user_initiated_interaction_count: row.user_initiated_interaction_count,
        code_generation_activity_count: row.code_generation_activity_count,
        code_acceptance_activity_count: row.code_acceptance_activity_count,
        loc_added_sum: row.loc_added_sum,
        loc_deleted_sum: row.loc_deleted_sum,
        loc_suggested_to_add_sum: row.loc_suggested_to_add_sum,
        loc_suggested_to_delete_sum: row.loc_suggested_to_delete_sum,
      });
    }

    for (const row of languageFeatureRows) {
      getBreakdown(row.user_id, row.user_login).byLanguageFeature.push({
        language: row.language,
        feature: row.feature,
        code_generation_activity_count: row.code_generation_activity_count,
        code_acceptance_activity_count: row.code_acceptance_activity_count,
        loc_added_sum: row.loc_added_sum,
        loc_deleted_sum: row.loc_deleted_sum,
        loc_suggested_to_add_sum: row.loc_suggested_to_add_sum,
        loc_suggested_to_delete_sum: row.loc_suggested_to_delete_sum,
      });
    }

    for (const row of modelFeatureRows) {
      getBreakdown(row.user_id, row.user_login).byModelFeature.push({
        model_id: row.model_id,
        feature: row.feature,
        user_initiated_interaction_count: row.user_initiated_interaction_count,
        code_generation_activity_count: row.code_generation_activity_count,
        code_acceptance_activity_count: row.code_acceptance_activity_count,
        loc_added_sum: row.loc_added_sum,
        loc_deleted_sum: row.loc_deleted_sum,
        loc_suggested_to_add_sum: row.loc_suggested_to_add_sum,
        loc_suggested_to_delete_sum: row.loc_suggested_to_delete_sum,
      });
    }

    for (const row of languageModelRows) {
      getBreakdown(row.user_id, row.user_login).byLanguageModel.push({
        language: row.language,
        model_id: row.model_id,
        request_count: row.request_count,
        code_generation_activity_count: row.code_generation_activity_count,
        code_acceptance_activity_count: row.code_acceptance_activity_count,
        loc_added_sum: row.loc_added_sum,
        loc_deleted_sum: row.loc_deleted_sum,
        loc_suggested_to_add_sum: row.loc_suggested_to_add_sum,
        loc_suggested_to_delete_sum: row.loc_suggested_to_delete_sum,
      });
    }

    for (const row of customizationRows) {
      getBreakdown(row.user_id, row.user_login).customizations.push({
        category: row.category,
        item_name: row.item_name,
        interaction_count: row.interaction_count,
      });
    }

    return [...breakdowns.values()];
  }

  async hasUserMetrics(
    metricsType: MetricsScope,
    entityId: string,
    userLogin: string,
  ): Promise<boolean> {
    const row = await this.db('copilot_user_metrics')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereRaw('LOWER(user_login) = ?', [userLogin.toLowerCase()])
      .select('user_id')
      .first();

    return Boolean(row);
  }

  async getCostCenters(
    metricsType: MetricsScope,
    entityId: string,
    from?: string,
    to?: string,
    minMembers: number = 5,
  ): Promise<V2CostCenterListResponse> {
    const costCenterQuery = this.db('copilot_user_cost_centers as ucc')
      .join('copilot_user_metrics as m', function joinMetrics() {
        this.on('ucc.day', '=', 'm.day')
          .andOn('ucc.metrics_type', '=', 'm.metrics_type')
          .andOn('ucc.entity_id', '=', 'm.entity_id')
          .andOn('ucc.user_id', '=', 'm.user_id');
      })
      .leftJoin('copilot_cost_centers as cc', function joinOn() {
        this.on('ucc.metrics_type', '=', 'cc.metrics_type')
          .andOn('ucc.entity_id', '=', 'cc.entity_id')
          .andOn('ucc.cost_center_id', '=', 'cc.cost_center_id');
      })
      .where('ucc.metrics_type', metricsType)
      .where('ucc.entity_id', entityId);

    if (from && to) {
      costCenterQuery.whereBetween('ucc.day', [from, to]);
    } else if (from) {
      costCenterQuery.where('ucc.day', '>=', from);
    } else if (to) {
      costCenterQuery.where('ucc.day', '<=', to);
    }

    const costCenterRows = await costCenterQuery
      .groupBy('ucc.cost_center_id', 'cc.name')
      .havingRaw('COUNT(DISTINCT ??) >= ?', ['ucc.user_id', minMembers])
      .orderByRaw('COALESCE(??, ??) ASC', ['cc.name', 'ucc.cost_center_id'])
      .select('ucc.cost_center_id as id', 'cc.name as name');

    const costCenters = costCenterRows.map(row => {
      const id = String(row.id);
      return {
        id,
        name:
          typeof row.name === 'string' && row.name.length > 0 ? row.name : id,
      };
    });

    const database = this.db;
    const unassignedQuery = database(
      'copilot_cost_center_aggregation_log as done',
    )
      .join('copilot_user_metrics as m', function joinCompletedMetrics() {
        this.on('done.day', '=', 'm.day')
          .andOn('done.metrics_type', '=', 'm.metrics_type')
          .andOn('done.entity_id', '=', 'm.entity_id');
      })
      .where('done.metrics_type', metricsType)
      .where('done.entity_id', entityId)
      .where('done.unassigned_complete', true)
      .whereNotExists(function userHasCostCenter() {
        this.select(database.raw('1'))
          .from('copilot_user_cost_centers as ucc')
          .whereRaw('?? = ??', ['ucc.day', 'm.day'])
          .whereRaw('?? = ??', ['ucc.metrics_type', 'm.metrics_type'])
          .whereRaw('?? = ??', ['ucc.entity_id', 'm.entity_id'])
          .whereRaw('?? = ??', ['ucc.user_id', 'm.user_id']);
      });

    if (from && to) {
      unassignedQuery.whereBetween('m.day', [from, to]);
    } else if (from) {
      unassignedQuery.where('m.day', '>=', from);
    } else if (to) {
      unassignedQuery.where('m.day', '<=', to);
    }

    const unassignedCount = await unassignedQuery
      .countDistinct({ member_count: 'm.user_id' })
      .first();

    return {
      costCenters,
      hasUsersWithoutCostCenter:
        Number(unassignedCount?.member_count ?? 0) >= minMembers,
    };
  }

  async hasUsersWithoutCostCenterOnDashboard(
    metricsType: MetricsScope,
    entityId: string,
    dailyRows: Pick<V2DailyTotal, 'day'>[],
    minMembers: number = 5,
  ): Promise<boolean> {
    const returnedDays = new Set(dailyRows.map(row => row.day));
    if (returnedDays.size === 0) {
      return false;
    }

    const database = this.db;
    const unassignedCount = await database(
      'copilot_cost_center_aggregation_log as done',
    )
      .join('copilot_user_metrics as m', function joinCompletedMetrics() {
        this.on('done.day', '=', 'm.day')
          .andOn('done.metrics_type', '=', 'm.metrics_type')
          .andOn('done.entity_id', '=', 'm.entity_id');
      })
      .where('done.metrics_type', metricsType)
      .where('done.entity_id', entityId)
      .where('done.unassigned_complete', true)
      .whereIn('done.day', [...returnedDays])
      .whereNotExists(function userHasCostCenter() {
        this.select(database.raw('1'))
          .from('copilot_user_cost_centers as ucc')
          .whereRaw('?? = ??', ['ucc.day', 'm.day'])
          .whereRaw('?? = ??', ['ucc.metrics_type', 'm.metrics_type'])
          .whereRaw('?? = ??', ['ucc.entity_id', 'm.entity_id'])
          .whereRaw('?? = ??', ['ucc.user_id', 'm.user_id']);
      })
      .countDistinct({ member_count: 'm.user_id' })
      .first();

    return Number(unassignedCount?.member_count ?? 0) >= minMembers;
  }

  async getTeams(
    metricsType: MetricsScope,
    entityId: string,
    from?: string,
    to?: string,
    minMembers: number = 5,
  ): Promise<string[]> {
    const query = this.db('copilot_user_teams as t')
      .where('t.metrics_type', metricsType)
      .where('t.entity_id', entityId)
      .whereNot('t.team_slug', '');

    if (from && to) {
      query.whereBetween('t.day', [from, to]);
    } else if (from) {
      query.where('t.day', '>=', from);
    } else if (to) {
      query.where('t.day', '<=', to);
    }

    const rows = await query
      .groupBy('t.team_slug')
      .havingRaw('COUNT(DISTINCT ??) >= ?', ['t.user_id', minMembers])
      .orderBy('t.team_slug', 'asc')
      .select('t.team_slug');

    return rows.map(row => row.team_slug);
  }

  /**
   * Callers MUST enforce the minimum-member threshold for cost-center scopes
   * before exposing this range; the router enforces this.
   */
  async getPeriodRange(
    metricsType: MetricsScope,
    entityId: string,
    costCenter?: CostCenterFilter,
  ): Promise<PeriodRange | null> {
    const query = this.db('copilot_daily_totals')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId);
    this.addCostCenterFilter(query, costCenter, 'copilot_daily_totals');

    const row = await query
      .select(
        this.db.raw('MIN(day) as min_day'),
        this.db.raw('MAX(day) as max_day'),
      )
      .first();

    const minDate = this.normalizeDay(row?.min_day);
    const maxDate = this.normalizeDay(row?.max_day);

    if (!minDate || !maxDate) {
      return null;
    }

    return { minDate, maxDate };
  }

  private normalizeDay(value: unknown): string | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return DateTime.fromJSDate(value, { zone: 'utc' }).toISODate();
    }

    if (typeof value === 'string') {
      const datePrefix = /^\d{4}-\d{2}-\d{2}/.exec(value)?.[0];
      if (datePrefix) {
        return datePrefix;
      }

      const parsed = DateTime.fromISO(value, { zone: 'utc' });
      if (parsed.isValid) {
        return parsed.toISODate();
      }
    }

    return null;
  }
  /**
   * Like normalizeDay, but throws if the value can't be normalized.
   * Use this for DB columns that are NOT NULL — if this ever throws,
   * it means the data violates an invariant we assume elsewhere
   * (e.g. the frontend requires a valid day string to render charts).
   */
  private normalizeRequiredDay(value: unknown): string {
    const normalized = this.normalizeDay(value);
    if (normalized === null) {
      throw new Error(
        `Expected a valid 'day' value from the database but got: ${JSON.stringify(
          value,
        )}`,
      );
    }
    return normalized;
  }

  private hasRequiredComponents(
    value: unknown,
    requiredComponents: string[],
  ): boolean {
    const loadedComponents = new Set(parseComponentsLoaded(value));
    return requiredComponents.every(component =>
      loadedComponents.has(component),
    );
  }
}
