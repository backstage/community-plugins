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
import { RiskLevel as RiskIcon } from '../assets/RiskIcon';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { SxProps, Theme } from '@mui/material/styles';

export type RiskLevelValue =
  | 'High'
  | 'Medium'
  | 'Low'
  | 'Critical'
  | 'AutoIgnored';

export interface ColorMapping {
  [key: string]: string;
}

export interface RiskLevelProps {
  /**
   * The risk level value to display
   */
  level: string;

  /**
   * Color mapping object where keys are risk levels and values are colors
   * Example: { 'High': '#f44336', 'Medium': '#ff9800', 'Low': '#4caf50' }
   */
  colorMapping?: ColorMapping;

  /**
   * Default color to use if level is not found in colorMapping
   */
  defaultColor?: string;

  /**
   * Size of the icon
   */
  iconSize?: 'small' | 'medium' | 'large';

  /**
   * Whether to show the text label alongside the icon
   */
  showLabel?: boolean;

  /**
   * Custom styles for the container
   */
  sx?: SxProps<Theme>;

  /**
   * Custom styles for the icon
   */
  iconSx?: SxProps<Theme>;

  /**
   * Custom styles for the text
   */
  textSx?: SxProps<Theme>;
}

/**
 * RiskLevel component that displays a custom RiskIcon with customizable colors
 *
 * @example
 * // Basic usage with color mapping
 * <RiskLevel
 *   level="High"
 *   colorMapping={{ 'High': '#f44336', 'Medium': '#ff9800', 'Low': '#4caf50' }}
 * />
 *
 * @example
 * // With label and custom styling
 * <RiskLevel
 *   level="Critical"
 *   colorMapping={riskColorMapping}
 *   showLabel={true}
 *   iconSize="large"
 * />
 */
export const RiskLevel = ({
  level,
  colorMapping,
  defaultColor = '#757575',
  iconSize = 'medium',
  showLabel = false,
  sx,
  iconSx,
  textSx,
}: RiskLevelProps) => {
  // Determine the color based on mapping
  const getRiskColor = (): string => {
    if (!colorMapping) {
      return defaultColor;
    }

    const mappedColor = colorMapping[level];
    return mappedColor || defaultColor;
  };

  const riskColor = getRiskColor();

  // Icon size mapping for custom SVG
  const iconSizeMap = {
    small: { width: 16, height: 16 },
    medium: { width: 20, height: 20 },
    large: { width: 24, height: 24 },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: showLabel ? 1 : 0,
        ...sx,
      }}
    >
      <Box
        sx={{
          color: riskColor,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...iconSizeMap[iconSize],
          ...iconSx,
        }}
      >
        {level === 'AutoIgnored' ? (
          <VisibilityOffIcon sx={{ fontSize: iconSizeMap[iconSize].width }} />
        ) : (
          <RiskIcon />
        )}
      </Box>
      {showLabel && (
        <Typography
          variant="body2"
          sx={{
            color: riskColor,
            fontWeight: 500,
            ...textSx,
          }}
        >
          {level}
        </Typography>
      )}
    </Box>
  );
};

// Common color mappings for risk levels
export const commonRiskColorMappings = {
  standard: {
    Critical: '#bc0e4d', // Dark red
    High: '#f2405e', // Red
    Medium: '#ffa70f', // Orange
    Low: '#ffe366', // Yellow
    AutoIgnored: '#9e9e9e', // Gray
  },
  severity: {
    Critical: '#b71c1c', // Very dark red
    High: '#d32f2f', // Dark red
    Medium: '#f57c00', // Dark orange
    Low: '#388e3c', // Dark green
    AutoIgnored: '#757575', // Dark gray
  },
  pastel: {
    Critical: '#ef5350', // Light red
    High: '#ff7043', // Light red-orange
    Medium: '#ffb74d', // Light orange
    Low: '#81c784', // Light green
    AutoIgnored: '#bdbdbd', // Light gray
  },
} as const;

export default RiskLevel;
