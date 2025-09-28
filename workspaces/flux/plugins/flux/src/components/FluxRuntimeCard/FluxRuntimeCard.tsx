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
import { FC } from 'react';
import { InfoCard } from '@backstage/core-components';
import { FluxRuntimeTable, defaultColumns } from './FluxRuntimeTable';
import { useGetDeployments } from '../../hooks/useGetDeployments';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const FluxRuntimePanel: FC<{ many?: boolean }> = ({ many }) => {
  const { data, isLoading, error } = useGetDeployments();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <InfoCard title="Flux runtime">
      <FluxRuntimeTable
        deployments={data || []}
        isLoading={isLoading || !data}
        columns={defaultColumns}
        many={many}
      />
    </InfoCard>
  );
};

/**
 * Render the Deployments in Flux Runtime.
 *
 * @public
 */
export const FluxRuntimeCard = ({ many = true }: { many?: boolean }) => {
  // Set both the garbage collection time and max-age to 1 hour
  // cacheTime should be higher than max-age to avoid removing things too soon.
  const cacheTime = 1000 * 60 * 60;
  const maxAge = cacheTime;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime,
      },
    },
  });

  const persister = createSyncStoragePersister({
    storage: window.localStorage,
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge }}
    >
      <FluxRuntimePanel many={many} />
    </PersistQueryClientProvider>
  );
};
