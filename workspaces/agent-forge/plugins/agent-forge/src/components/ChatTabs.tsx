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
/* eslint-disable react/react-in-jsx-scope */

/* eslint-disable react/react-in-jsx-scope*/

import { configApiRef, useApi } from '@backstage/core-plugin-api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { DEFAULT_BOT_CONFIG } from '../constants';
import useStyles from './useStyles';

interface ChatTabsProps {
  handleMessageSubmit: (msg?: string) => void;
  isFullScreen?: boolean;
  suggestions: string[] | [];
}
// const suggestions: any[] = ["hello", "bello"];

function ChatTabs({
  handleMessageSubmit,
  isFullScreen,
  suggestions,
}: ChatTabsProps) {
  const handleTabClick = (message: string) => () => {
    handleMessageSubmit(message);
  };

  const styles = useStyles();
  const config = useApi(configApiRef);
  const botIcon =
    config.getOptionalString('agentForge.botIcon') || DEFAULT_BOT_CONFIG.icon;

  if (isFullScreen) {
    return (
      <Box
        width="100%"
        height="100%"
        margin="auto"
        display="flex"
        gap={4}
        flexDirection="column"
        justifyItems="center"
        alignItems="center"
        padding={4}
      >
        <div className={styles.greetingSection}>
          <img className={styles.greetingLogo} src={botIcon} alt="Logo" />
          <div className={styles.greetingText}>Hi there.</div>
        </div>
        <Grid
          container
          height="80%"
          gap={3}
          alignItems="center"
          justifyContent="center"
          overflow="auto"
          padding={2}
        >
          {suggestions.map(s => (
            <Grid item key={s} xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                style={{
                  width: '100%',
                  height: '120px',
                  minHeight: '80px',
                  fontSize: '14px',
                  textAlign: 'center',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                }}
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
        <img className={styles.greetingLogo} src={botIcon} alt="Logo" />
      </div>
      <div className={styles.tabs}>
        {suggestions.map(s => (
          <Button
            key={s}
            className={styles.tabButton}
            onClick={handleTabClick(s)}
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default ChatTabs;
