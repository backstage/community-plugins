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
import { useTheme, alpha } from '@mui/material/styles';
import { VendorIcon, hasVendorIcon, getAvailableVendors } from './VendorIcon';
import { CustomTooltip } from './common/CustomTooltip';
import { SimpleTooltip } from './SimpleTooltip';
import { Chip } from './Chip';

interface Source {
  name: string;
  vendor?: string;
  type?: string;
  url?: string;
}

interface SourcesDisplayProps {
  /**
   * Array of source objects
   */
  sources: Source[];

  /**
   * Maximum number of sources to show before displaying +N
   */
  maxVisible?: number;

  /**
   * Size of the vendor icons
   */
  iconSize?: number | string;

  /**
   * Gap between source items
   */
  gap?: number;
}

/**
 * Helper function to infer vendor from source name using available vendor icons
 */
const inferVendorFromName = (sourceName: string): string => {
  // First, try the source name as-is
  if (hasVendorIcon(sourceName)) {
    return sourceName;
  }

  // Get all available vendor names for matching
  const availableVendors = getAvailableVendors();
  const name = sourceName.toLowerCase();

  // Try to find a vendor that matches part of the source name
  for (const vendor of availableVendors) {
    const vendorLower = vendor.toLowerCase();

    // Check if vendor name is contained in source name
    if (name.includes(vendorLower)) {
      return vendor;
    }

    // Check if source name is contained in vendor name (for cases like "Managed Checkov" -> "ManagedCheckov")
    if (vendorLower.includes(name.replace(/\s+/g, ''))) {
      return vendor;
    }

    // Check for partial matches (remove spaces and special chars)
    const cleanSourceName = name.replace(/[^a-z0-9]/g, '');
    const cleanVendorName = vendorLower.replace(/[^a-z0-9]/g, '');

    if (
      cleanSourceName.includes(cleanVendorName) ||
      cleanVendorName.includes(cleanSourceName)
    ) {
      return vendor;
    }
  }

  // Special mappings for common variations
  const specialMappings: Record<string, string> = {
    'managed checkov': 'ManagedCheckov',
    'managed semgrep': 'ManagedSemgrep',
    'sonar qube': 'SonarQube',
    'sonar cloud': 'SonarCloud',
    'black duck': 'BlackDuck',
    'new relic': 'NewRelic',
    'white source': 'Mend',
    'prisma cloud': 'PrismaCloud',
    'check marx': 'Checkmarx',
    'code ql': 'CodeQL',
    'git lab': 'Gitlab',
    'git hub': 'Github',
  };

  const cleanName = name.toLowerCase().trim();
  if (specialMappings[cleanName]) {
    return specialMappings[cleanName];
  }

  // Try fuzzy matching for multi-word names
  const words = sourceName.split(/\s+/);
  for (const vendor of availableVendors) {
    const vendorWords = vendor
      .split(/(?=[A-Z])/)
      .map((w: string) => w.toLowerCase());

    // Check if all words from source are in vendor name
    const allWordsMatch = words.every(word =>
      vendorWords.some(
        (vendorWord: string) =>
          vendorWord.includes(word.toLowerCase()) ||
          word.toLowerCase().includes(vendorWord),
      ),
    );

    if (allWordsMatch && words.length > 1) {
      return vendor;
    }
  }

  // Default fallback
  return 'ManualUpload';
};

/**
 * SourcesDisplay component that renders source names with vendor icons
 * Shows a limited number of sources with overflow handling (+N indicator)
 *
 * @example
 * <SourcesDisplay
 *   sources={[
 *     { name: 'GitLab Dependency Scanning', vendor: 'gitlab' },
 *     { name: 'Snyk Code Analysis', vendor: 'snyk' }
 *   ]}
 *   maxVisible={2}
 * />
 */
