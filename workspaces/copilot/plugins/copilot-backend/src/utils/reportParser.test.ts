/*
 * Copyright 2026 The Backstage Authors
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
  parseEnterpriseDocument,
  parseOrganizationDocument,
  parseUserDocument,
  parseUserTeamsDocument,
} from './reportParser';

describe('reportParser', () => {
  describe('parseEnterpriseDocument', () => {
    it('parses valid single-enterprise single-day document', () => {
      const doc = [
        {
          enterprise_id: '1',
          report_start_day: '2025-09-04',
          report_end_day: '2025-10-01',
          day_totals: [
            {
              day: '2025-10-01',
              enterprise_id: '1',
              daily_active_users: 2,
              weekly_active_users: 3,
              monthly_active_users: 4,
              daily_active_cli_users: 5,
              monthly_active_agent_users: 6,
              monthly_active_chat_users: 7,
              code_acceptance_activity_count: 8,
              code_generation_activity_count: 9,
              loc_added_sum: 10,
              loc_deleted_sum: 11,
              loc_suggested_to_add_sum: 12,
              loc_suggested_to_delete_sum: 13,
              user_initiated_interaction_count: 14,
              pull_requests: {
                total_created: 1,
                total_merged: 2,
                total_reviewed: 3,
                total_created_by_copilot: 4,
                total_merged_created_by_copilot: 5,
                total_merged_reviewed_by_copilot: 6,
                total_reviewed_by_copilot: 7,
                total_suggestions: 8,
                total_applied_suggestions: 9,
                total_copilot_suggestions: 10,
                total_copilot_applied_suggestions: 11,
                median_minutes_to_merge: 12.5,
                median_minutes_to_merge_copilot_authored: 13.5,
                median_minutes_to_merge_copilot_reviewed: 14.5,
              },
              totals_by_feature: [
                {
                  feature: 'code_completion',
                  code_acceptance_activity_count: 1,
                  code_generation_activity_count: 2,
                  loc_added_sum: 3,
                  loc_deleted_sum: 4,
                  loc_suggested_to_add_sum: 5,
                  loc_suggested_to_delete_sum: 6,
                  user_initiated_interaction_count: 7,
                },
              ],
              totals_by_ide: [
                {
                  ide: 'vscode',
                  code_acceptance_activity_count: 1,
                  code_generation_activity_count: 2,
                  loc_added_sum: 3,
                  loc_deleted_sum: 4,
                  loc_suggested_to_add_sum: 5,
                  loc_suggested_to_delete_sum: 6,
                  user_initiated_interaction_count: 7,
                },
              ],
              totals_by_language_feature: [
                {
                  language: 'typescript',
                  feature: 'code_completion',
                  code_acceptance_activity_count: 1,
                  code_generation_activity_count: 2,
                  loc_added_sum: 3,
                  loc_deleted_sum: 4,
                  loc_suggested_to_add_sum: 5,
                  loc_suggested_to_delete_sum: 6,
                },
              ],
            },
          ],
        },
      ];

      const result = parseEnterpriseDocument(doc, 'enterprise', 'ent-1');

      expect(result.dailyTotals).toHaveLength(1);
      expect(result.dailyTotals[0]).toEqual(
        expect.objectContaining({
          day: '2025-10-01',
          metrics_type: 'enterprise',
          entity_id: 'ent-1',
          team_slug: '',
          daily_active_users: 2,
          user_initiated_interaction_count: 14,
        }),
      );

      expect(result.prMetrics).toHaveLength(1);
      expect(result.prMetrics[0]).toEqual(
        expect.objectContaining({
          day: '2025-10-01',
          metrics_type: 'enterprise',
          entity_id: 'ent-1',
          team_slug: '',
          total_created: 1,
          total_copilot_applied_suggestions: 11,
        }),
      );

      expect(result.byFeature).toEqual([
        expect.objectContaining({
          day: '2025-10-01',
          metrics_type: 'enterprise',
          entity_id: 'ent-1',
          team_slug: '',
          feature: 'code_completion',
          user_initiated_interaction_count: 7,
        }),
      ]);

      expect(result.byIde).toEqual([
        expect.objectContaining({
          ide: 'vscode',
          team_slug: '',
        }),
      ]);

      expect(result.byLanguageFeature).toEqual([
        expect.objectContaining({
          language: 'typescript',
          feature: 'code_completion',
          team_slug: '',
        }),
      ]);
    });

    it('returns empty structure for invalid input', () => {
      expect(() =>
        parseEnterpriseDocument({ not: 'array' }, 'enterprise', 'ent-1'),
      ).not.toThrow();
      expect(
        parseEnterpriseDocument({ not: 'array' }, 'enterprise', 'ent-1'),
      ).toEqual({
        dailyTotals: [],
        prMetrics: [],
        byFeature: [],
        byIde: [],
        byLanguageFeature: [],
        byModelFeature: [],
        byLanguageModel: [],
        byCli: [],
      });
    });

    it('returns empty structure for empty array', () => {
      const result = parseEnterpriseDocument([], 'organization', 'org-1');
      expect(result).toEqual({
        dailyTotals: [],
        prMetrics: [],
        byFeature: [],
        byIde: [],
        byLanguageFeature: [],
        byModelFeature: [],
        byLanguageModel: [],
        byCli: [],
      });
    });

    it('handles missing optional fields gracefully', () => {
      const doc = [
        {
          enterprise_id: '1',
          report_start_day: '2025-09-04',
          report_end_day: '2025-10-01',
          day_totals: [
            {
              day: '2025-10-01',
              daily_active_users: 1,
              weekly_active_users: 2,
              monthly_active_users: 3,
              code_acceptance_activity_count: 4,
              code_generation_activity_count: 5,
              loc_added_sum: 6,
              loc_deleted_sum: 7,
              loc_suggested_to_add_sum: 8,
              loc_suggested_to_delete_sum: 9,
              user_initiated_interaction_count: 10,
            },
          ],
        },
      ];

      const result = parseEnterpriseDocument(doc, 'organization', 'org-1');

      expect(result.dailyTotals).toHaveLength(1);
      expect(result.prMetrics).toEqual([]);
      expect(result.byFeature).toEqual([]);
      expect(result.byIde).toEqual([]);
      expect(result.byLanguageFeature).toEqual([]);
    });
  });

  describe('parseOrganizationDocument', () => {
    it('parses a single flat org document object with LOC from IDE rows', () => {
      const doc = {
        day: '2026-06-01',
        organization_id: '123',
        enterprise_id: '1',
        daily_active_users: 4,
        weekly_active_users: 5,
        monthly_active_users: 4,
        daily_active_cli_users: 1,
        monthly_active_agent_users: 3,
        monthly_active_chat_users: 3,
        user_initiated_interaction_count: 104,
        code_generation_activity_count: 236,
        code_acceptance_activity_count: 26,
        totals_by_ide: [
          {
            ide: 'vscode',
            user_initiated_interaction_count: 93,
            code_generation_activity_count: 232,
            code_acceptance_activity_count: 22,
            loc_suggested_to_add_sum: 1002,
            loc_suggested_to_delete_sum: 0,
            loc_added_sum: 1763,
            loc_deleted_sum: 1253,
          },
        ],
        totals_by_feature: [
          {
            feature: 'chat_panel_agent_mode',
            user_initiated_interaction_count: 91,
            code_generation_activity_count: 21,
            code_acceptance_activity_count: 4,
            loc_suggested_to_add_sum: 513,
            loc_suggested_to_delete_sum: 0,
            loc_added_sum: 225,
            loc_deleted_sum: 0,
          },
        ],
        totals_by_language_feature: [
          {
            language: 'typescript',
            feature: 'code_completion',
            user_initiated_interaction_count: 0,
            code_generation_activity_count: 96,
            code_acceptance_activity_count: 18,
            loc_suggested_to_add_sum: 108,
            loc_suggested_to_delete_sum: 0,
            loc_added_sum: 22,
            loc_deleted_sum: 0,
          },
        ],
      };

      const result = parseOrganizationDocument(doc, 'organization', 'org-1');

      expect(result.dailyTotals).toHaveLength(1);
      expect(result.dailyTotals[0]).toEqual(
        expect.objectContaining({
          day: '2026-06-01',
          metrics_type: 'organization',
          entity_id: 'org-1',
          team_slug: '',
          daily_active_users: 4,
          weekly_active_users: 5,
          monthly_active_users: 4,
          user_initiated_interaction_count: 104,
          // LOC summed from IDE rows
          loc_added_sum: 1763,
          loc_deleted_sum: 1253,
          loc_suggested_to_add_sum: 1002,
          loc_suggested_to_delete_sum: 0,
        }),
      );

      expect(result.prMetrics).toHaveLength(0);

      expect(result.byIde).toHaveLength(1);
      expect(result.byIde[0]).toEqual(
        expect.objectContaining({
          ide: 'vscode',
          day: '2026-06-01',
          metrics_type: 'organization',
          entity_id: 'org-1',
          team_slug: '',
          loc_added_sum: 1763,
        }),
      );

      expect(result.byFeature).toHaveLength(1);
      expect(result.byFeature[0]).toEqual(
        expect.objectContaining({
          feature: 'chat_panel_agent_mode',
          day: '2026-06-01',
          metrics_type: 'organization',
          entity_id: 'org-1',
        }),
      );

      expect(result.byLanguageFeature).toHaveLength(1);
      expect(result.byLanguageFeature[0]).toEqual(
        expect.objectContaining({
          language: 'typescript',
          feature: 'code_completion',
          day: '2026-06-01',
          metrics_type: 'organization',
          entity_id: 'org-1',
        }),
      );
    });

    it('uses top-level LOC fields when they are present', () => {
      const doc = {
        day: '2026-06-01',
        organization_id: '123',
        daily_active_users: 2,
        weekly_active_users: 3,
        monthly_active_users: 2,
        daily_active_cli_users: 0,
        monthly_active_agent_users: 0,
        monthly_active_chat_users: 0,
        user_initiated_interaction_count: 10,
        code_generation_activity_count: 20,
        code_acceptance_activity_count: 5,
        loc_added_sum: 100,
        loc_deleted_sum: 50,
        loc_suggested_to_add_sum: 200,
        loc_suggested_to_delete_sum: 10,
        totals_by_ide: [
          {
            ide: 'vscode',
            code_generation_activity_count: 20,
            code_acceptance_activity_count: 5,
            user_initiated_interaction_count: 10,
            loc_suggested_to_add_sum: 9999,
            loc_suggested_to_delete_sum: 9999,
            loc_added_sum: 9999,
            loc_deleted_sum: 9999,
          },
        ],
      };

      const result = parseOrganizationDocument(doc, 'organization', 'org-2');

      expect(result.dailyTotals[0]).toEqual(
        expect.objectContaining({
          loc_added_sum: 100,
          loc_deleted_sum: 50,
          loc_suggested_to_add_sum: 200,
          loc_suggested_to_delete_sum: 10,
        }),
      );
    });

    it('handles array input (multiple org docs)', () => {
      const doc = [
        {
          day: '2026-06-01',
          organization_id: '123',
          daily_active_users: 1,
          weekly_active_users: 1,
          monthly_active_users: 1,
          daily_active_cli_users: 0,
          monthly_active_agent_users: 0,
          monthly_active_chat_users: 0,
          user_initiated_interaction_count: 5,
          code_generation_activity_count: 10,
          code_acceptance_activity_count: 2,
        },
        {
          day: '2026-06-02',
          organization_id: '123',
          daily_active_users: 2,
          weekly_active_users: 2,
          monthly_active_users: 2,
          daily_active_cli_users: 0,
          monthly_active_agent_users: 0,
          monthly_active_chat_users: 0,
          user_initiated_interaction_count: 8,
          code_generation_activity_count: 15,
          code_acceptance_activity_count: 3,
        },
      ];

      const result = parseOrganizationDocument(doc, 'organization', 'org-3');
      expect(result.dailyTotals).toHaveLength(2);
      expect(result.dailyTotals[0].day).toBe('2026-06-01');
      expect(result.dailyTotals[1].day).toBe('2026-06-02');
    });

    it('returns empty structure for invalid input', () => {
      expect(() =>
        parseOrganizationDocument('invalid', 'organization', 'org-1'),
      ).not.toThrow();
      expect(
        parseOrganizationDocument('invalid', 'organization', 'org-1'),
      ).toEqual({
        dailyTotals: [],
        prMetrics: [],
        byFeature: [],
        byIde: [],
        byLanguageFeature: [],
        byModelFeature: [],
        byLanguageModel: [],
        byCli: [],
      });
    });

    it('skips entries with missing day field', () => {
      const doc = [{ organization_id: '123', daily_active_users: 5 }];
      const result = parseOrganizationDocument(doc, 'organization', 'org-1');
      expect(result.dailyTotals).toHaveLength(0);
    });
  });

  describe('parseUserDocument', () => {
    it('parses valid user metrics array', () => {
      const doc = [
        {
          user_id: 1,
          user_login: 'octocat',
          day: '2025-10-01',
          enterprise_id: '1',
          used_agent: false,
          used_chat: true,
          used_cli: true,
          code_acceptance_activity_count: 11,
          code_generation_activity_count: 12,
          loc_added_sum: 13,
          loc_deleted_sum: 14,
          loc_suggested_to_add_sum: 15,
          loc_suggested_to_delete_sum: 16,
          user_initiated_interaction_count: 17,
        },
      ];

      const result = parseUserDocument(doc, 'enterprise', 'ent-1');

      expect(result.userMetrics).toEqual([
        {
          day: '2025-10-01',
          metrics_type: 'enterprise',
          entity_id: 'ent-1',
          user_id: 1,
          user_login: 'octocat',
          used_agent: false,
          used_chat: true,
          used_cli: true,
          code_acceptance_activity_count: 11,
          code_generation_activity_count: 12,
          loc_added_sum: 13,
          loc_deleted_sum: 14,
          loc_suggested_to_add_sum: 15,
          loc_suggested_to_delete_sum: 16,
          user_initiated_interaction_count: 17,
        },
      ]);
      expect(result.userBreakdowns).toHaveLength(1);
      expect(result.userBreakdowns[0].user_id).toBe(1);
      expect(result.userBreakdowns[0].byFeature).toEqual([]);
      expect(result.userBreakdowns[0].byIde).toEqual([]);
    });

    it('parses breakdown sub-arrays from user metrics', () => {
      const doc = [
        {
          user_id: 2,
          user_login: 'dev',
          day: '2025-10-01',
          used_agent: true,
          used_chat: true,
          used_cli: false,
          code_acceptance_activity_count: 5,
          code_generation_activity_count: 10,
          loc_added_sum: 100,
          loc_deleted_sum: 20,
          loc_suggested_to_add_sum: 110,
          loc_suggested_to_delete_sum: 22,
          user_initiated_interaction_count: 8,
          totals_by_feature: [
            {
              feature: 'code_completion',
              user_initiated_interaction_count: 3,
              code_generation_activity_count: 9,
              code_acceptance_activity_count: 4,
              loc_added_sum: 80,
              loc_deleted_sum: 15,
              loc_suggested_to_add_sum: 90,
              loc_suggested_to_delete_sum: 17,
            },
          ],
          totals_by_ide: [
            {
              ide: 'vscode',
              user_initiated_interaction_count: 8,
              code_generation_activity_count: 10,
              code_acceptance_activity_count: 5,
              loc_added_sum: 100,
              loc_deleted_sum: 20,
              loc_suggested_to_add_sum: 110,
              loc_suggested_to_delete_sum: 22,
            },
          ],
          totals_by_model_feature: [
            {
              model: 'gpt-5',
              feature: 'chat',
              user_initiated_interaction_count: 5,
              loc_added_sum: 50,
            },
          ],
          totals_by_language_model: [
            {
              language: 'typescript',
              model: 'gpt-5',
              code_generation_activity_count: 9,
              code_acceptance_activity_count: 4,
              loc_suggested_to_add_sum: 90,
              loc_suggested_to_delete_sum: 17,
              loc_added_sum: 80,
              loc_deleted_sum: 15,
            },
          ],
        },
      ];

      const result = parseUserDocument(doc, 'enterprise', 'ent-1');
      const bd = result.userBreakdowns[0];

      expect(bd.byFeature).toHaveLength(1);
      expect(bd.byFeature[0].feature).toBe('code_completion');
      expect(bd.byIde).toHaveLength(1);
      expect(bd.byIde[0].ide).toBe('vscode');
      expect(bd.byModelFeature).toHaveLength(1);
      expect(bd.byModelFeature[0].model_id).toBe('gpt-5');
      expect(bd.byModelFeature[0].feature).toBe('chat');
      expect(bd.byLanguageModel).toHaveLength(1);
      expect(bd.byLanguageModel[0].language).toBe('typescript');
      expect(bd.byLanguageModel[0].model_id).toBe('gpt-5');
      expect(bd.byLanguageModel[0].request_count).toBe(9);
    });

    it('returns empty arrays for invalid input', () => {
      expect(() =>
        parseUserDocument({ nope: true }, 'enterprise', 'ent-1'),
      ).not.toThrow();
      const result = parseUserDocument({ nope: true }, 'enterprise', 'ent-1');
      expect(result).toEqual({ userMetrics: [], userBreakdowns: [] });
    });
  });

  describe('parseUserTeamsDocument', () => {
    it('parses valid user-team join data', () => {
      const doc = [
        {
          user_id: 1001,
          user_login: 'octocat',
          day: '2026-05-14',
          enterprise_id: '1',
          team_id: 9001,
          slug: 'eng-platform',
        },
      ];

      const result = parseUserTeamsDocument(doc, 'enterprise', 'ent-1');

      expect(result).toEqual([
        {
          day: '2026-05-14',
          metrics_type: 'enterprise',
          entity_id: 'ent-1',
          user_id: 1001,
          user_login: 'octocat',
          team_id: 9001,
          team_slug: 'eng-platform',
        },
      ]);
    });

    it('returns empty array for invalid input', () => {
      expect(() =>
        parseUserTeamsDocument('invalid', 'organization', 'org-1'),
      ).not.toThrow();
      expect(
        parseUserTeamsDocument('invalid', 'organization', 'org-1'),
      ).toEqual([]);
    });
  });
});
