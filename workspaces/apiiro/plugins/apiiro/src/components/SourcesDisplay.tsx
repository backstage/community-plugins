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
   * Size of the source chips
   */
  size?: 'small' | 'medium';

  /**
   * Variant of the source chips
   */
  variant?: 'filled' | 'outlined';

  /**
   * Gap between chips
   */
  gap?: number;
}

/**
 * SourcesDisplay component that renders source names as clickable chips
 * Shows a limited number of sources with overflow handling (+N indicator)
 *
 * @example
 * <SourcesDisplay
 *   sources={[
 *     { name: 'GitLab Dependency Scanning', url: 'https://example.com' },
 *     { name: 'Snyk Code Analysis' }
 *   ]}
 *   maxVisible={1}
 * />
 */
export const SourcesDisplay = ({
  sources,
  maxVisible = 1,
  size = 'small',
  variant = 'outlined',
  gap = 0.5,
}: SourcesDisplayProps) => {
  if (!sources || sources.length === 0) {
    return '';
  }

  const sourceItems = sources.map(source => ({
    id: source.name,
    label: source.name,
    href: source?.url,
    target: source?.url ? '_blank' : undefined,
    rel: source?.url ? 'noopener noreferrer' : undefined,
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
        items={sourceItems}
        maxVisible={maxVisible}
        size={size}
        variant={variant}
        gap={gap}
      />
    </Box>
  );
};

export default SourcesDisplay;
