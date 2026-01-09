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
import MuiChip, { ChipProps as MuiChipProps } from '@mui/material/Chip';
import Link from '@mui/material/Link';
import { SxProps, Theme } from '@mui/material/styles';
import { FONT_FAMILY } from '../theme/fonts';

export type ChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

export type ChipVariant = 'filled' | 'outlined';

export interface ColorMapping {
  [key: string]: ChipColor;
}

export interface ChipProps extends Omit<MuiChipProps, 'color'> {
  /**
   * The content to display in the chip
   */
  label: string;

  /**
   * Color mapping object where keys are values and values are MUI chip colors
   * Example: { 'active': 'success', 'inactive': 'error', 'pending': 'warning' }
   */
  colorMapping?: ColorMapping;

  /**
   * The value to look up in the color mapping
   * If not provided, uses the label
   */
  value?: string;

  /**
   * Default color to use if value is not found in colorMapping
   */
  defaultColor?: ChipColor;

  /**
   * Chip variant
   */
  variant?: ChipVariant;

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;

  /**
   * Size of the chip
   */
  size?: 'small' | 'medium';

  /**
   * Whether the chip is clickable
   */
  clickable?: boolean;

  /**
   * Click handler
   */
  onClick?: MuiChipProps['onClick'];

  /**
   * Delete handler
   */
  onDelete?: MuiChipProps['onDelete'];

  /**
   * URL to navigate to when chip is clicked
   * Makes the chip clickable and wraps it in a Link component
   */
  href?: string;

  /**
   * Link target (e.g., '_blank' for new tab)
   */
  target?: string;

  /**
   * Link rel attribute (e.g., 'noopener noreferrer' for external links)
   */
  rel?: string;
}

/**
 * Common Chip component with color mapping functionality
 *
 * @example
 * // Basic usage with color mapping
 * <Chip
 *   label="Active"
 *   colorMapping={{ 'Active': 'success', 'Inactive': 'error' }}
 * />
 *
 * @example
 * // Using different value for lookup
 * <Chip
 *   label="Status: Active"
 *   value="active"
 *   colorMapping={{ 'active': 'success', 'inactive': 'error' }}
 * />
 *
 * @example
 * // With custom styling
 * <Chip
 *   label="Custom"
 *   defaultColor="primary"
 *   variant="outlined"
 *   size="small"
 *   sx={{ fontWeight: 'bold' }}
 * />
 *
 * @example
 * // With link functionality
 * <Chip
 *   label="Visit Team"
 *   href="https://example.com/team"
 *   target="_blank"
 *   rel="noopener noreferrer"
 *   defaultColor="primary"
 * />
 */
export const Chip = ({
  label,
  colorMapping,
  value,
  defaultColor = 'default' as ChipColor,
  variant = 'filled',
  size = 'medium',
  sx,
  clickable = false,
  onClick,
  onDelete,
  href,
  target,
  rel,
  ...rest
}: ChipProps) => {
  // Determine the color based on mapping
  const getChipColor = (): ChipColor => {
    if (!colorMapping) {
      return defaultColor;
    }

    const lookupValue = value !== undefined ? value : label;
    const mappedColor = colorMapping[lookupValue];

    return mappedColor || defaultColor;
  };

  const chipColor = getChipColor();

  // Determine if chip should be clickable
  const isClickable = clickable || !!href || !!onClick;

  const chipElement = (
    <MuiChip
      label={label}
      color={chipColor}
      variant={variant}
      size={size}
      clickable={isClickable}
      onClick={onClick}
      onDelete={onDelete}
      sx={{
        // Default styles that can be overridden
        fontWeight: 500,
        fontFamily: FONT_FAMILY,
        // Add cursor pointer for links
        ...(href && {
          cursor: 'pointer',
        }),
        ...sx,
      }}
      {...rest}
    />
  );

  // Wrap with Link if href is provided
  if (href) {
    return (
      <Link href={href} target={target} rel={rel}>
        {chipElement}
      </Link>
    );
  }

  return chipElement;
};

// Common color mappings that can be reused across the app
export const commonColorMappings = {
  status: {
    active: 'success' as ChipColor,
    inactive: 'error' as ChipColor,
    pending: 'warning' as ChipColor,
    draft: 'default' as ChipColor,
  },
  severity: {
    high: 'error' as ChipColor,
    medium: 'warning' as ChipColor,
    low: 'info' as ChipColor,
    critical: 'error' as ChipColor,
  },
  priority: {
    urgent: 'error' as ChipColor,
    high: 'warning' as ChipColor,
    medium: 'info' as ChipColor,
    low: 'default' as ChipColor,
  },
  boolean: {
    true: 'success' as ChipColor,
    false: 'error' as ChipColor,
    yes: 'success' as ChipColor,
    no: 'error' as ChipColor,
  },
} as const;

export default Chip;
