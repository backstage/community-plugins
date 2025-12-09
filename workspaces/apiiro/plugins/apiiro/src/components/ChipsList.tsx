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
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { Chip, ChipProps, ColorMapping } from './Chip';
import { CustomTooltip } from './common/CustomTooltip';
import { SimpleTooltip } from './SimpleTooltip';

export interface ChipsListItem {
  /**
   * Unique identifier for the chip
   */
  id: string | number;

  /**
   * Label to display on the chip
   */
  label: string;

  /**
   * Value for color mapping lookup (optional, defaults to label)
   */
  value?: string;

  /**
   * Tooltip text to display on hover (optional)
   */
  tooltip?: string;

  /**
   * URL to navigate to when chip is clicked (optional)
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

  /**
   * Additional props to pass to individual chip
   */
  chipProps?: Partial<ChipProps>;
}

export interface ChipsListProps {
  /**
   * Array of chip items to display
   */
  items: ChipsListItem[];

  /**
   * Maximum number of chips to show before displaying +N
   */
  maxVisible?: number;

  /**
   * Color mapping for chips
   */
  colorMapping?: ColorMapping;

  /**
   * Default color for chips
   */
  defaultColor?: ChipProps['defaultColor'];

  /**
   * Size of the chips
   */
  size?: ChipProps['size'];

  /**
   * Variant of the chips
   */
  variant?: ChipProps['variant'];

  /**
   * Custom styles for the container
   */
  sx?: SxProps<Theme>;

  /**
   * Custom styles for individual chips
   */
  chipSx?: SxProps<Theme>;

  /**
   * Custom styles for the +N chip
   */
  overflowChipSx?: SxProps<Theme>;

  /**
   * Custom styles for the tooltip
   */
  tooltipSx?: SxProps<Theme>;

  /**
   * Gap between chips
   */
  gap?: number;

  /**
   * Direction of chip layout
   */
  direction?: 'row' | 'column';

  /**
   * Custom renderer for overflow tooltip content
   */
  renderOverflowContent?: (items: ChipsListItem[]) => ReactNode;
}

/**
 * ChipsList component that displays a list of chips with overflow handling
 * Shows a "+N" chip with tooltip when there are more items than maxVisible
 *
 * @example
 * // Basic usage
 * <ChipsList
 *   items={[
 *     { id: 1, label: 'High EPSS' },
 *     { id: 2, label: 'Known exploit' },
 *     { id: 3, label: 'Historical CVEs' }
 *   ]}
 *   maxVisible={2}
 * />
 *
 * @example
 * // With color mapping
 * <ChipsList
 *   items={chipItems}
 *   maxVisible={3}
 *   colorMapping={{ 'High': 'error', 'Medium': 'warning', 'Low': 'success' }}
 *   size="small"
 *   variant="outlined"
 * />
 *
 * @example
 * // With clickable links
 * <ChipsList
 *   items={[
 *     { id: 1, label: 'Team A', href: '/teams/team-a' },
 *     { id: 2, label: 'Team B', href: '/teams/team-b', target: '_blank' }
 *   ]}
 *   maxVisible={2}
 * />
 */
