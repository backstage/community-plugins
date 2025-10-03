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

import { Select, SelectedItems } from '@backstage/core-components';

import { makeStyles, Theme, Typography } from '@material-ui/core';

import './StatusSelector.css';

import { ComputedStatus } from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

const useStyles = makeStyles<Theme>(theme => ({
  label: {
    color: theme.palette.text.primary,
    fontSize: '1rem',
    paddingRight: '10px',
    fontWeight: 'bold',
  },
}));

export const StatusSelector = () => {
  const classes = useStyles();
  const { selectedStatus, setSelectedStatus } = useContext(
    TektonResourcesContext,
  );

  const onStatusChange = (status: SelectedItems) => {
    setSelectedStatus(status as ComputedStatus);
  };
  const { t } = useTranslationRef(tektonTranslationRef);
  const statusOptions = Object.entries(ComputedStatus)
    .sort(([keyA], [keyB]) => {
      if (keyA === keyB) {
        return 0;
      } else if (keyA < keyB) {
        return -1;
      }
      return 1;
    })
    .map(([key, value]) => ({
      value: key,
      label: t(`pipelineRunStatus.${key}` as any, { defaultValue: value }),
    }));

  return (
    <div className="bs-tkn-status-selector">
      <Typography className={classes.label}>
        {t('statusSelector.label')}
      </Typography>
      <Select
        onChange={onStatusChange}
        label=""
        items={statusOptions}
        selected={selectedStatus}
        margin="dense"
      />
    </div>
  );
};
