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

/**
 * StreamingProgress Component
 *
 * Displays the streaming progress indicator including the phase chip,
 * animated loading dots, and status text (connecting, streaming, tool calls, etc.).
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { StreamingState } from './StreamingMessage.types';
import { PHASE_MESSAGES } from './StreamingMessage.constants';
import { getPhaseChipSx, getLoadingDotSx } from './styles';

// =============================================================================
// PROPS
// =============================================================================

export interface StreamingProgressProps {
  /** Current streaming phase */
  phase: StreamingState['phase'];
  /** Phase label for the chip (e.g. "Thinking", "Working") */
  phaseLabel: string;
  /** Color for the phase chip and loading dots (from branding) */
  phaseColor: string;
  /** Whether the stream has completed */
  completed: boolean;
  /** Whether to show the loading indicator (animated dots + status text) */
  showLoading: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Phase chip for the header - shows current phase (Thinking, Working, etc.)
 */
export function PhaseChip({
  phaseLabel,
  phaseColor,
  completed,
}: Pick<StreamingProgressProps, 'phaseLabel' | 'phaseColor' | 'completed'>) {
  if (completed) return null;
  return (
    <Chip size="small" label={phaseLabel} sx={getPhaseChipSx(phaseColor)} />
  );
}

/**
 * Loading indicator - animated dots and status text
 */
export function LoadingIndicator({
  phase,
  phaseColor,
}: Pick<StreamingProgressProps, 'phase' | 'phaseColor'>) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <Box key={i} sx={getLoadingDotSx(phaseColor, i * 0.16)} />
        ))}
      </Box>
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
      >
        {PHASE_MESSAGES[phase] || 'Processing...'}
      </Typography>
    </Box>
  );
}

/**
 * Renders the streaming progress indicator.
 * Use PhaseChip for the header and LoadingIndicator for the content area.
 */
export function StreamingProgress(props: StreamingProgressProps) {
  return (
    <>
      <PhaseChip
        phaseLabel={props.phaseLabel}
        phaseColor={props.phaseColor}
        completed={props.completed}
      />
      {props.showLoading && (
        <LoadingIndicator phase={props.phase} phaseColor={props.phaseColor} />
      )}
    </>
  );
}
