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
import React from 'react';

import { IconButton, makeStyles, Tooltip } from '@material-ui/core';
import Collapse from '@material-ui/icons/UnfoldLess';
import Expand from '@material-ui/icons/UnfoldMore';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translation';

const useStyles = makeStyles({
  expandCollapse: {
    flexGrow: 1,
    textAlign: 'end',
  },
  iconButton: {
    padding: '2px',
  },
});

export const TableExpandCollapse = () => {
  const classes = useStyles();
  const { isExpanded, setIsExpanded } = React.useContext(
    TektonResourcesContext,
  );
  const { t } = useTranslationRef(tektonTranslationRef);

  const handleExpandCollaspse = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <div className={classes.expandCollapse}>
      <Tooltip title={t('tableExpandCollapse.collapseAll')} placement="top">
        <span>
          <IconButton
            onClick={() => handleExpandCollaspse()}
            disabled={!isExpanded}
            className={classes.iconButton}
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
            className={classes.iconButton}
          >
            <Expand />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
