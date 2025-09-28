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
import { useEntity } from '@backstage/plugin-catalog-react';
import { useFluxSources } from '../../hooks';
import { FluxSourcesTable, sourceDefaultColumns } from './FluxSourcesTable';
import { FluxContext } from '../FluxContext';
import { InfoCard, TableColumn } from '@backstage/core-components';
import { GitRepository, HelmRepository, OCIRepository } from '../../objects';

export type GH = GitRepository & HelmRepository;
export type OH = OCIRepository & HelmRepository;

const SourcesPanel = ({ many }: { many?: boolean }) => {
  const { entity } = useEntity();
  const { data, loading, errors } = useFluxSources(entity);

  if (errors) {
    return (
      <div>
        Errors:
        <ul>
          {errors.map(err => (
            <li>{err.message}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <InfoCard title="Sources">
      <FluxSourcesTable
        sources={data || []}
        isLoading={loading && !data}
        columns={sourceDefaultColumns as TableColumn<GH | OH>[]}
        many={many}
      />
    </InfoCard>
  );
};

/**
 * Render the Source associated with the current Entity.
 *
 * @public
 */
export const EntityFluxSourcesCard = ({ many = true }: { many?: boolean }) => (
  <FluxContext>
    <SourcesPanel many={many} />
  </FluxContext>
);
