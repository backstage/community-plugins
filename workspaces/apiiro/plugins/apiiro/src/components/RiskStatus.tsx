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
import Typography from '@mui/material/Typography';

// Color mapping for risk statuses
export const riskStatusColorMapping = {
  Open: '#f2405e', // Reddish-pink
  Accepted: '#00d0b3', // Turquoise
  Ignored: '#bdbdbd', // Gray
} as const;

type RiskStatusLevel = keyof typeof riskStatusColorMapping;

interface RiskStatusProps {
  /**
   * The status level to display
   */
  status: RiskStatusLevel;

  /**
   * Show the status label next to the icon
   */
  showLabel?: boolean;

  /**
   * The size of the icon
   */
  iconSize?: 'small' | 'medium' | 'large';
}

/**
 * A component to display a risk status with a colored dot.
 */
export const RiskStatus = ({
  status,
  showLabel = true,
  iconSize = 'medium',
}: RiskStatusProps) => {
  const color = riskStatusColorMapping[status] || '#ccc';

  const sizeMap = {
    small: '8px',
    medium: '10px',
    large: '12px',
  };
  const iconDimensions = sizeMap[iconSize];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          width: iconDimensions,
          height: iconDimensions,
          borderRadius: '50%',
          backgroundColor: color,
          marginRight: showLabel ? '8px' : '0',
        }}
      />
      {showLabel && (
        <Typography
          variant="body2"
          sx={{
            fontSize: 'inherit',
            fontWeight: 'inherit',
            color: 'inherit',
          }}
        >
          {status}
        </Typography>
      )}
    </Box>
  );
};
