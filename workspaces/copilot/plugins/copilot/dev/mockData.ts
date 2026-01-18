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
  Metric,
  EngagementMetrics,
  SeatAnalysis,
} from '@backstage-community/plugin-copilot-common';

// Generate dates for the last 14 days
const generateDates = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const dates = generateDates(14);

// Mock teams
export const mockTeams = ['Platform Team', 'Frontend Team', 'Backend Team'];

// Mock overall metrics (large numbers to demonstrate the scale difference)
export const mockOverallMetrics: Metric[] = dates.map(day => ({
  day,
  type: 'enterprise' as const,
  breakdown: [
    {
      language: 'TypeScript',
      editor: 'vscode',
      suggestions_count: 5000 + Math.floor(Math.random() * 1000),
      acceptances_count: 3500 + Math.floor(Math.random() * 500),
      lines_suggested: 15000 + Math.floor(Math.random() * 3000),
      lines_accepted: 10000 + Math.floor(Math.random() * 2000),
      active_users: 200 + Math.floor(Math.random() * 50),
    },
    {
      language: 'Python',
      editor: 'vscode',
      suggestions_count: 3000 + Math.floor(Math.random() * 500),
      acceptances_count: 2000 + Math.floor(Math.random() * 300),
      lines_suggested: 9000 + Math.floor(Math.random() * 2000),
      lines_accepted: 6000 + Math.floor(Math.random() * 1000),
      active_users: 150 + Math.floor(Math.random() * 30),
    },
    {
      language: 'JavaScript',
      editor: 'vscode',
      suggestions_count: 2500 + Math.floor(Math.random() * 400),
      acceptances_count: 1800 + Math.floor(Math.random() * 200),
      lines_suggested: 7500 + Math.floor(Math.random() * 1500),
      lines_accepted: 5000 + Math.floor(Math.random() * 800),
      active_users: 120 + Math.floor(Math.random() * 25),
    },
    {
      language: 'Go',
      editor: 'vscode',
      suggestions_count: 1500 + Math.floor(Math.random() * 300),
      acceptances_count: 1000 + Math.floor(Math.random() * 150),
      lines_suggested: 4500 + Math.floor(Math.random() * 1000),
      lines_accepted: 3000 + Math.floor(Math.random() * 500),
      active_users: 80 + Math.floor(Math.random() * 20),
    },
    {
      language: 'Java',
      editor: 'intellij',
      suggestions_count: 2000 + Math.floor(Math.random() * 350),
      acceptances_count: 1400 + Math.floor(Math.random() * 200),
      lines_suggested: 6000 + Math.floor(Math.random() * 1200),
      lines_accepted: 4000 + Math.floor(Math.random() * 600),
      active_users: 100 + Math.floor(Math.random() * 25),
    },
  ],
  total_suggestions_count: 14000 + Math.floor(Math.random() * 2000),
  total_acceptances_count: 9700 + Math.floor(Math.random() * 1000),
  total_lines_suggested: 42000 + Math.floor(Math.random() * 8000),
  total_lines_accepted: 28000 + Math.floor(Math.random() * 5000),
  total_active_users: 650 + Math.floor(Math.random() * 100),
  total_chat_turns: 5000 + Math.floor(Math.random() * 1000),
  total_chat_acceptances: 2500 + Math.floor(Math.random() * 500),
  total_active_chat_users: 400 + Math.floor(Math.random() * 80),
}));

