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

import { Entity } from '@backstage/catalog-model';
import {
  useEntity,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';
import Grid from '@material-ui/core/Grid';
import { N8N_ANNOTATION } from '../constants';
import { N8nWorkflowsTable } from './N8nWorkflowsTable/N8nWorkflowsTable';
import { N8nExecutionTable } from './N8nExecutionTable/N8nExecutionTable';

/** @public */
export const isN8nAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[N8N_ANNOTATION]);

/** @public */
export const Router = () => {
  const { entity } = useEntity();

  if (!isN8nAvailable(entity)) {
    return <MissingAnnotationEmptyState annotation={N8N_ANNOTATION} />;
  }

  const workflowIds =
    entity.metadata.annotations?.[N8N_ANNOTATION]?.split(',').map(id =>
      id.trim(),
    ) ?? [];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <N8nWorkflowsTable />
      </Grid>
      {workflowIds.map(workflowId => (
        <Grid item xs={12} key={workflowId}>
          <N8nExecutionTable workflowId={workflowId} />
        </Grid>
      ))}
    </Grid>
  );
};
