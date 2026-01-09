/*
 * Copyright 2025 The Backstage Authors
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
import Box from '@mui/material/Box';
import { ChipsList } from './ChipsList';

interface Team {
  name: string;
  apiiroUrl?: string;
}

interface TeamsDisplayProps {
  /**
   * Array of team objects
   */
  teams: Team[];

  /**
   * Maximum number of teams to show before displaying +N
   */
  maxVisible?: number;

  /**
   * Size of the team chips
   */
  size?: 'small' | 'medium';

  /**
   * Variant of the team chips
   */
  variant?: 'filled' | 'outlined';

  /**
   * Gap between chips
   */
  gap?: number;
}

/**
 * TeamsDisplay component that renders team names as clickable chips
 *
 * @example
 * <TeamsDisplay
 *   teams={[
 *     { name: 'Team A', apiiroUrl: 'https://example.com/team-a' },
 *     { name: 'Team B', apiiroUrl: 'https://example.com/team-b' }
 *   ]}
 *   maxVisible={2}
 * />
 */
export const TeamsDisplay = ({
  teams,
  maxVisible = 1,
  size = 'small',
  variant = 'outlined',
  gap = 0.5,
}: TeamsDisplayProps) => {
  if (!teams || teams.length === 0) {
    return '';
  }

  const teamItems = teams.map(team => ({
    id: team.name,
    label: team.name,
    href: team.apiiroUrl,
    target: '_blank' as const,
    rel: 'noopener noreferrer',
  }));

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <ChipsList
        items={teamItems}
        maxVisible={maxVisible}
        size={size}
        variant={variant}
        gap={gap}
      />
    </Box>
  );
};

export default TeamsDisplay;