export const ChipsList = ({
  items,
  maxVisible = 3,
  colorMapping,
  defaultColor = 'default',
  size = 'medium',
  variant = 'filled',
  sx,
  chipSx,
  overflowChipSx,
  tooltipSx,
  gap = 1,
  direction = 'row',
  renderOverflowContent,
}: ChipsListProps) => {
  const theme = useTheme();
  if (!items || items.length === 0) {
    return null;
  }

  const visibleItems = items.slice(0, maxVisible);
  const hiddenItems = items.slice(maxVisible);
  const hasOverflow = hiddenItems.length > 0;

  // Get theme-aware colors
  let chipBackgroundColor = 'transparent';
  if (variant === 'filled') {
    chipBackgroundColor =
      theme.palette.mode === 'dark'
        ? theme.palette.grey[700]
        : theme.palette.grey[300];
  }

  const chipBorderColor =
    theme.palette.mode === 'dark'
      ? theme.palette.grey[700]
      : theme.palette.grey[400];

  const renderChip = (item: ChipsListItem) => {
    const chip = (
      <Chip
        key={item.id}
        label={item.label}
        value={item.value}
        colorMapping={colorMapping}
        defaultColor={defaultColor}
        size={size}
        variant={variant}
        href={item.href}
        target={item.target}
        rel={item.rel}
        sx={{
          marginBottom: '0px',
          height: '20px',
          fontSize: '11px',
          borderRadius: '10px',
          backgroundColor: chipBackgroundColor,
          border:
            variant === 'outlined' ? `1px solid ${chipBorderColor}` : 'none',
          '& .MuiChip-label': {
            padding: '0 6px',
            fontSize: '11px',
            lineHeight: '18px',
          },
          ...chipSx,
          ...(item.chipProps?.sx as any),
        }}
        {...item.chipProps}
      />
    );

    // Wrap with tooltip if tooltip text is provided
    if (item.tooltip) {
      return (
        <SimpleTooltip key={item.id} title={item.tooltip}>
          {chip}
        </SimpleTooltip>
      );
    }

    return chip;
  };

  const renderOverflowChip = () => {
    if (!hasOverflow) return null;

    const defaultOverflowContent = (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'auto',
          flexWrap: 'wrap',
          maxWidth: '100%',
          gap: 0.5,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.grey[700]
              : theme.palette.background.paper,
          ...tooltipSx,
        }}
        data-testid="overflow-chip-tooltip"
      >
        {hiddenItems.map(item => {
          const overflowChip = (
            <Chip
              key={item.id}
              label={item.label}
              value={item.value}
              colorMapping={colorMapping}
              defaultColor={defaultColor}
              size={size}
              variant="filled"
              href={item.href}
              target={item.target}
              rel={item.rel}
              sx={{
                marginRight: '0px',
                height: '20px',
                fontSize: '11px',
                borderRadius: '10px',
                border:
                  variant === 'outlined'
                    ? `1px solid ${chipBorderColor}`
                    : 'none',
                '& .MuiChip-label': {
                  padding: '0 6px',
                  fontSize: '11px',
                  lineHeight: '18px',
                },
                ...chipSx,
                ...(item.chipProps?.sx as any),
              }}
              {...item.chipProps}
            />
          );

          // Show individual tooltip if available
          if (item.tooltip) {
            return (
              <SimpleTooltip
                key={`overflow-${item.id}`}
                title={item.tooltip}
                tooltipProps={{
                  PopperProps: {
                    sx: { zIndex: 10000 },
                  },
                }}
              >
                {overflowChip}
              </SimpleTooltip>
            );
          }

          return overflowChip;
        })}
      </Box>
    );

    const overflowContent =
      renderOverflowContent?.(hiddenItems) ?? defaultOverflowContent;

    return (
      <CustomTooltip
        title={overflowContent}
        placement="top"
        enterDelay={200}
        leaveDelay={300}
        disableInteractive={false}
      >
        <Chip
          label={`+${hiddenItems.length}`}
          defaultColor="default"
          size={size}
          variant="outlined"
          sx={{
            marginBottom: '0px',
            cursor: 'pointer',
            height: '20px',
            fontSize: '11px',
            minWidth: '24px',
            borderRadius: '10px',
            backgroundColor: 'transparent',
            border: `1px solid ${chipBorderColor}`,
            '& .MuiChip-label': {
              padding: '0 6px',
              fontSize: '11px',
              lineHeight: '18px',
            },
            '&:hover': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[800]
                  : theme.palette.grey[200],
            },
            ...overflowChipSx,
          }}
        />
      </CustomTooltip>
    );
  };
  const isFlex = hiddenItems.length > 0;
  return (
    <Box
      sx={{
        display: isFlex ? 'flex' : 'block',
        flexDirection: direction,
        flexWrap: direction === 'row' ? 'wrap' : 'nowrap',
        gap,
        overflow: 'auto',
        maxHeight: '100%',
        maxWidth: '100%',
        alignItems: 'center',
        backgroundColor: 'transparent',
        scrollbarWidth: 'none' /* Firefox */,
        '&::-webkit-scrollbar': { display: 'none' } /* Chrome, Safari, Edge */,
        msOverflowStyle: 'none' /* IE and Edge */,
        ...sx,
      }}
    >
      {visibleItems.map(item => renderChip(item))}
      {renderOverflowChip()}
    </Box>
  );
};

// Common chip configurations that can be reused
export const commonChipsListConfigs = {
  vulnerabilities: {
    colorMapping: {
      'High EPSS': 'error',
      'Known exploit': 'error',
      'Historical CVEs': 'warning',
      'Backed by foundation': 'info',
      'Frequent commits': 'success',
      'Exploit POC': 'error',
      'Has vulnerabilities': 'warning',
    } as ColorMapping,
    maxVisible: 2,
    size: 'small' as const,
    variant: 'outlined' as const,
  },
  status: {
    colorMapping: {
      Open: 'error',
      'In Progress': 'warning',
      Resolved: 'success',
      Closed: 'default',
    } as ColorMapping,
    maxVisible: 3,
    size: 'small' as const,
    variant: 'filled' as const,
  },
  tags: {
    colorMapping: {} as ColorMapping,
    maxVisible: 4,
    size: 'small' as const,
    variant: 'outlined' as const,
  },
} as const;

export default ChipsList;
