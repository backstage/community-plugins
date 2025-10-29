/* eslint-disable no-restricted-imports */
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
import { ReportPortalDocument } from '@backstage-community/plugin-report-portal-common';
import { Link } from '@backstage/core-components';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { ResultHighlight } from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import {
  Box,
  Chip,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';

/** @public */
export type ReportPortalSearchResultItemProps = {
  result?: ReportPortalDocument;
  icon?: React.ReactNode;
  rank?: number;
  highlight?: ResultHighlight;
};

export const ReportPortalSearchResultItem = (
  props: ReportPortalSearchResultItemProps,
) => {
  const { result, icon, highlight } = props;

  if (!result) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <Box>
        <ListItemText
          primaryTypographyProps={{ variant: 'h6' }}
          primary={
            <Link to={result.location}>
              {highlight?.fields?.title ? (
                <HighlightedSearchResultText
                  text={highlight.fields.title}
                  preTag={highlight.preTag}
                  postTag={highlight.postTag}
                />
              ) : (
                result.title
              )}
            </Link>
          }
          secondary={
            <Typography
              component="span"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 5,
                overflow: 'hidden',
              }}
              color="textSecondary"
              variant="body2"
            >
              {highlight?.fields?.text ? (
                <HighlightedSearchResultText
                  text={highlight.fields.text}
                  preTag={highlight.preTag}
                  postTag={highlight.postTag}
                />
              ) : (
                result.text
              )}
            </Typography>
          }
        />
        <Box>
          {result.resourceType && (
            <Chip label={`Type: ${result.resourceType}`} size="small" />
          )}
          {result.projectName && (
            <Chip label={`Project: ${result.projectName}`} size="small" />
          )}
          {result.host && <Chip label={`Host: ${result.host}`} size="small" />}
          {result.entityRef && (
            <Chip
              label={<EntityRefLink entityRef={result.entityRef} />}
              size="small"
              clickable
            />
          )}
        </Box>
      </Box>
    </div>
  );
};
