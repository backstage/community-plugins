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
import { useTheme, Theme } from '@mui/material/styles';
import { getRiskStatusColors } from '../theme/themeUtils';

/**
 * Creates theme-aware risk status color mappings.
 * Use this function with useTheme() to get colors that work in both light and dark modes.
 */
export const createRiskStatusColorMapping = (theme: Theme) => {
  const statusColors = getRiskStatusColors(theme);
  return {
    Open: statusColors.open,
    Accepted: statusColors.accepted,
    Ignored: statusColors.ignored,
  };
};

interface RiskStatusProps {
  /**
   * The status level to display
   */
  status: string;

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
  const theme = useTheme();
  const themeAwareColors = createRiskStatusColorMapping(theme);
  const color =
    themeAwareColors[status as keyof typeof themeAwareColors] ||
    theme.palette.grey[400];

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
