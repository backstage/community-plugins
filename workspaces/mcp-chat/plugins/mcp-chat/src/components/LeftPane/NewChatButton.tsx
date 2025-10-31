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
import { FC } from 'react';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface NewChatButtonProps {
  onNewChat: () => void;
}

export const NewChatButton: FC<NewChatButtonProps> = ({ onNewChat }) => {
  const theme = useTheme();

  return (
    <Box sx={{ padding: '16px' }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        fullWidth
        onClick={onNewChat}
        sx={{
          background: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            background: theme.palette.primary.dark,
          },
          borderRadius: theme.spacing(1),
          textTransform: 'none',
          padding: theme.spacing(1.5, 2),
          fontWeight: 600,
        }}
      >
        New Chat
      </Button>
    </Box>
  );
};
