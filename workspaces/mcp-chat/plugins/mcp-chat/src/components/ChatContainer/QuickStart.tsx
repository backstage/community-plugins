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
import { useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import BugReportIcon from '@mui/icons-material/BugReport';
import BuildIcon from '@mui/icons-material/Build';
import CloudIcon from '@mui/icons-material/Cloud';
import CodeIcon from '@mui/icons-material/Code';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import DatabaseIcon from '@mui/icons-material/Storage';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { configApiRef, useApi } from '@backstage/core-plugin-api';
import SpeedIcon from '@mui/icons-material/Speed';
import ExtensionIcon from '@mui/icons-material/Extension';
import WebIcon from '@mui/icons-material/Web';
import DevicesIcon from '@mui/icons-material/Devices';
import ComputerIcon from '@mui/icons-material/Computer';

interface QuickStartProps {
  onSuggestionClick: (suggestion: string) => void;
}

interface Suggestion {
  title: string;
  description: string;
  prompt: string;
  category: string;
}

// Available icons for random selection
const availableIcons = [
  <SearchIcon />,
  <CodeIcon />,
  <DatabaseIcon />,
  <BuildIcon />,
  <SecurityIcon />,
  <DataUsageIcon />,
  <CloudIcon />,
  <DeveloperModeIcon />,
  <SettingsIcon />,
  <TrendingUpIcon />,
  <BugReportIcon />,
  <SpeedIcon />,
  <ExtensionIcon />,
  <WebIcon />,
  <DevicesIcon />,
  <ComputerIcon />,
];

// Function to get a random icon
const getRandomIcon = (index: number): React.ReactElement => {
  // Use index as seed for consistent icon selection per suggestion
  const iconIndex = index % availableIcons.length;
  return availableIcons[iconIndex];
};

export const QuickStart: React.FC<QuickStartProps> = ({
  onSuggestionClick,
}) => {
  const theme = useTheme();
  const configApi = useApi(configApiRef);

  // Get suggestions from config
  const suggestions: Suggestion[] = useMemo(() => {
    try {
      const configSuggestions = configApi.getOptionalConfigArray(
        'mcpChat.quickPrompts',
      );

      if (!configSuggestions || configSuggestions.length === 0) {
        return [];
      }

      return configSuggestions.map(config => ({
        title: config.getString('title'),
        description: config.getString('description'),
        prompt: config.getString('prompt'),
        category: config.getString('category'),
      }));
    } catch (error) {
      // Handle config errors gracefully by returning empty suggestions
      return [];
    }
  }, [configApi]);

  // Determine optimal grid layout based on number of suggestions
  const getGridSize = () => {
    const count = suggestions.length;
    if (count <= 2) return { xs: 12 as const, sm: 6 as const, md: 6 as const }; // 1 row on desktop
    if (count <= 4) return { xs: 12 as const, sm: 6 as const, md: 6 as const }; // 2x2 grid
    if (count <= 6) return { xs: 12 as const, sm: 6 as const, md: 4 as const }; // 2x3 grid
    return { xs: 12 as const, sm: 6 as const, md: 4 as const }; // 3 columns for larger counts
  };

  const gridSize = getGridSize();

  return (
    <Box
      sx={{
        padding: theme.spacing(3, 3),
        textAlign: 'center',
        maxWidth: 900,
        margin: 'auto auto 0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)', // Account for top bar and input area
        paddingBottom: theme.spacing(15), // Ensure no overlap with input area
        overflowY: 'auto', // Allow scrolling if needed
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          marginBottom: theme.spacing(2),
          color: theme.palette.text.primary,
          background: `linear-gradient(45deg, #185A4B, #1B5F4F, #2A6C5F, #437E72)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        How can I help you today?
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: '1.1rem',
          lineHeight: 1.6,
          maxWidth: 600,
          marginBottom: theme.spacing(4),
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Explore powerful AI-assisted workflows with our comprehensive MCP tool
        integration. Choose a category below to get started with intelligent
        automation.
      </Typography>

      <Grid
        container
        spacing={3}
        sx={{
          marginTop: theme.spacing(3),
          marginBottom: theme.spacing(4),
        }}
        justifyContent="center"
      >
        {suggestions.map((suggestion, index) => (
          <Grid
            item
            xs={gridSize.xs}
            sm={gridSize.sm}
            md={gridSize.md}
            key={index}
          >
            <Card
              onClick={() => onSuggestionClick(suggestion.prompt)}
              elevation={0}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                borderRadius: theme.spacing(2),
                height: '160px',
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.background.paper,
                  0.8,
                )}, ${alpha(theme.palette.background.default, 0.4)})`,
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.01)',
                  boxShadow: `0 8px 25px ${alpha(
                    theme.palette.primary.main,
                    0.15,
                  )}`,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  '& .suggestion-icon': {
                    transform: 'scale(1.1)',
                  },
                  '&::before': {
                    opacity: 1,
                  },
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(45deg, #185A4B, #1B5F4F, #2A6C5F, #437E72)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
              }}
            >
              <CardContent
                sx={{
                  padding: theme.spacing(2),
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Chip
                  label={suggestion.category}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: theme.spacing(1),
                    right: theme.spacing(1),
                    fontSize: '0.7rem',
                    height: 20,
                    background: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.2,
                    )}`,
                  }}
                />
                <Box
                  className="suggestion-icon"
                  sx={{
                    fontSize: '2rem',
                    marginBottom: theme.spacing(1),
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: `linear-gradient(45deg, #185A4B, #1B5F4F, #2A6C5F, #437E72)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {getRandomIcon(index)}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    marginBottom: theme.spacing(0.5),
                    color: theme.palette.text.primary,
                    fontSize: '1rem',
                  }}
                >
                  {suggestion.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                  }}
                >
                  {suggestion.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
