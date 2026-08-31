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
  V2UserMetricRow,
  V2UserTeamRow,
} from '@backstage-community/plugin-copilot-common';
import { aggregateTeamMetrics } from './teamAggregator';

describe('aggregateTeamMetrics', () => {
  const day = '2026-05-14';
  const metricsType = 'enterprise' as const;
  const entityId = 'ent-1';

  it('aggregates a single team with multiple users', () => {
    const userMetrics: V2UserMetricRow[] = [
      makeUserMetric({ user_id: 1, loc_added_sum: 10, loc_deleted_sum: 4 }),
      makeUserMetric({ user_id: 2, loc_added_sum: 20, loc_deleted_sum: 6 }),
    ];
    const userTeams: V2UserTeamRow[] = [
      makeUserTeam({ user_id: 1, team_slug: 'platform' }),
      makeUserTeam({ user_id: 2, team_slug: 'platform' }),
    ];

    const result = aggregateTeamMetrics(
      userMetrics,
      userTeams,
      [],
      day,
      metricsType,
      entityId,
    );

    expect(result.dailyTotals).toEqual([
      expect.objectContaining({
        team_slug: 'platform',
        daily_active_users: 2,
        loc_added_sum: 30,
        loc_deleted_sum: 10,
      }),
    ]);
    expect(result.byFeature).toEqual([]);
    expect(result.byIde).toEqual([]);
    expect(result.byLanguageFeature).toEqual([]);
    expect(result.byModelFeature).toEqual([]);
    expect(result.byLanguageModel).toEqual([]);
  });

  it('counts user in multiple teams', () => {
    const userMetrics: V2UserMetricRow[] = [
      makeUserMetric({ user_id: 1, loc_added_sum: 7 }),
    ];
    const userTeams: V2UserTeamRow[] = [
      makeUserTeam({ user_id: 1, team_slug: 'team-a' }),
      makeUserTeam({ user_id: 1, team_slug: 'team-b' }),
    ];

    const result = aggregateTeamMetrics(
      userMetrics,
      userTeams,
      [],
      day,
      metricsType,
      entityId,
    );

    expect(result.dailyTotals).toHaveLength(2);
    expect(result.dailyTotals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          team_slug: 'team-a',
          daily_active_users: 1,
          loc_added_sum: 7,
        }),
        expect.objectContaining({
          team_slug: 'team-b',
          daily_active_users: 1,
          loc_added_sum: 7,
        }),
      ]),
    );
  });

  it('does not include users that are not in any team', () => {
    const userMetrics: V2UserMetricRow[] = [
      makeUserMetric({ user_id: 1, loc_added_sum: 10 }),
      makeUserMetric({ user_id: 2, loc_added_sum: 50 }),
    ];
    const userTeams: V2UserTeamRow[] = [
      makeUserTeam({ user_id: 1, team_slug: 'platform' }),
    ];

    const result = aggregateTeamMetrics(
      userMetrics,
      userTeams,
      [],
      day,
      metricsType,
      entityId,
    );

    expect(result.dailyTotals).toHaveLength(1);
    expect(result.dailyTotals[0]).toEqual(
      expect.objectContaining({
        team_slug: 'platform',
        daily_active_users: 1,
        loc_added_sum: 10,
      }),
    );
  });

  it('returns empty aggregates when userMetrics is empty', () => {
    const result = aggregateTeamMetrics(
      [],
      [makeUserTeam({ user_id: 1 })],
      [],
      day,
      metricsType,
      entityId,
    );

    expect(result).toEqual({
      dailyTotals: [],
      byFeature: [],
      byIde: [],
      byLanguageFeature: [],
      byModelFeature: [],
      byLanguageModel: [],
    });
  });

  it('filters userTeams by day', () => {
    const userMetrics: V2UserMetricRow[] = [
      makeUserMetric({ user_id: 1, loc_added_sum: 20 }),
    ];
    const userTeams: V2UserTeamRow[] = [
      makeUserTeam({ user_id: 1, team_slug: 'platform', day: '2026-05-13' }),
      makeUserTeam({ user_id: 1, team_slug: 'security', day: '2026-05-14' }),
    ];

    const result = aggregateTeamMetrics(
      userMetrics,
      userTeams,
      [],
      day,
      metricsType,
      entityId,
    );

    expect(result.dailyTotals).toHaveLength(1);
    expect(result.dailyTotals[0]).toEqual(
      expect.objectContaining({
        team_slug: 'security',
        loc_added_sum: 20,
      }),
    );
  });
});

function makeUserMetric(
  overrides: Partial<V2UserMetricRow> = {},
): V2UserMetricRow {
  return {
    day: '2026-05-14',
    metrics_type: 'enterprise',
    entity_id: 'ent-1',
    user_id: 1,
    user_login: 'octocat',
    used_agent: false,
    used_chat: false,
    used_cli: true,
    code_acceptance_activity_count: 1,
    code_generation_activity_count: 2,
    loc_added_sum: 10,
    loc_deleted_sum: 3,
    loc_suggested_to_add_sum: 12,
    loc_suggested_to_delete_sum: 4,
    user_initiated_interaction_count: 5,
    ...overrides,
  };
}

function makeUserTeam(overrides: Partial<V2UserTeamRow> = {}): V2UserTeamRow {
  return {
    day: '2026-05-14',
    metrics_type: 'enterprise',
    entity_id: 'ent-1',
    user_id: 1,
    user_login: 'octocat',
    team_id: 100,
    team_slug: 'platform',
    ...overrides,
  };
}
