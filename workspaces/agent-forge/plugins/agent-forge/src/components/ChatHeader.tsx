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

import { useState } from 'react';
import clearIcon from '../icons/clear-icon.png';
import useStyles from './useStyles';
import { useHeaderStyles } from './useHeaderStyles';
import MoreInfoIcon from '../icons/more-info.svg';
import './App.css';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

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

interface ChatHeaderProps {
  clearChat: () => void;
  handleCloseChat: () => void;
  handleFullScreenToggle: () => void;
  showFormMode: boolean;
  onToggleFormMode: () => void;
  isConnected?: boolean;
}

function ChatHeader({
  clearChat,
  handleCloseChat,
  handleFullScreenToggle,
  showFormMode,
  onToggleFormMode,
  isConnected = true,
}: ChatHeaderProps) {
  const styles = useStyles();
  const headerStyles = useHeaderStyles();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const goFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    handleFullScreenToggle();
  };

  return (
    <div className={styles.chatPanelHeaderBG}>
      <div className={styles.chatPanelHeader}>
        <div className={headerStyles.chatHeaderTitle}>
          <h1>CAIPE Chat Assistant</h1>
          <a
            href="https://cisco-eti.atlassian.net/l/cp/EtLAxo7U"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex' }}
          >
            <img src={MoreInfoIcon} alt="Learn more about CAIPE" />
          </a>
        </div>
        <Box display="flex" flexDirection="row" alignItems="center" rowGap={2}>
          {/* Connection Status Indicator */}
          <Tooltip
            title={
              isConnected
                ? 'Connected to CAIPE Multi-Agent System'
                : 'Disconnected from CAIPE Multi-Agent System'
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
