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

import { configApiRef, useApi } from '@backstage/core-plugin-api';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { DEFAULT_BOT_CONFIG } from '../constants';
import clearIcon from '../icons/clear-icon.png';
import MoreInfoIcon from '../icons/more-info.svg';
import './App.css';
import { useHeaderStyles } from './useHeaderStyles';
import useStyles from './useStyles';

// SVG icons with white contours
const FormIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="1.5"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ChatIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="1.5"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const SunIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="1.5"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

interface ChatHeaderProps {
  clearChat: () => void;
  handleCloseChat: () => void;
  handleFullScreenToggle: () => void;
  showFormMode: boolean;
  onToggleFormMode: () => void;
  isConnected?: boolean;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

function ChatHeader({
  clearChat,
  handleCloseChat,
  handleFullScreenToggle,
  showFormMode,
  onToggleFormMode,
  isConnected = true,
  isDarkMode = false,
  onToggleTheme,
}: ChatHeaderProps) {
  const styles = useStyles();
  const headerStyles = useHeaderStyles();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const config = useApi(configApiRef);
  const botName =
    config.getOptionalString('agentForge.botName') || DEFAULT_BOT_CONFIG.name;
  const infoPage =
    config.getOptionalString('agentForge.infoPage') ||
    DEFAULT_BOT_CONFIG.infoPage;

  const goFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    handleFullScreenToggle();
  };

  return (
    <div className={styles.chatPanelHeaderBG}>
      <div className={styles.chatPanelHeader}>
        <div className={headerStyles.chatHeaderTitle}>
          <h1>{botName}</h1>
          <a
            href={infoPage}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex' }}
          >
            <img src={MoreInfoIcon} alt={`Learn more about ${botName}`} />
          </a>
        </div>
        <Box display="flex" flexDirection="row" alignItems="center" rowGap={2}>
          {/* Connection Status Indicator */}
          <Tooltip
            title={
              isConnected
                ? `Connected to ${botName} Multi-Agent System`
                : `Disconnected from ${botName} Multi-Agent System`
            }
          >
            <Box
              sx={{
                color: isConnected ? '#4CAF50' : '#F44336',
                fontSize: '16px',
                marginRight: '8px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              {isConnected ? '🟢' : '🔴'}
            </Box>
          </Tooltip>
          <Tooltip title="Toggle Full Screen">
            <IconButton
              sx={{ color: '#fff' }}
              onClick={goFullScreen}
              style={{ display: isFullScreen ? 'none' : 'block' }}
            >
              ⛶
            </IconButton>
          </Tooltip>
          <Tooltip title="Exit Full Screen">
            <IconButton
              sx={{ color: '#fff' }}
              onClick={goFullScreen}
              style={{ display: isFullScreen ? 'block' : 'none' }}
            >
              ▣
            </IconButton>
          </Tooltip>
          <Tooltip
            title={showFormMode ? 'Show Text Chat' : 'Show Form Display'}
          >
            <IconButton
              sx={{
                color: '#fff',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '4px',
                padding: '4px',
              }}
              onClick={onToggleFormMode}
            >
              {showFormMode ? <FormIcon /> : <ChatIcon />}
            </IconButton>
          </Tooltip>
          {onToggleTheme && (
            <Tooltip
              title={
                isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'
              }
            >
              <IconButton
                sx={{
                  color: '#fff',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px',
                }}
                onClick={onToggleTheme}
              >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Clear Chat">
            <IconButton onClick={clearChat}>
              <img
                style={{ width: 24, height: 24 }}
                src={clearIcon}
                alt="Clear Chat"
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close Chat">
            <IconButton sx={{ color: '#fff' }} onClick={handleCloseChat}>
              ×
            </IconButton>
          </Tooltip>
        </Box>
      </div>
    </div>
  );
}

export default ChatHeader;
