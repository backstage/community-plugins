/*
 * Copyright 2026 The Backstage Authors
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
import { useApi } from '@backstage/core-plugin-api';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import { Box, Chip, Typography } from '@material-ui/core';
import { growthbookFlagsApiRef } from '../api';

export function FlagDetailPanel({ flagKey }: { flagKey: string }) {
  const api = useApi(growthbookFlagsApiRef);
  const { value, loading, error } = useAsync(
    () => api.getFlagDetail(flagKey),
    [api, flagKey],
  );

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;
  if (!value) return null;

  return (
    <Box display="flex" flexDirection="column" gridGap={8}>
      <Box display="flex" alignItems="center" gridGap={8} flexWrap="wrap">
        {value.isStale && (
          <Chip
            size="small"
            color="secondary"
            label={`Stale${value.staleReason ? `: ${value.staleReason}` : ''}`}
          />
        )}
        {value.archived && <Chip size="small" label="Archived" />}
        {value.tags.map(tag => (
          <Chip key={tag} size="small" variant="outlined" label={tag} />
        ))}
      </Box>
      <Typography variant="body2" color="textSecondary">
        {value.owner ? `Owner: ${value.owner}` : 'No owner'}
        {value.dateUpdated && (
          <>
            {' · Last updated '}
            <span>{value.dateUpdated.slice(0, 10)}</span>
          </>
        )}
      </Typography>
      {value.environments.map(env => (
        <Box key={env.name}>
          <Box display="flex" alignItems="center" gridGap={8}>
            <Typography variant="subtitle2">{env.name}</Typography>
            <Chip
              size="small"
              color={env.enabled ? 'primary' : 'default'}
              label={env.enabled ? 'enabled' : 'disabled'}
            />
            <Typography variant="body2" color="textSecondary">
              {env.rules.length} rule{env.rules.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          {env.rules.map((rule, i) => (
            <Typography
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              variant="body2"
              color={rule.enabled ? 'textPrimary' : 'textSecondary'}
            >
              • {rule.type}
              {rule.description ? ` — ${rule.description}` : ''}
              {rule.enabled ? '' : ' (disabled)'}
            </Typography>
          ))}
        </Box>
      ))}
    </Box>
  );
}