// Mock team metrics (smaller numbers to show the scale difference)
export const mockTeamMetrics: Record<string, Metric[]> = {
  'Platform Team': dates.map(day => ({
    day,
    type: 'enterprise' as const,
    team_name: 'Platform Team',
    breakdown: [
      {
        language: 'TypeScript',
        editor: 'vscode',
        suggestions_count: 150 + Math.floor(Math.random() * 30),
        acceptances_count: 100 + Math.floor(Math.random() * 20),
        lines_suggested: 450 + Math.floor(Math.random() * 100),
        lines_accepted: 300 + Math.floor(Math.random() * 60),
        active_users: 8 + Math.floor(Math.random() * 3),
      },
      {
        language: 'Go',
        editor: 'vscode',
        suggestions_count: 100 + Math.floor(Math.random() * 25),
        acceptances_count: 70 + Math.floor(Math.random() * 15),
        lines_suggested: 300 + Math.floor(Math.random() * 80),
        lines_accepted: 200 + Math.floor(Math.random() * 40),
        active_users: 5 + Math.floor(Math.random() * 2),
      },
    ],
    total_suggestions_count: 250 + Math.floor(Math.random() * 50),
    total_acceptances_count: 170 + Math.floor(Math.random() * 30),
    total_lines_suggested: 750 + Math.floor(Math.random() * 150),
    total_lines_accepted: 500 + Math.floor(Math.random() * 100),
    total_active_users: 13 + Math.floor(Math.random() * 5),
    total_chat_turns: 80 + Math.floor(Math.random() * 20),
    total_chat_acceptances: 40 + Math.floor(Math.random() * 10),
    total_active_chat_users: 8 + Math.floor(Math.random() * 3),
  })),
  'Frontend Team': dates.map(day => ({
    day,
    type: 'enterprise' as const,
    team_name: 'Frontend Team',
    breakdown: [
      {
        language: 'TypeScript',
        editor: 'vscode',
        suggestions_count: 200 + Math.floor(Math.random() * 40),
        acceptances_count: 140 + Math.floor(Math.random() * 25),
        lines_suggested: 600 + Math.floor(Math.random() * 120),
        lines_accepted: 400 + Math.floor(Math.random() * 80),
        active_users: 10 + Math.floor(Math.random() * 3),
      },
      {
        language: 'JavaScript',
        editor: 'vscode',
        suggestions_count: 180 + Math.floor(Math.random() * 35),
        acceptances_count: 120 + Math.floor(Math.random() * 20),
        lines_suggested: 540 + Math.floor(Math.random() * 100),
        lines_accepted: 360 + Math.floor(Math.random() * 70),
        active_users: 8 + Math.floor(Math.random() * 2),
      },
    ],
    total_suggestions_count: 380 + Math.floor(Math.random() * 70),
    total_acceptances_count: 260 + Math.floor(Math.random() * 45),
    total_lines_suggested: 1140 + Math.floor(Math.random() * 220),
    total_lines_accepted: 760 + Math.floor(Math.random() * 150),
    total_active_users: 18 + Math.floor(Math.random() * 5),
    total_chat_turns: 120 + Math.floor(Math.random() * 30),
    total_chat_acceptances: 60 + Math.floor(Math.random() * 15),
    total_active_chat_users: 12 + Math.floor(Math.random() * 4),
  })),
  'Backend Team': dates.map(day => ({
    day,
    type: 'enterprise' as const,
    team_name: 'Backend Team',
    breakdown: [
      {
        language: 'Python',
        editor: 'vscode',
        suggestions_count: 180 + Math.floor(Math.random() * 35),
        acceptances_count: 130 + Math.floor(Math.random() * 25),
        lines_suggested: 540 + Math.floor(Math.random() * 110),
        lines_accepted: 390 + Math.floor(Math.random() * 75),
        active_users: 9 + Math.floor(Math.random() * 3),
      },
      {
        language: 'Java',
        editor: 'intellij',
        suggestions_count: 150 + Math.floor(Math.random() * 30),
        acceptances_count: 100 + Math.floor(Math.random() * 20),
        lines_suggested: 450 + Math.floor(Math.random() * 90),
        lines_accepted: 300 + Math.floor(Math.random() * 60),
        active_users: 7 + Math.floor(Math.random() * 2),
      },
    ],
    total_suggestions_count: 330 + Math.floor(Math.random() * 60),
    total_acceptances_count: 230 + Math.floor(Math.random() * 40),
    total_lines_suggested: 990 + Math.floor(Math.random() * 200),
    total_lines_accepted: 690 + Math.floor(Math.random() * 135),
    total_active_users: 16 + Math.floor(Math.random() * 5),
    total_chat_turns: 100 + Math.floor(Math.random() * 25),
    total_chat_acceptances: 50 + Math.floor(Math.random() * 12),
    total_active_chat_users: 10 + Math.floor(Math.random() * 3),
  })),
};

