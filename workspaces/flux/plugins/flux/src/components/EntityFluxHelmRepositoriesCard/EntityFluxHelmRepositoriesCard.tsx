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
import { useHelmRepositories } from '../../hooks';
import { FluxContext } from '../FluxContext';
import {
  helmDefaultColumns,
  FluxSourcesTable,
} from '../EntityFluxSourcesCard/FluxSourcesTable';
import { Source } from '../helpers';
import { FluxColumn } from '../FluxEntityTable';
import { Box } from '@backstage/ui';

const HelmRepositoriesPanel = ({ many }: { many?: boolean }) => {
  const { entity } = useEntity();
  const { data, loading, errors } = useHelmRepositories(entity);

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
    <Box>
      <FluxSourcesTable
        title="Helm Repositories"
        sources={data || []}
        isLoading={loading && !data}
        columns={helmDefaultColumns as FluxColumn<Source>[]}
        many={many}
      />
    </Box>
  );
};

/**
 * Render the HelmRepositories associated with the current Entity.
 *
 * @public
 */
export const EntityFluxHelmRepositoriesCard = ({
  many = true,
}: {
  many?: boolean;
}) => (
  <FluxContext>
    <HelmRepositoriesPanel many={many} />
  </FluxContext>
);
