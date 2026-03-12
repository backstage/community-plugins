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
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';

/** Animated dot for loading indicator */
const AnimatedDot = ({ delay }: { delay: number }) => (
  <Box
    sx={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'currentColor',
      animation: 'bounce 1.4s ease-in-out infinite',
      animationDelay: `${delay}s`,
      '@keyframes bounce': {
        '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
        '40%': { transform: 'scale(1)', opacity: 1 },
      },
    }}
  />
);

/** Thinking indicator shown while AI is processing */
export const ThinkingIndicator = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          flexShrink: 0,
        }}
      >
        <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
          px: 2,
          py: 1.5,
          borderRadius: 2,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.04)',
          color: theme.palette.text.secondary,
        }}
      >
        <AnimatedDot delay={0} />
        <AnimatedDot delay={0.2} />
        <AnimatedDot delay={0.4} />
      </Box>
    </Box>
  );
};