export const SourcesDisplay = ({
  sources,
  maxVisible = 2,
  iconSize = 20,
  gap = 1,
}: SourcesDisplayProps) => {
  const theme = useTheme();

  if (!sources || sources.length === 0) {
    return '';
  }

  const visibleSources = sources.slice(0, maxVisible);
  const hiddenSources = sources.slice(maxVisible);
  const hasOverflow = hiddenSources.length > 0;

  const renderSource = (source: Source, index: number) => {
    // Try to determine vendor from source name if not provided
    const vendor = source.vendor || inferVendorFromName(source.name);

    const circleSize = iconSize;
    const iconVisualSize =
      typeof iconSize === 'number' ? Math.max(iconSize - 8, 12) : iconSize;
    const fallbackFontSize =
      typeof iconSize === 'number' ? Math.max(iconSize / 2.4, 9) : '0.7rem';

    const iconElement = (
      <VendorIcon
        vendor={vendor}
        size={iconVisualSize}
        fallback={
          <Typography
            sx={{
              fontSize: fallbackFontSize,
              fontWeight: 600,
              color: theme.palette.grey[600],
            }}
          >
            {source.name.charAt(0).toUpperCase()}
          </Typography>
        }
      />
    );

    const iconWithCircle = (
      <Box
        sx={{
          width: circleSize,
          height: circleSize,
          minWidth: circleSize,
          borderRadius: '50%',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
          // boxShadow: theme.shadows[1],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {iconElement}
      </Box>
    );

    return (
      <Box
        key={`${source.name}-${index}`}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0,
        }}
      >
        <SimpleTooltip title={source.name} centered>
          {source.url ? (
            <Box
              component="a"
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              {iconWithCircle}
            </Box>
          ) : (
            iconWithCircle
          )}
        </SimpleTooltip>
      </Box>
    );
  };

  const renderOverflowIndicator = () => {
    if (!hasOverflow) return null;

    const chipBorderColor =
      theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#d0d0d0';

    const overflowContent = (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: '250px',
          p: 1,
        }}
      >
        {hiddenSources.map((source, index) => {
          const isNumericIconSize = typeof iconSize === 'number';
          const overflowCircleSize = iconSize;
          const overflowIconSize = isNumericIconSize
            ? Math.max((iconSize as number) - 8, 12)
            : iconSize;
          const overflowFallbackFontSize = isNumericIconSize
            ? `${Math.max((iconSize as number) / 2.2, 8)}px`
            : '0.65rem';

          const overflowIcon = (
            <VendorIcon
              vendor={source.vendor || inferVendorFromName(source.name)}
              size={overflowIconSize}
              fallback={
                <Typography
                  sx={{ fontSize: overflowFallbackFontSize, fontWeight: 600 }}
                >
                  {source.name.charAt(0).toUpperCase()}
                </Typography>
              }
            />
          );

          const overflowCircle = (
            <Box
              sx={{
                width: overflowCircleSize,
                height: overflowCircleSize,
                minWidth: overflowCircleSize,
                borderRadius: '50%',
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                // boxShadow: theme.shadows[1],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {overflowIcon}
            </Box>
          );

          const iconWithTooltip = (
            <SimpleTooltip title={source.name} centered>
              {overflowCircle}
            </SimpleTooltip>
          );

          return source.url ? (
            <Box
              key={`overflow-${source.name}-${index}`}
              component="a"
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                textDecoration: 'none',
                cursor: 'pointer',
                borderRadius: 1,
                p: 0.5,
                transition: 'background-color 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              {iconWithTooltip}
            </Box>
          ) : (
            <Box key={`overflow-${source.name}-${index}`} sx={{ p: 0.5 }}>
              {iconWithTooltip}
            </Box>
          );
        })}
      </Box>
    );

    return (
      <CustomTooltip
        title={overflowContent}
        placement="top"
        enterDelay={200}
        leaveDelay={300}
        disableInteractive={false}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          <Chip
            label={`+${hiddenSources.length}`}
            defaultColor="default"
            size="small"
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
            }}
          />
        </Box>
      </CustomTooltip>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        minHeight: iconSize, // Match minimum height to icon size
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap,
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        {visibleSources.map((source, index) => renderSource(source, index))}
        {renderOverflowIndicator()}
      </Box>
    </Box>
  );
};

export default SourcesDisplay;
