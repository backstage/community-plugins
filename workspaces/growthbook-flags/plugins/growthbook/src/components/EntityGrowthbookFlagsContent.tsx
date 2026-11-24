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
import { useEntity } from '@backstage/plugin-catalog-react';
import { Box, Tab, Tabs } from '@material-ui/core';
import { ExperimentsView } from './ExperimentsView';
import { FlagsView } from './FlagsView';
import { useExperiments } from './useExperiments';

/** @public */
export const GROWTHBOOK_ENABLED_ANNOTATION = 'growthbook.io/enabled';
/** @public */
export const GROWTHBOOK_ENV_ANNOTATION = 'growthbook.io/env';
/** @public */
export const GROWTHBOOK_PROJECT_ANNOTATION = 'growthbook.io/project';

/** @public */
export function isGrowthbookAvailable(entity: {
  metadata: { annotations?: Record<string, string> };
}) {
  return (
    entity.metadata.annotations?.[GROWTHBOOK_ENABLED_ANNOTATION] === 'true'
  );
}

type View = 'flags' | 'experiments';

/** @public */
export function EntityGrowthbookFlagsContent() {
  const { entity } = useEntity();
  const env =
    entity.metadata.annotations?.[GROWTHBOOK_ENV_ANNOTATION] ?? 'prod';
  const annotationProject =
    entity.metadata.annotations?.[GROWTHBOOK_PROJECT_ANNOTATION];

  const experiments = useExperiments(annotationProject);
  const [view, setView] = useState<View>('flags');
  const showTabs = experiments.length > 0;

  // The children below keep stable positions so FlagsView is never remounted
  // (and its data never refetched) when experiments load or the tab changes.
  return (
    <>
      {showTabs && (
        <Tabs
          value={view}
          onChange={(_event, next: View) => setView(next)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab value="flags" label="Flags" />
          <Tab
            value="experiments"
            label={`Experiments (${experiments.length})`}
          />
        </Tabs>
      )}
      <Box mt={showTabs ? 2 : 0} hidden={showTabs && view !== 'flags'}>
        <FlagsView env={env} annotationProject={annotationProject} />
      </Box>
      {showTabs && view === 'experiments' && (
        <Box mt={2}>
          <ExperimentsView experiments={experiments} />
        </Box>
      )}
    </>
  );
}
