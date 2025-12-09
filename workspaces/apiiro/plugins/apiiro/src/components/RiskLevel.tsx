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
import { SxProps, Theme, useTheme } from '@mui/material/styles';
import { getRiskColors } from '../theme/themeUtils';

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
 * />
 *
 * @example
 * // With label and custom styling
 * <RiskLevel
 *   level="Critical"
 *   showLabel={true}
 *   iconSize="large"
 * />
 */

/**
 * Creates theme-aware risk color mappings.
 * Use this function with useTheme() to get colors that work in both light and dark modes.
 */
export const createRiskColorMappings = (theme: Theme): ColorMapping => {
  const riskColors = getRiskColors(theme);

  return {
    Critical: riskColors.critical,
    High: riskColors.high,
    Medium: riskColors.medium,
    Low: riskColors.low,
    AutoIgnored: riskColors.autoIgnored,
  };
};

export const RiskLevel = ({
  level,
  defaultColor,
  iconSize = 'medium',
  showLabel = false,
  sx,
  iconSx,
  textSx,
}: RiskLevelProps) => {
  const theme = useTheme();
  const themeDefaultColor = defaultColor ?? theme.palette.grey[500];
  const colorMapping: ColorMapping = createRiskColorMappings(theme);
  // Determine the color based on mapping
  const getRiskColor = (): string => {
    if (!colorMapping) {
      return themeDefaultColor;
    }

    const mappedColor = colorMapping[level];
    return mappedColor || themeDefaultColor;
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

export default RiskLevel;
