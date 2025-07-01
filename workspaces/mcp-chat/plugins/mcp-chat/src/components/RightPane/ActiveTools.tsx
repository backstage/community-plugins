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
import BuildIcon from '@mui/icons-material/Build';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import type { Tool } from '../../api/McpChatApi';

interface MCPServer {
  id?: string;
  name: string;
  enabled: boolean;
  type?: string;
  hasUrl?: boolean;
  hasNpxCommand?: boolean;
  hasScriptPath?: boolean;
}

interface ActiveToolsProps {
  mcpServers: MCPServer[];
  availableTools: Tool[];
  toolsLoading: boolean;
}

export const ActiveTools: React.FC<ActiveToolsProps> = ({
  mcpServers,
  availableTools,
  toolsLoading,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        padding: theme.spacing(1, 2),
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <BuildIcon
          style={{
            marginRight: '8px',
            color: theme.palette.text.primary,
            fontSize: '1.1rem',
          }}
        />
        <Typography
          variant="subtitle2"
          style={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: '1rem',
          }}
        >
          Active Tools
        </Typography>
      </Box>
      <Box
        style={{
          flex: 1,
          overflowY: 'scroll',
          paddingRight: 4,
        }}
      >
        {mcpServers
          .filter(server => server.enabled)
          .map(server => {
            const serverTools = availableTools.filter(
              tool => tool.serverId === server.name,
            );

            return (
              <Accordion
                key={server.name}
                style={{
                  marginBottom: 6,
                  boxShadow: 'none',
                  borderRadius: 6,
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      style={{
                        fontSize: '1rem',
                        color: theme.palette.text.primary,
                      }}
                    />
                  }
                  style={{
                    minHeight: 44,
                    backgroundColor: theme.palette.background.paper,
                    padding: '0 12px',
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      paddingRight: 8,
                    }}
                  >
                    <Typography
                      variant="body2"
                      style={{
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                        fontSize: '0.875rem',
                      }}
                    >
                      {server.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      style={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
                        padding: '2px 6px',
                        borderRadius: 10,
                      }}
                    >
                      {toolsLoading
                        ? '...'
                        : `${serverTools.length} tool${
                            serverTools.length !== 1 ? 's' : ''
                          }`}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails
                  style={{
                    flexDirection: 'column',
                    padding: '8px 12px 12px',
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#fafafa',
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {toolsLoading ? (
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                      }}
                    >
                      <CircularProgress
                        size={20}
                        role="progressbar"
                        aria-label="Loading tools"
                        style={{ marginRight: '8px' }}
                      />
                      <Typography
                        variant="caption"
                        style={{ color: theme.palette.text.secondary }}
                      >
                        Loading tools...
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {serverTools.length > 0 ? (
                        <Box
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                          }}
                        >
                          {serverTools.map(tool => (
                            <Box
                              key={tool.function.name}
                              style={{
                                padding: '6px 8px',
                                backgroundColor: isDarkMode
                                  ? '#2a2a2a'
                                  : '#ffffff',
                                borderRadius: 4,
                                border: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <Typography
                                variant="caption"
                                style={{
                                  fontWeight: 600,
                                  color: theme.palette.text.primary,
                                  fontSize: '0.75rem',
                                  display: 'block',
                                  marginBottom: 2,
                                }}
                              >
                                {tool.function.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                style={{
                                  color: theme.palette.text.secondary,
                                  fontSize: '0.7rem',
                                  lineHeight: 1.3,
                                  display: 'block',
                                }}
                              >
                                {tool.function.description ||
                                  'No description available'}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography
                          variant="caption"
                          style={{
                            color: theme.palette.text.secondary,
                            fontStyle: 'italic',
                            textAlign: 'center',
                          }}
                        >
                          No tools available for this server
                        </Typography>
                      )}
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}

        {mcpServers.filter(server => server.enabled).length === 0 && (
          <Typography
            variant="caption"
            style={{
              color: theme.palette.text.secondary,
              fontStyle: 'italic',
              textAlign: 'center',
              display: 'block',
              padding: '12px 0',
            }}
          >
            No servers enabled
          </Typography>
        )}
      </Box>
    </Box>
  );
};
