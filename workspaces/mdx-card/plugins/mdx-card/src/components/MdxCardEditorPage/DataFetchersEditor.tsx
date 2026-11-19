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
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import type { DataFetcher } from '@backstage-community/plugin-mdx-card-common';

export const DataFetchersEditor = ({
  value,
  onChange,
}: {
  value: DataFetcher[];
  onChange: (value: DataFetcher[]) => void;
}) => {
  const update = (index: number, field: keyof DataFetcher, text: string) =>
    onChange(
      value.map((fetcher, i) =>
        i === index ? { ...fetcher, [field]: text } : fetcher,
      ),
    );

  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1">Data fetchers</Typography>
        <Button
          size="small"
          onClick={() =>
            onChange([
              ...value,
              { name: `data${value.length + 1}`, pluginId: '', apiUrl: '' },
            ])
          }
        >
          Add data fetcher
        </Button>
      </Stack>
      {value.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No data fetchers. Responses are available in the template as
          props.&lt;name&gt;.
        </Typography>
      )}
      {value.map((fetcher, index) => (
        <Stack key={index} direction="row" spacing={1} alignItems="center">
          <TextField
            label="Name"
            size="small"
            value={fetcher.name}
            onChange={e => update(index, 'name', e.target.value)}
            sx={{ width: 140 }}
          />
          <TextField
            label="Plugin ID"
            size="small"
            value={fetcher.pluginId}
            onChange={e => update(index, 'pluginId', e.target.value)}
            sx={{ width: 140 }}
          />
          <TextField
            label="API URL"
            size="small"
            value={fetcher.apiUrl}
            onChange={e => update(index, 'apiUrl', e.target.value)}
            fullWidth
          />
          <IconButton
            aria-label={`Remove data fetcher ${fetcher.name}`}
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
    </Stack>
  );
};
