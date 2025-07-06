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
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { BotIcon } from '../BotIcon';

export const TypingIndicator: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: theme.spacing(1),
        marginBottom: theme.spacing(2),
      }}
    >
      <Avatar
        sx={{
          width: 35,
          height: 35,
          fontSize: '1rem',
          backgroundColor: isDarkMode
            ? theme.palette.background.default
            : theme.palette.background.paper,
          color: isDarkMode
            ? theme.palette.text.primary
            : theme.palette.text.secondary,
        }}
      >
        <BotIcon
          color={
            isDarkMode
              ? theme.palette.text.primary
              : theme.palette.text.secondary
          }
        />
      </Avatar>
      <Card
        elevation={0}
        sx={{
          backgroundColor: 'transparent',
          border: `0px solid ${theme.palette.background.paper}`,
          maxWidth: '70%',
        }}
      >
        <CardContent
          sx={{
            padding: `${theme.spacing(1.5)}px ${theme.spacing(2)}px !important`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: theme.spacing(0.5),
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: theme.palette.text.secondary,
                animation: 'typing 1.4s infinite',
                '@keyframes typing': {
                  '0%, 60%, 100%': {
                    transform: 'translateY(0)',
                    opacity: 0.5,
                  },
                  '30%': {
                    transform: 'translateY(-10px)',
                    opacity: 1,
                  },
                },
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: theme.palette.text.secondary,
                animation: 'typing 1.4s infinite',
                animationDelay: '0.2s',
                '@keyframes typing': {
                  '0%, 60%, 100%': {
                    transform: 'translateY(0)',
                    opacity: 0.5,
                  },
                  '30%': {
                    transform: 'translateY(-10px)',
                    opacity: 1,
                  },
                },
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: theme.palette.text.secondary,
                animation: 'typing 1.4s infinite',
                animationDelay: '0.4s',
                '@keyframes typing': {
                  '0%, 60%, 100%': {
                    transform: 'translateY(0)',
                    opacity: 0.5,
                  },
                  '30%': {
                    transform: 'translateY(-10px)',
                    opacity: 1,
                  },
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ marginLeft: 1, color: theme.palette.text.secondary }}
            >
              Hang on...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
