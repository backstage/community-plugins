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
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../api';
import { ComponentTab } from './ComponentTab';
import { useEntity } from '@backstage/plugin-catalog-react';
import { SystemTab } from './SystemTab';

/**
 * Entity tab component that displays Apiiro security insights for system and component entities.
 * Shows metrics, risks, and other security-related information for a specific entity.
 * @public
 */
export const ApiiroTab = () => {
  const { entity } = useEntity();
  return (
    <QueryClientProvider client={queryClient}>
      {entity.kind === 'Component' && <ComponentTab />}
      {entity.kind === 'System' && <SystemTab />}
    </QueryClientProvider>
  );
};
