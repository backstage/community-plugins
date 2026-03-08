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
import ConstructionIcon from '@mui/icons-material/Construction';
import { useTheme, alpha } from '@mui/material/styles';
import type { ProviderDescriptor } from '@backstage-community/plugin-agentic-chat-common';

/** @public */
export interface ProviderPlaceholderProps {
  readonly provider: ProviderDescriptor;
}

const CONTAINER_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  py: 8,
  px: 4,
  textAlign: 'center',
  gap: 2,
} as const;

/**
 * Placeholder displayed when an unimplemented provider is selected.
 * Shows the provider name and description.
 */
export function ProviderPlaceholder({ provider }: ProviderPlaceholderProps) {
  const theme = useTheme();

  return (
    <Box sx={CONTAINER_SX}>
      <ConstructionIcon
        sx={{
          fontSize: 48,
          color: alpha(theme.palette.text.secondary, 0.4),
        }}
      />
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {provider.displayName}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 400 }}>
        The {provider.displayName} provider is not yet configured. Configuration
        options will appear here once the integration is available.
      </Typography>
    </Box>
  );
}
