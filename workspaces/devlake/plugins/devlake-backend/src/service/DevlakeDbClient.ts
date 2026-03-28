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

import mysql from 'mysql2/promise';
import { LoggerService } from '@backstage/backend-plugin-api';
import {
  DoraMetrics,
  DoraMetricsTrend,
  DoraMetricTrendPoint,
  classifyDeploymentFrequency,
  classifyLeadTime,
  classifyChangeFailureRate,
  classifyMeanTimeToRecovery,
} from '@backstage-community/plugin-devlake-common';
import { DevlakeDbConfig } from '../types';

/** @internal */
export class DevlakeDbClient {
  private readonly pool: mysql.Pool;

  constructor(dbConfig: DevlakeDbConfig, _logger: LoggerService) {
    this.pool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
      connectionLimit: 5,
      waitForConnections: true,
    });
  }

  async getDoraMetrics(options: {
    projectName: string | null;
    from: string;
    to: string;
  }): Promise<DoraMetrics> {
    const { projectName, from, to } = options;

    const [df, lt, cfr, mttr] = await Promise.all([
      this.queryDeploymentFrequency(projectName, from, to),
      this.queryLeadTimeForChanges(projectName, from, to),
      this.queryChangeFailureRate(projectName, from, to),
      this.queryMeanTimeToRecovery(projectName, from, to),
    ]);

    return {
      deploymentFrequency: {
        value: df,
        unit: 'deploys/day',
        level: classifyDeploymentFrequency(df),
        trend: 0,
      },
      leadTimeForChanges: {
        value: lt,
        unit: 'hours',
        level: classifyLeadTime(lt),
        trend: 0,
      },
      changeFailureRate: {
        value: cfr,
        unit: '%',
        level: classifyChangeFailureRate(cfr),
        trend: 0,
      },
      meanTimeToRecovery: {
        value: mttr,
        unit: 'hours',
        level: classifyMeanTimeToRecovery(mttr),
        trend: 0,
      },
    };
  }

  async getDoraTrend(options: {
    projectName: string | null;
    from: string;
    to: string;
  }): Promise<DoraMetricsTrend> {
    const { projectName, from, to } = options;

    const [df, lt, cfr, mttr] = await Promise.all([
      this.queryDeploymentFrequencyTrend(projectName, from, to),
      this.queryLeadTimeTrend(projectName, from, to),
      this.queryChangeFailureRateTrend(projectName, from, to),
      this.queryMttrTrend(projectName, from, to),
    ]);

    return {
      deploymentFrequency: df,
      leadTimeForChanges: lt,
      changeFailureRate: cfr,
      meanTimeToRecovery: mttr,
    };
  }

  private async query(sql: string, params: any[]): Promise<any[]> {
    const [rows] = await this.pool.execute(sql, params);
    return rows as any[];
  }

  private pf(projectName: string | null): { cond: string; params: any[] } {
    return projectName
      ? { cond: 'AND pm.project_name = ?', params: [projectName] }
      : { cond: '', params: [] };
  }

  // ── Deployment Frequency ──────────────────────────────────────────────

  private async queryDeploymentFrequency(
    projectName: string | null,
    from: string,
    to: string,
  ): Promise<number> {
    const { cond, params } = this.pf(projectName);
    const rows = await this.query(
      `
      SELECT CASE WHEN DATEDIFF(?, ?) > 0
        THEN COUNT(DISTINCT deployment_id) / DATEDIFF(?, ?)
        ELSE 0 END AS deploys_per_day
      FROM (
        SELECT cdc.cicd_deployment_id AS deployment_id,
               MAX(cdc.finished_date) AS finished
        FROM cicd_deployment_commits cdc
        JOIN project_mapping pm ON cdc.cicd_scope_id = pm.row_id
          AND pm.\`table\` = 'cicd_scopes'
        WHERE cdc.result = 'SUCCESS' ${cond}
        GROUP BY cdc.cicd_deployment_id
        HAVING MAX(cdc.finished_date) BETWEEN ? AND ?
      ) AS deployments
    `,
      [to, from, to, from, ...params, from, to],
    );
    return Math.round(parseFloat(rows[0]?.deploys_per_day ?? '0') * 100) / 100;
  }

  private async queryDeploymentFrequencyTrend(
    projectName: string | null,
    from: string,
    to: string,
  ): Promise<DoraMetricTrendPoint[]> {
    const { cond, params } = this.pf(projectName);
    const rows = await this.query(
      `
      SELECT DATE_FORMAT(MAX(cdc.finished_date), '%Y-%m-%d') AS date,
             COUNT(DISTINCT cdc.cicd_deployment_id) AS value
      FROM cicd_deployment_commits cdc
      JOIN project_mapping pm ON cdc.cicd_scope_id = pm.row_id
        AND pm.\`table\` = 'cicd_scopes'
      WHERE cdc.result = 'SUCCESS' ${cond}
        AND cdc.finished_date BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(cdc.finished_date, '%Y-%m-%d')
      ORDER BY date
    `,
      [...params, from, to],
    );
    return rows.map((r: any) => ({
      date: r.date,
      value: parseInt(r.value, 10),
    }));
  }

  // ── Lead Time for Changes ─────────────────────────────────────────────

  private async queryLeadTimeForChanges(
    projectName: string | null,
    from: string,
    to: string,
  ): Promise<number> {
    const { cond, params } = this.pf(projectName);
    const rows = await this.query(
      `
      SELECT IFNULL((
        SELECT pr_cycle_time / 60.0
        FROM (
          SELECT DISTINCT ppm.pr_cycle_time,
            @rownum := @rownum + 1 AS row_num,
            @total_rows := @rownum AS total
          FROM pull_requests pr
          JOIN project_pr_metrics ppm ON ppm.id = pr.id
          JOIN project_mapping pm ON pr.base_repo_id = pm.row_id
            AND pm.\`table\` = 'repos'
          CROSS JOIN (SELECT @rownum := 0) r
          WHERE pr.merged_date IS NOT NULL
            AND ppm.pr_cycle_time IS NOT NULL
            AND pr.merged_date BETWEEN ? AND ?
            ${cond}
          ORDER BY ppm.pr_cycle_time
        ) ranked
        WHERE row_num = FLOOR(total / 2) + 1
        LIMIT 1
      ), 0) AS median_lead_time_hours
    `,
      [from, to, ...params],
    );
    return (
      Math.round(parseFloat(rows[0]?.median_lead_time_hours ?? '0') * 10) / 10
    );
  }

  private async queryLeadTimeTrend(
    projectName: string | null,
    from: string,
    to: string,
  ): Promise<DoraMetricTrendPoint[]> {
    const { cond, params } = this.pf(projectName);
    const rows = await this.query(
      `
      SELECT DATE_FORMAT(pr.merged_date, '%Y-%m-%d') AS date,
             IFNULL(AVG(ppm.pr_cycle_time) / 60.0, 0) AS value
      FROM pull_requests pr
      JOIN project_pr_metrics ppm ON ppm.id = pr.id
      JOIN project_mapping pm ON pr.base_repo_id = pm.row_id
        AND pm.\`table\` = 'repos'
      WHERE pr.merged_date IS NOT NULL
        AND ppm.pr_cycle_time IS NOT NULL
        AND pr.merged_date BETWEEN ? AND ?
        ${cond}
      GROUP BY DATE_FORMAT(pr.merged_date, '%Y-%m-%d')
      ORDER BY date
    `,
      [from, to, ...params],
    );
    return rows.map((r: any) => ({
      date: r.date,
      value: Math.round(parseFloat(r.value) * 10) / 10,
    }));
  }

  // ── Change Failure Rate ───────────────────────────────────────────────

  private async queryChangeFailureRate(
    projectName: string | null,
    from: string,
    to: string,
  ): Promise<number> {
    const { cond, params } = this.pf(projectName);
    const rows = await this.query(
      `
      SELECT CASE WHEN COUNT(deployment_id) = 0 THEN 0
        ELSE (SUM(has_incident) / COUNT(deployment_id)) * 100
      END AS change_failure_rate
      FROM (
        SELECT d.deployment_id,
          IF(COUNT(DISTINCT i.id) > 0, 1, 0) AS has_incident
        FROM (
          SELECT cdc.cicd_deployment_id AS deployment_id,
                 MAX(cdc.finished_date) AS finished
          FROM cicd_deployment_commits cdc
          JOIN project_mapping pm ON cdc.cicd_scope_id = pm.row_id
            AND pm.\`table\` = 'cicd_scopes'
          WHERE cdc.result = 'SUCCESS' ${cond}
          GROUP BY cdc.cicd_deployment_id
          HAVING MAX(cdc.finished_date) BETWEEN ? AND ?
        ) d
        LEFT JOIN project_incident_deployment_relationships pim
          ON d.deployment_id = pim.deployment_id
        LEFT JOIN incidents i ON pim.id = i.id
        GROUP BY d.deployment_id
      ) failure_analysis
    `,
      [...params, from, to],
    );
    return (
      Math.round(parseFloat(rows[0]?.change_failure_rate ?? '0') * 10) / 10
    );
  }

  private async queryChangeFailureRateTrend(
    projectName: string | null,
    from: string,
    to: string,
  ): Promise<DoraMetricTrendPoint[]> {
    const { cond, params } = this.pf(projectName);
    const rows = await this.query(
      `
      SELECT date, CASE WHEN COUNT(*) = 0 THEN 0
        ELSE (SUM(has_incident) / COUNT(*)) * 100
      END AS value
      FROM (
        SELECT DATE_FORMAT(MAX(cdc.finished_date), '%Y-%m-%d') AS date,
          cdc.cicd_deployment_id AS deployment_id,
          IF(COUNT(DISTINCT i.id) > 0, 1, 0) AS has_incident
        FROM cicd_deployment_commits cdc
        JOIN project_mapping pm ON cdc.cicd_scope_id = pm.row_id
          AND pm.\`table\` = 'cicd_scopes'
        LEFT JOIN project_incident_deployment_relationships pim
          ON cdc.cicd_deployment_id = pim.deployment_id
        LEFT JOIN incidents i ON pim.id = i.id
        WHERE cdc.result = 'SUCCESS' ${cond}
          AND cdc.finished_date BETWEEN ? AND ?
        GROUP BY cdc.cicd_deployment_id
      ) daily_failures
      GROUP BY date ORDER BY date
    `,
      [...params, from, to],
    );
    return rows.map((r: any) => ({
      date: r.date,
      value: Math.round(parseFloat(r.value) * 10) / 10,
    }));
  }

  // ── Mean Time to Recovery ─────────────────────────────────────────────

  private async queryMeanTimeToRecovery(
    projectName: string | null,
    from: string,
    to: string,
  ): Promise<number> {
    const { cond, params } = this.pf(projectName);
    const rows = await this.query(
      `
      SELECT IFNULL((
        SELECT recovery_hours FROM (
          SELECT TIMESTAMPDIFF(SECOND, d.finished, i.resolution_date) / 3600.0
            AS recovery_hours,
            @rownum := @rownum + 1 AS row_num,
            @total_rows := @rownum AS total
          FROM incidents i
          JOIN project_incident_deployment_relationships pim ON i.id = pim.id
          JOIN (
            SELECT cdc.cicd_deployment_id AS deployment_id,
                   MAX(cdc.finished_date) AS finished
            FROM cicd_deployment_commits cdc
            JOIN project_mapping pm ON cdc.cicd_scope_id = pm.row_id
              AND pm.\`table\` = 'cicd_scopes'
            WHERE cdc.result = 'SUCCESS' ${cond}
            GROUP BY cdc.cicd_deployment_id
            HAVING MAX(cdc.finished_date) BETWEEN ? AND ?
          ) d ON pim.deployment_id = d.deployment_id
          CROSS JOIN (SELECT @rownum := 0) r
          WHERE i.resolution_date IS NOT NULL
            AND i.resolution_date BETWEEN ? AND ?
          ORDER BY recovery_hours
        ) ranked
        WHERE row_num = FLOOR(total / 2) + 1 LIMIT 1
      ), 0) AS median_recovery_hours
    `,
      [...params, from, to, from, to],
    );
    return (
      Math.round(parseFloat(rows[0]?.median_recovery_hours ?? '0') * 10) / 10
    );
  }

  private async queryMttrTrend(
    projectName: string | null,
    from: string,
    to: string,
  ): Promise<DoraMetricTrendPoint[]> {
    const { cond, params } = this.pf(projectName);
    const rows = await this.query(
      `
      SELECT DATE_FORMAT(i.resolution_date, '%Y-%m-%d') AS date,
        IFNULL(AVG(TIMESTAMPDIFF(SECOND, d.finished, i.resolution_date) / 3600.0), 0) AS value
      FROM incidents i
      JOIN project_incident_deployment_relationships pim ON i.id = pim.id
      JOIN (
        SELECT cdc.cicd_deployment_id AS deployment_id,
               MAX(cdc.finished_date) AS finished
        FROM cicd_deployment_commits cdc
        JOIN project_mapping pm ON cdc.cicd_scope_id = pm.row_id
          AND pm.\`table\` = 'cicd_scopes'
        WHERE cdc.result = 'SUCCESS' ${cond}
          AND cdc.finished_date BETWEEN ? AND ?
        GROUP BY cdc.cicd_deployment_id
      ) d ON pim.deployment_id = d.deployment_id
      WHERE i.resolution_date IS NOT NULL
        AND i.resolution_date BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(i.resolution_date, '%Y-%m-%d')
      ORDER BY date
    `,
      [...params, from, to, from, to],
    );
    return rows.map((r: any) => ({
      date: r.date,
      value: Math.round(parseFloat(r.value) * 10) / 10,
    }));
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
