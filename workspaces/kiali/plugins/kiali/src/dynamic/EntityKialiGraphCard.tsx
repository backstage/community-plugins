/*
 * Copyright 2024 The Backstage Authors
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
import { CodeSnippet, EmptyState } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Box } from '@material-ui/core';
import { TrafficGraphCard } from '../pages/TrafficGraph/TrafficGraphCard';
import { KialiProvider } from '../store/KialiProvider';

export const EntityKialiGraphCard = () => {
  const { entity } = useEntity();

  return !entity ? (
    <EmptyState
      missing="data"
      title="No resources to show with these annotations"
      description={
        <>
          Kiali detected the annotations
          <div style={{ marginTop: '40px' }}>
            This is the entity loaded.
            <Box style={{ marginTop: '10px' }}>
              <CodeSnippet
                text={JSON.stringify(entity, null, 2)}
                language="yaml"
                showLineNumbers
                customStyle={{ background: 'inherit', fontSize: '115%' }}
              />
            </Box>
          </div>
        </>
      }
    />
  ) : (
    <KialiProvider entity={entity}>
      <TrafficGraphCard />
    </KialiProvider>
  );
};