// Mock engagement metrics (overall - large numbers)
export const mockOverallEngagementMetrics: EngagementMetrics[] = dates.map(
  day => ({
    day,
    type: 'enterprise' as const,
    total_active_users: 650 + Math.floor(Math.random() * 100),
    total_engaged_users: 500 + Math.floor(Math.random() * 80),
    ide_completions_engaged_users: 450 + Math.floor(Math.random() * 70),
    ide_chats_engaged_users: 300 + Math.floor(Math.random() * 50),
    dotcom_chats_engaged_users: 200 + Math.floor(Math.random() * 40),
    dotcom_prs_engaged_users: 150 + Math.floor(Math.random() * 30),
  }),
);

// Mock engagement metrics by team (smaller numbers)
export const mockTeamEngagementMetrics: Record<string, EngagementMetrics[]> = {
  'Platform Team': dates.map(day => ({
    day,
    type: 'enterprise' as const,
    team_name: 'Platform Team',
    total_active_users: 13 + Math.floor(Math.random() * 5),
    total_engaged_users: 10 + Math.floor(Math.random() * 3),
    ide_completions_engaged_users: 9 + Math.floor(Math.random() * 3),
    ide_chats_engaged_users: 6 + Math.floor(Math.random() * 2),
    dotcom_chats_engaged_users: 4 + Math.floor(Math.random() * 2),
    dotcom_prs_engaged_users: 3 + Math.floor(Math.random() * 1),
  })),
  'Frontend Team': dates.map(day => ({
    day,
    type: 'enterprise' as const,
    team_name: 'Frontend Team',
    total_active_users: 18 + Math.floor(Math.random() * 5),
    total_engaged_users: 14 + Math.floor(Math.random() * 4),
    ide_completions_engaged_users: 12 + Math.floor(Math.random() * 3),
    ide_chats_engaged_users: 8 + Math.floor(Math.random() * 2),
    dotcom_chats_engaged_users: 5 + Math.floor(Math.random() * 2),
    dotcom_prs_engaged_users: 4 + Math.floor(Math.random() * 2),
  })),
  'Backend Team': dates.map(day => ({
    day,
    type: 'enterprise' as const,
    team_name: 'Backend Team',
    total_active_users: 16 + Math.floor(Math.random() * 5),
    total_engaged_users: 12 + Math.floor(Math.random() * 3),
    ide_completions_engaged_users: 11 + Math.floor(Math.random() * 3),
    ide_chats_engaged_users: 7 + Math.floor(Math.random() * 2),
    dotcom_chats_engaged_users: 4 + Math.floor(Math.random() * 2),
    dotcom_prs_engaged_users: 3 + Math.floor(Math.random() * 1),
  })),
};

// Mock seat analysis (overall - large numbers)
export const mockOverallSeatAnalysis: SeatAnalysis[] = dates.map(day => ({
  day,
  type: 'enterprise' as const,
  total_seats: 800,
  seats_never_used: 100 + Math.floor(Math.random() * 20),
  seats_inactive_7_days: 80 + Math.floor(Math.random() * 15),
  seats_inactive_14_days: 60 + Math.floor(Math.random() * 12),
  seats_inactive_28_days: 40 + Math.floor(Math.random() * 10),
}));

// Mock seat analysis by team (smaller numbers)
export const mockTeamSeatAnalysis: Record<string, SeatAnalysis[]> = {
  'Platform Team': dates.map(day => ({
    day,
    type: 'enterprise' as const,
    team_name: 'Platform Team',
    total_seats: 15,
    seats_never_used: 2 + Math.floor(Math.random() * 1),
    seats_inactive_7_days: 1 + Math.floor(Math.random() * 1),
    seats_inactive_14_days: 1,
    seats_inactive_28_days: 0,
  })),
  'Frontend Team': dates.map(day => ({
    day,
    type: 'enterprise' as const,
    team_name: 'Frontend Team',
    total_seats: 20,
    seats_never_used: 2 + Math.floor(Math.random() * 1),
    seats_inactive_7_days: 2 + Math.floor(Math.random() * 1),
    seats_inactive_14_days: 1 + Math.floor(Math.random() * 1),
    seats_inactive_28_days: 1,
  })),
  'Backend Team': dates.map(day => ({
    day,
    type: 'enterprise' as const,
    team_name: 'Backend Team',
    total_seats: 18,
    seats_never_used: 2 + Math.floor(Math.random() * 1),
    seats_inactive_7_days: 1 + Math.floor(Math.random() * 1),
    seats_inactive_14_days: 1,
    seats_inactive_28_days: 0,
  })),
};
