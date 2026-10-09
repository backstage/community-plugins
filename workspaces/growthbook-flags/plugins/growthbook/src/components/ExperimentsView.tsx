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
import { useState } from 'react';
import {
  Chip,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import type {
  ExperimentRow,
  ExperimentStatus,
} from '@backstage-community/plugin-growthbook-common';
import { ExperimentResultsPanel } from './ExperimentResultsPanel';

const STATUS_COLOURS: Record<ExperimentStatus, 'default' | 'primary'> = {
  draft: 'default',
  running: 'primary',
  stopped: 'default',
};

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : '—';

function ExperimentTableRow({ experiment }: { experiment: ExperimentRow }) {
  const [open, setOpen] = useState(false);
  const started = experiment.phases[0]?.dateStarted;
  const ended = experiment.phases[experiment.phases.length - 1]?.dateEnded;
  const winner = experiment.variations.find(
    v => v.id === experiment.winnerVariationId,
  );

  return (
    <>
      <TableRow>
        <TableCell padding="checkbox">
          <IconButton
            size="small"
            aria-label={`${open ? 'Hide' : 'Show'} results for ${
              experiment.name
            }`}
            onClick={() => setOpen(o => !o)}
          >
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Link href={experiment.url} target="_blank" rel="noopener noreferrer">
            {experiment.name}
          </Link>
        </TableCell>
        <TableCell>
          <Chip
            size="small"
            label={experiment.status}
            color={STATUS_COLOURS[experiment.status]}
          />
        </TableCell>
        <TableCell>{experiment.variations.length}</TableCell>
        <TableCell>{formatDate(started)}</TableCell>
        <TableCell>{formatDate(ended)}</TableCell>
        <TableCell>{winner?.name ?? '—'}</TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell />
          <TableCell colSpan={6}>
            <ExperimentResultsPanel experiment={experiment} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function ExperimentsView({
  experiments,
}: {
  experiments: ExperimentRow[];
}) {
  return (
    <>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {experiments.length} experiment{experiments.length !== 1 ? 's' : ''}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Variations</strong>
              </TableCell>
              <TableCell>
                <strong>Started</strong>
              </TableCell>
              <TableCell>
                <strong>Ended</strong>
              </TableCell>
              <TableCell>
                <strong>Winner</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {experiments.map(e => (
              <ExperimentTableRow key={e.id} experiment={e} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
