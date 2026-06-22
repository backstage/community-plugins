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
import { useContext } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/icons-material/UnfoldLess';
import Expand from '@mui/icons-material/UnfoldMore';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

export const TableExpandCollapse = () => {
  const { isExpanded, setIsExpanded } = useContext(TektonResourcesContext);
  const { t } = useTranslationRef(tektonTranslationRef);

  const handleExpandCollaspse = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <Box sx={{ flexGrow: 1, textAlign: 'end' }}>
      <Tooltip title={t('tableExpandCollapse.collapseAll')} placement="top">
        <span>
          <IconButton
            onClick={() => handleExpandCollaspse()}
            disabled={!isExpanded}
            sx={{ padding: '2px' }}
          >
            <Collapse />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('tableExpandCollapse.expandAll')} placement="top">
        <span>
          <IconButton
            onClick={() => handleExpandCollaspse()}
            disabled={isExpanded}
            sx={{ padding: '2px' }}
          >
            <Expand />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};
