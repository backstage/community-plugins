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
import { useContext, useState } from 'react';

import { Select, SelectedItems } from '@backstage/core-components';
import { BackstageTheme } from '@backstage/theme';

import { makeStyles, Typography } from '@material-ui/core';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';

import './ClusterSelector.css';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  label: {
    color: theme.palette.text.primary,
    fontSize: '1rem',
    paddingRight: '10px',
    fontWeight: 'bold',
  },
}));

export const ClusterSelector = () => {
  const classes = useStyles();
  const {
    clusters: k8sClusters,
    selectedCluster,
    setSelectedCluster: setClusterContext,
  } = useContext(TektonResourcesContext);
  const { t } = useTranslationRef(tektonTranslationRef);
  const clusterOptions = k8sClusters.map(cluster => ({
    value: cluster,
    label: cluster,
  }));

  const curCluster =
    selectedCluster && k8sClusters?.length > 0
      ? k8sClusters[selectedCluster]
      : k8sClusters?.[0];

  const [clusterSelected, setClusterSelected] =
    useState<SelectedItems>(curCluster);

  const onClusterChange = (arg: SelectedItems) => {
    const index = k8sClusters.findIndex(cluster => cluster === arg);
    setClusterContext(index);
    setClusterSelected(arg);
  };
  return (
    <div className="bs-tkn-cluster-selector">
      <Typography className={classes.label}>
        {t('clusterSelector.label')}
      </Typography>
      <Select
        onChange={onClusterChange}
        label=""
        items={clusterOptions}
        selected={clusterSelected}
        margin="dense"
      />
    </div>
  );
};
