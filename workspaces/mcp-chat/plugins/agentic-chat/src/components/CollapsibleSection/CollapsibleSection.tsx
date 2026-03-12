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
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { SxProps, Theme } from '@mui/material/styles';

interface CollapsibleSectionProps {
  /** Accessible label for the toggle button */
  label: string;
  /** Header content rendered next to the expand/collapse chevron */
  header: React.ReactNode;
  /** Whether the section is expanded on mount */
  defaultExpanded?: boolean;
  /** Optional sx overrides for the outer container */
  sx?: SxProps<Theme>;
  /** Optional sx overrides for the header bar */
  headerSx?: SxProps<Theme>;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  label,
  header,
  defaultExpanded = false,
  sx,
  headerSx,
  children,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = useCallback(() => setExpanded(prev => !prev), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    },
    [toggle],
  );

  return (
    <Box sx={sx}>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          gap: 0.5,
          userSelect: 'none',
          ...((headerSx ?? {}) as Record<string, unknown>),
        }}
      >
        <ExpandMoreIcon
          sx={{
            fontSize: '1rem',
            transition: 'transform 0.2s ease',
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}
        />
        <Typography
          variant="caption"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          {header}
        </Typography>
      </Box>
      <Collapse in={expanded}>{children}</Collapse>
    </Box>
  );
};
