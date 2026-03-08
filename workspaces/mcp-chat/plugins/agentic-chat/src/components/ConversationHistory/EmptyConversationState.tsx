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
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Empty state shown when there are no conversations yet.
 */
export function EmptyConversationState() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 3,
        textAlign: 'center',
      }}
    >
      <ChatBubbleOutlineIcon
        sx={{
          fontSize: 40,
          color: alpha(theme.palette.text.secondary, 0.3),
          mb: 1,
        }}
      />
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
        No conversations yet
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: alpha(theme.palette.text.secondary, 0.7) }}
      >
        Start chatting to create history
      </Typography>
    </Box>
  );
}
