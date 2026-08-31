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
import type { FC } from 'react';

import { useState, useEffect, memo } from 'react';

import Box from '@mui/material/Box';

import { Revision, RolloutUI } from '../../../../types/revision';
import BlueGreenRevision from './revisions/BlueGreenRevision';
import CanaryRevision from './revisions/CanaryRevision';
import MetadataItem from '../../../Common/MetadataItem';
import Metadata from '../../../Common/Metadata';
import { useTranslation } from '../../../../hooks/useTranslation';

interface RolloutProps {
  rollout: RolloutUI;
}

const Rollout: FC<RolloutProps> = ({ rollout }) => {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isFirstRender) {
      timer = setTimeout(() => {
        setIsFirstRender(false);
      }, 100);
    }

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rollout) {
    return null;
  }

  return (
    <Metadata>
      <MetadataItem
        title={t('deploymentLifecycle.sidebar.rollouts.rollOut.title')}
      >
        <Box
          sx={theme => ({
            flex: 1,
            gap: '10px',
            width: '100%',
            mt: '10px',
            p: 0,
            minHeight: 0,
            maxHeight: theme.spacing(40),
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'column',
            overflowX: 'auto',
            mb: 1,
          })}
        >
          {[...rollout.revisions].map((revision: Revision) => {
            return rollout.spec?.strategy?.canary ? (
              <CanaryRevision
                key={revision?.metadata?.uid}
                revision={revision}
                animateProgressBar={isFirstRender}
              />
            ) : (
              <BlueGreenRevision
                key={revision?.metadata?.uid}
                revision={revision}
              />
            );
          })}
        </Box>
      </MetadataItem>
    </Metadata>
  );
};
export default memo(Rollout);
