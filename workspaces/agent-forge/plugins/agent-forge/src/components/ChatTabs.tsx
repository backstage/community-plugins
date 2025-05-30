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
import logo from '../icons/jarvis.png';
import useStyles from './useStyles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

interface ChatTabsProps {
  handleMessageSubmit: (msg?: string) => void;
  isFullScreen?: boolean;
}
const suggestions: any[] = [];

function ChatTabs({ handleMessageSubmit, isFullScreen }: ChatTabsProps) {
  const handleTabClick = (message: string) => () => {
    handleMessageSubmit(message);
  };

  const styles = useStyles();

  if (isFullScreen) {
    return (
      <Box
        width="60%"
        height="100%"
        margin="auto"
        display="flex"
        gap={4}
        flexDirection="column"
        justifyItems="center"
        alignItems="center"
      >
        <div className={styles.greetingSection}>
          <img className={styles.greetingLogo} src={logo} alt="Logo" />
          <div className={styles.greetingText}>Hi there.</div>
        </div>
        <Grid
          container
          display="none"
          maxHeight="70%"
          marginBottom={10}
          gap={2}
          alignItems="center"
          justifyContent="center"
          overflow="auto"
          marginBlockEnd="150px"
        >
          {suggestions.map(s => (
            <Grid item key={s} xs={4} sx={{ width: 100, height: 100 }}>
              <Button
                style={{ width: '100%', height: '100%' }}
                className={styles.tabButton}
                onClick={handleTabClick(s)}
              >
                {s}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        marginBottom: '100px',
        overflow: 'auto',
      }}
    >
      <div className={styles.greetingSection}>
        <img className={styles.greetingLogo} src={logo} alt="Logo" />
        <div className={styles.greetingText}>Hi there.</div>
      </div>
    </div>
  );
}

export default ChatTabs;
