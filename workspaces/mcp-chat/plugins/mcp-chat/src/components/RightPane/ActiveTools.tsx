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
import { MCPServer, Tool } from '../../types';

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
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 1.5,
          paddingBottom: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <BuildIcon
          sx={{
            marginRight: 1,
            color: theme.palette.text.primary,
            fontSize: '1.1rem',
          }}
        />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: '1rem',
          }}
        >
          MCP Servers List
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: 'scroll',
          paddingRight: 0.5,
        }}
      >
        {mcpServers
          .filter(server => server.enabled)
          .map(server => {
            const serverTools = availableTools.filter(
              tool => tool.serverId === server.id,
            );

            return (
              <Accordion
                key={server.name}
                sx={{
                  marginBottom: 0.75,
                  boxShadow: 'none',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  '&.Mui-expanded:before': {
                    opacity: 1,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        fontSize: '1rem',
                        color: theme.palette.text.primary,
                      }}
                    />
                  }
                  sx={{
                    minHeight: 44,
                    backgroundColor: theme.palette.background.paper,
                    padding: '0 12px',
                    '& .MuiAccordionSummary-content': {
                      margin: '12px 0',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      paddingRight: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                        fontSize: '0.875rem',
                      }}
                    >
                      {server.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: theme.palette.action.hover,
                        padding: '2px 6px',
                        borderRadius: 2.5,
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
                  sx={{
                    flexDirection: 'column',
                    padding: '8px 12px 12px',
                    backgroundColor: theme.palette.background.default,
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {toolsLoading ? (
                    <Box
                      sx={{
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
                        sx={{ marginRight: 1 }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        Loading tools...
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {(() => {
                        if (serverTools.length > 0) {
                          return (
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.75,
                              }}
                            >
                              {serverTools.map(tool => (
                                <Box
                                  key={tool.function.name}
                                  sx={{
                                    padding: '6px 8px',
                                    backgroundColor:
                                      theme.palette.background.paper,
                                    borderRadius: 1,
                                    border: `1px solid ${theme.palette.divider}`,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 600,
                                      color: theme.palette.text.primary,
                                      fontSize: '0.75rem',
                                      display: 'block',
                                      marginBottom: 0.25,
                                    }}
                                  >
                                    {tool.function.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
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
                          );
                        }

                        if (!server.status.connected && server.status.error) {
                          return (
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.palette.error.main,
                                fontWeight: 500,
                                textAlign: 'center',
                              }}
                            >
                              Problem connecting to MCP server <br />
                              Error: {server.status.error}
                            </Typography>
                          );
                        }

                        return (
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              textAlign: 'center',
                              display: 'block',
                            }}
                          >
                            No tools available for this server
                          </Typography>
                        );
                      })()}
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}

        {mcpServers.filter(server => server.enabled).length === 0 && (
          <Typography
            variant="caption"
            sx={{
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
