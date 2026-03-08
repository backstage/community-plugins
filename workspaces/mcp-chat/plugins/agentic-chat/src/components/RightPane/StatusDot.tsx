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
import { useTheme, alpha } from '@mui/material/styles';

export interface StatusDotProps {
  connected: boolean;
  loading?: boolean;
  optional?: boolean;
}

export const StatusDot = ({
  connected,
  loading: isLoading,
  optional,
}: StatusDotProps) => {
  const theme = useTheme();
  const color = (() => {
    if (isLoading) return theme.palette.warning.main;
    if (connected) return theme.palette.success.main;
    if (optional) return alpha(theme.palette.text.secondary, 0.3);
    return theme.palette.error.main;
  })();

  return (
    <Box
      sx={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  );
};
