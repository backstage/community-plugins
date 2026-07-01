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
  V2DailyTotal,
  V2DashboardData,
  V2IngestionLogRow,
  V2MetricsByCliRow,
  V2MetricsByFeatureRow,
  V2MetricsByIdeRow,
  V2MetricsByLanguageFeatureRow,
  V2MetricsByModelFeatureRow,
  V2MetricsByLanguageModelRow,
  V2PrMetricsRow,
  V2UserMetricRow,
  V2UserTeamRow,
  MetricsScope,
} from '@backstage-community/plugin-copilot-common';
import { DateTime } from 'luxon';
import { Knex } from 'knex';
import { migrationsDir } from './DatabaseHandler';
import { batchInsertInChunks } from '../utils/batchInsert';

type Options = {
  database: DatabaseService;
};

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

  async insertDailyTotals(rows: V2DailyTotal[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2DailyTotal>('copilot_daily_totals')
        .insert(chunk)
        .onConflict(['day', 'metrics_type', 'entity_id', 'team_slug'])
        .ignore();
    });
  }

  async insertPrMetrics(rows: V2PrMetricsRow[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2PrMetricsRow>('copilot_pr_metrics')
        .insert(chunk)
        .onConflict(['day', 'metrics_type', 'entity_id', 'team_slug'])
        .ignore();
    });
  }

  async insertByFeature(rows: V2MetricsByFeatureRow[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2MetricsByFeatureRow>('copilot_metrics_by_feature')
        .insert(chunk)
        .onConflict([
          'day',
          'metrics_type',
          'entity_id',
          'team_slug',
          'feature',
        ])
        .ignore();
    });
  }

  async insertByIde(rows: V2MetricsByIdeRow[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2MetricsByIdeRow>('copilot_metrics_by_ide')
        .insert(chunk)
        .onConflict(['day', 'metrics_type', 'entity_id', 'team_slug', 'ide'])
        .ignore();
    });
  }

  async insertByLanguageFeature(
    rows: V2MetricsByLanguageFeatureRow[],
  ): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2MetricsByLanguageFeatureRow>(
        'copilot_metrics_by_language_feature',
      )
        .insert(chunk)
        .onConflict([
          'day',
          'metrics_type',
          'entity_id',
          'team_slug',
          'language',
          'feature',
        ])
        .ignore();
    });
  }

  async insertByModelFeature(
    rows: V2MetricsByModelFeatureRow[],
  ): Promise<void> {
    if (!rows.length) return;
    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2MetricsByModelFeatureRow>(
        'copilot_metrics_by_model_feature',
      )
        .insert(chunk)
        .onConflict([
          'day',
          'metrics_type',
          'entity_id',
          'team_slug',
          'model_id',
          'feature',
        ])
        .ignore();
    });
  }

  async insertByLanguageModel(
    rows: V2MetricsByLanguageModelRow[],
  ): Promise<void> {
    if (!rows.length) return;
    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2MetricsByLanguageModelRow>(
        'copilot_metrics_by_language_model',
      )
        .insert(chunk)
        .onConflict([
          'day',
          'metrics_type',
          'entity_id',
          'team_slug',
          'language',
          'model_id',
        ])
        .ignore();
    });
  }

  async insertByCli(rows: V2MetricsByCliRow[]): Promise<void> {
    if (!rows.length) return;
    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2MetricsByCliRow>('copilot_metrics_by_cli')
        .insert(chunk)
        .onConflict(['day', 'metrics_type', 'entity_id', 'team_slug'])
        .ignore();
    });
  }

  async insertUserMetrics(rows: V2UserMetricRow[]): Promise<void> {
    if (!rows.length) {
      return;
    }

    await batchInsertInChunks(rows, 100, async chunk => {
      await this.db<V2UserMetricRow>('copilot_user_metrics')
        .insert(chunk)
        .onConflict(['day', 'metrics_type', 'entity_id', 'user_id'])
        .ignore();
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

  async upsertIngestionLog(row: V2IngestionLogRow): Promise<void> {
    await this.db<V2IngestionLogRow>('copilot_ingestion_log')
      .insert(row)
      .onConflict(['day', 'metrics_type', 'entity_id'])
      .merge();
  }

  async getMissingDays(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    requiredComponents: string[] = ['totals'],
  ): Promise<string[]> {
    const successfulRows = await this.db('copilot_ingestion_log')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .where('status', 'success')
      .whereBetween('day', [from, to])
      .select('day', 'components_loaded');

    const successfulDays = new Set(
      successfulRows
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
      if (day && !successfulDays.has(day)) {
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

    return query.orderBy('day', 'asc').select('*');
  }

  async getDailyTotals(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
  ): Promise<V2DailyTotal[]> {
    const query = this.db<V2DailyTotal>('copilot_daily_totals')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);

    query.where('team_slug', teamSlug ?? '');

    const rows = await query.orderBy('day', 'asc').select('*');

    // Org/enterprise-level rows already carry rolling weekly/monthly active
    // user counts straight from GitHub's report. Team-level rows are derived
    // from daily per-user data and have no rolling windows, so we compute them
    // here from the persisted per-user activity tables.
    if (teamSlug) {
      return this.enrichTeamRollingActiveUsers(
        rows,
        metricsType,
        entityId,
        from,
        to,
        teamSlug,
      );
    }

    return rows;
  }

  /**
   * Enrich team-level daily totals with rolling weekly/monthly active-user
   * counts derived from the persisted per-user activity tables
   * (copilot_user_metrics joined with copilot_user_teams).
   *
   * Definitions follow GitHub's standard rolling windows:
   * - weekly_active_users: distinct active users over the trailing 7 days
   * - monthly_active_users: distinct active users over the trailing 28 days
   * - monthly_active_agent_users / monthly_active_chat_users: distinct users
   *   that used agent/chat over the trailing 28 days
   *
   * A user is "active" for the team on a given day when they have a per-user
   * metrics row that day and a team-membership row for the same day.
   */
  private async enrichTeamRollingActiveUsers(
    rows: V2DailyTotal[],
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug: string,
  ): Promise<V2DailyTotal[]> {
    if (rows.length === 0) {
      return rows;
    }

    const WEEKLY_WINDOW_DAYS = 7;
    const MONTHLY_WINDOW_DAYS = 28;

    // Each emitted row's rolling value is anchored at *that row's own day* and
    // looks backwards (see distinctOverWindow). `fetchLowerBound` only widens
    // the SQL fetch so the earliest days in [from, to] still have a full
    // trailing window available — it is never used as the calculation anchor.
    // The summary cards read the last row (end of range), so they reflect the
    // rolling window ending at the end of the selected range.
    const fetchLowerBound = DateTime.fromISO(from)
      .minus({ days: MONTHLY_WINDOW_DAYS - 1 })
      .toFormat('yyyy-MM-dd');

    const activityRows = await this.db('copilot_user_metrics as m')
      .join('copilot_user_teams as t', function joinOn() {
        this.on('m.day', '=', 't.day')
          .andOn('m.user_id', '=', 't.user_id')
          .andOn('m.metrics_type', '=', 't.metrics_type')
          .andOn('m.entity_id', '=', 't.entity_id');
      })
      .where('m.metrics_type', metricsType)
      .where('m.entity_id', entityId)
      .where('t.team_slug', teamSlug)
      .whereBetween('m.day', [fetchLowerBound, to])
      .select(
        'm.day as day',
        'm.user_id as user_id',
        'm.used_agent as used_agent',
        'm.used_chat as used_chat',
      );

    // Build per-day membership sets so rolling windows can be unioned cheaply.
    const activeByDay = new Map<string, Set<number>>();
    const agentByDay = new Map<string, Set<number>>();
    const chatByDay = new Map<string, Set<number>>();

    for (const row of activityRows as Array<{
      day: string | Date;
      user_id: number;
      used_agent: boolean | number | null;
      used_chat: boolean | number | null;
    }>) {
      const day = this.normalizeDay(row.day);
      if (!day) {
        continue;
      }
      const userId = Number(row.user_id);

      if (!activeByDay.has(day)) activeByDay.set(day, new Set<number>());
      activeByDay.get(day)!.add(userId);

      if (row.used_agent) {
        if (!agentByDay.has(day)) agentByDay.set(day, new Set<number>());
        agentByDay.get(day)!.add(userId);
      }
      if (row.used_chat) {
        if (!chatByDay.has(day)) chatByDay.set(day, new Set<number>());
        chatByDay.get(day)!.add(userId);
      }
    }

    const distinctOverWindow = (
      byDay: Map<string, Set<number>>,
      endDay: string,
      windowDays: number,
    ): number => {
      const start = DateTime.fromISO(endDay).minus({ days: windowDays - 1 });
      const users = new Set<number>();
      for (const [day, set] of byDay) {
        const d = DateTime.fromISO(day);
        if (d >= start && d <= DateTime.fromISO(endDay)) {
          for (const userId of set) users.add(userId);
        }
      }
      return users.size;
    };

    return rows.map(row => {
      const day = this.normalizeDay(row.day);
      if (!day) {
        return row;
      }

      return {
        ...row,
        weekly_active_users: distinctOverWindow(
          activeByDay,
          day,
          WEEKLY_WINDOW_DAYS,
        ),
        monthly_active_users: distinctOverWindow(
          activeByDay,
          day,
          MONTHLY_WINDOW_DAYS,
        ),
        monthly_active_agent_users: distinctOverWindow(
          agentByDay,
          day,
          MONTHLY_WINDOW_DAYS,
        ),
        monthly_active_chat_users: distinctOverWindow(
          chatByDay,
          day,
          MONTHLY_WINDOW_DAYS,
        ),
      };
    });
  }

  async getPrMetrics(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
  ): Promise<V2PrMetricsRow[]> {
    const query = this.db<V2PrMetricsRow>('copilot_pr_metrics')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);

    query.where('team_slug', teamSlug ?? '');

    return query.orderBy('day', 'asc').select('*');
  }

  async getByFeature(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
  ): Promise<V2MetricsByFeatureRow[]> {
    const query = this.db<V2MetricsByFeatureRow>('copilot_metrics_by_feature')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);

    query.where('team_slug', teamSlug ?? '');

    return query.orderBy('day', 'asc').select('*');
  }

  async getByIde(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
  ): Promise<V2MetricsByIdeRow[]> {
    const query = this.db<V2MetricsByIdeRow>('copilot_metrics_by_ide')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);

    query.where('team_slug', teamSlug ?? '');

    return query.orderBy('day', 'asc').select('*');
  }

  async getByLanguageFeature(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
    feature?: string,
  ): Promise<V2MetricsByLanguageFeatureRow[]> {
    const query = this.db<V2MetricsByLanguageFeatureRow>(
      'copilot_metrics_by_language_feature',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);

    query.where('team_slug', teamSlug ?? '');

    if (feature !== undefined) {
      query.where('feature', feature);
    }

    return query.orderBy('day', 'asc').select('*');
  }

  async getByModelFeature(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
  ): Promise<V2MetricsByModelFeatureRow[]> {
    const query = this.db<V2MetricsByModelFeatureRow>(
      'copilot_metrics_by_model_feature',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);
    query.where('team_slug', teamSlug ?? '');
    return query.orderBy('day', 'asc').select('*');
  }

  async getByLanguageModel(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
  ): Promise<V2MetricsByLanguageModelRow[]> {
    const query = this.db<V2MetricsByLanguageModelRow>(
      'copilot_metrics_by_language_model',
    )
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereBetween('day', [from, to]);
    query.where('team_slug', teamSlug ?? '');
    return query.orderBy('day', 'asc').select('*');
  }

  async getDashboardData(
    metricsType: MetricsScope,
    entityId: string,
    from: string,
    to: string,
    teamSlug?: string,
  ): Promise<V2DashboardData> {
    const [
      daily,
      byFeature,
      byLanguage,
      byModelFeature,
      byLanguageModel,
      prMetrics,
    ] = await Promise.all([
      this.getDailyTotals(metricsType, entityId, from, to, teamSlug),
      this.getByFeature(metricsType, entityId, from, to, teamSlug),
      this.getByLanguageFeature(metricsType, entityId, from, to, teamSlug),
      this.getByModelFeature(metricsType, entityId, from, to, teamSlug),
      this.getByLanguageModel(metricsType, entityId, from, to, teamSlug),
      this.getPrMetrics(metricsType, entityId, from, to, teamSlug),
    ]);

    return {
      daily,
      byFeature,
      byLanguage,
      byModelFeature,
      byLanguageModel,
      prMetrics,
    };
  }

  async getTeams(
    metricsType: MetricsScope,
    entityId: string,
    from?: string,
    to?: string,
    minMembers: number = 5,
  ): Promise<string[]> {
    const query = this.db('copilot_user_teams')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
      .whereNot('team_slug', '');

    if (from && to) {
      query.whereBetween('day', [from, to]);
    } else if (from) {
      query.where('day', '>=', from);
    } else if (to) {
      query.where('day', '<=', to);
    }

    const rows = await query
      .groupBy('team_slug')
      .havingRaw('COUNT(DISTINCT ??) >= ?', ['user_id', minMembers])
      .orderBy('team_slug', 'asc')
      .select('team_slug');

    return rows.map(row => row.team_slug);
  }

  async getPeriodRange(
    metricsType: MetricsScope,
    entityId: string,
  ): Promise<PeriodRange | null> {
    const row = await this.db('copilot_daily_totals')
      .where('metrics_type', metricsType)
      .where('entity_id', entityId)
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

  private hasRequiredComponents(
    value: unknown,
    requiredComponents: string[],
  ): boolean {
    const loadedComponents = new Set(this.parseComponentsLoaded(value));
    return requiredComponents.every(component =>
      loadedComponents.has(component),
    );
  }

  private parseComponentsLoaded(value: unknown): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.filter(
        (entry): entry is string => typeof entry === 'string',
      );
    }

    if (typeof value !== 'string') {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((entry): entry is string => typeof entry === 'string')
        : [];
    } catch {
      return [];
    }
  }
}
