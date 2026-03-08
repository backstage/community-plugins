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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { RAGSource } from '../../types';
import { getCollapsibleHeaderSx, getRagSourceSx } from './styles';

function isSafeUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

interface RAGSourcesSectionProps {
  ragSources: RAGSource[];
}

export const RAGSourcesSection = ({ ragSources }: RAGSourcesSectionProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpanded(prev => !prev);
    }
  };

  return (
    <Box
      sx={{
        mt: 2,
        pt: 1.5,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${
          expanded ? 'Collapse' : 'Expand'
        } knowledge base sources`}
        sx={{
          ...getCollapsibleHeaderSx(),
          '&:hover': { opacity: 0.8 },
        }}
        onClick={() => setExpanded(prev => !prev)}
        onKeyDown={handleKeyDown}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: theme.palette.info.main,
            fontWeight: 600,
          }}
        >
          <DescriptionIcon sx={{ fontSize: 14 }} />
          {ragSources.length} source
          {ragSources.length > 1 ? 's' : ''} from Vector RAG
        </Typography>
        <IconButton size="small" sx={{ p: 0 }} aria-hidden="true">
          {expanded ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box
          sx={{
            mt: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {ragSources.map((source, index) => (
            <Box
              key={`${source.fileId || source.filename}-${index}`}
              sx={getRagSourceSx(theme)}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: source.text ? 0.5 : 0,
                }}
              >
                <DescriptionIcon
                  sx={{
                    fontSize: 16,
                    color: theme.palette.info.main,
                  }}
                />
                {isSafeUrl(source.sourceUrl) ? (
                  <Link
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      color: theme.palette.info.main,
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {source.title || source.filename || 'Unknown source'}
                    <OpenInNewIcon sx={{ fontSize: 12 }} />
                  </Link>
                ) : (
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.info.main,
                      flex: 1,
                    }}
                  >
                    {source.title || source.filename || 'Unknown source'}
                  </Typography>
                )}
              </Box>
              {source.text && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem',
                    lineHeight: 1.5,
                    display: 'block',
                    fontStyle: 'italic',
                    pl: 3,
                  }}
                >
                  "{source.text}"
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};
