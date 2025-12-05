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
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { SimpleTooltip } from '../SimpleTooltip';

interface Contributor {
  email: string;
  name: string;
  reason: string;
}

interface MainContributorsProps {
  contributors: Contributor[];
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string): string => {
  // Generate a consistent color based on the name
  const colors = [
    '#1976d2', // Blue
    '#388e3c', // Green
    '#f57c00', // Orange
    '#7b1fa2', // Purple
    '#c62828', // Red
    '#00796b', // Teal
    '#5d4037', // Brown
    '#455a64', // Blue Grey
  ];

  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

export const MainContributors = ({ contributors }: MainContributorsProps) => {
  // Filter contributors to only show those with "Main contributor" in their reason
  const mainContributors = contributors.filter(
    contributor =>
      contributor.reason &&
      contributor.reason.toLowerCase().includes('main contributor'),
  );

  if (mainContributors.length === 0) {
    return '';
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={0.5}
      height="100%"
      width="100%"
    >
      {mainContributors.map((contributor, index) => (
        <SimpleTooltip
          key={index}
          title={`${contributor.name} ${
            contributor?.email ? `(${contributor.email})` : ''
          }`}
          centered
        >
          <Avatar
            style={{
              backgroundColor: getAvatarColor(contributor.name),
              color: 'white',
              width: 24,
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            {getInitials(contributor.name)}
          </Avatar>
        </SimpleTooltip>
      ))}
    </Box>
  );
};
