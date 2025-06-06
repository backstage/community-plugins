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
import React from 'react';
import clearIcon from '../icons/clear-icon.png';
import useStyles from './useStyles';
import { useHeaderStyles } from './useHeaderStyles';
import MoreInfoIcon from '../icons/more-info.svg';
import './App.css';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

interface ChatHeaderProps {
  clearChat: () => void;
  handleCloseChat: () => void;
  handleFullScreenToggle: () => void;
}

function ChatHeader({
  clearChat,
  handleCloseChat,
  handleFullScreenToggle,
}: ChatHeaderProps) {
  const styles = useStyles();
  const headerStyles = useHeaderStyles();
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const goFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    handleFullScreenToggle();
  };

  return (
    <div className={styles.chatPanelHeaderBG}>
      <div className={styles.chatPanelHeader}>
        <div className={headerStyles.chatHeaderTitle}>
          <h1>Chat Assistant</h1>
          <a
            href="https://cisco-eti.atlassian.net/l/cp/EtLAxo7U"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex' }}
          >
            <img src={MoreInfoIcon} alt="Learn more about JARVIS" />
          </a>
        </div>
        <Box display="flex" flexDirection="row" alignItems="center" rowGap={2}>
          <IconButton
            sx={{ color: '#fff' }}
            onClick={goFullScreen}
            style={{ display: isFullScreen ? 'none' : 'block' }}
            title="Toggle Full Screen"
          >
            ⛶
          </IconButton>
          <IconButton
            sx={{ color: '#fff' }}
            onClick={goFullScreen}
            style={{ display: isFullScreen ? 'block' : 'none' }}
            title="Exit Full Screen"
          >
            ▣
          </IconButton>
          <IconButton onClick={clearChat} title="Clear Chat">
            <img
              style={{ width: 24, height: 24 }}
              src={clearIcon}
              alt="Clear Chat"
            />
          </IconButton>
          <IconButton
            sx={{ color: '#fff' }}
            onClick={handleCloseChat}
            title="Close Chat"
          >
            ×
          </IconButton>
        </Box>
      </div>
    </div>
  );
}

export default ChatHeader;
