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
import type { FC, ReactElement } from 'react';

import { useState, useContext } from 'react';

import { useApi } from '@backstage/core-plugin-api';
import { kubernetesProxyApiRef } from '@backstage/plugin-kubernetes-react';

import { V1Pod } from '@kubernetes/client-node';
import { createStyles, Link, makeStyles, Theme } from '@material-ui/core';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import classNames from 'classnames';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { ContainerScope } from '../../hooks/usePodLogsOfPipelineRun';
import { TektonResourcesContextData } from '../../types/types';
import { getPodLogs } from '../../utils/log-downloader-utils';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';
import { downloadLogFile } from '../../utils/download-log-file-utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    downloadAction: {
      position: 'relative',
      marginBottom: 'var(--pf-t--global--spacer--sm)',
      color: 'var(--pf-t--global--icon--color--100)',
      cursor: 'pointer',
    },
    buttonDisabled: {
      color: theme.palette.grey[400],
      cursor: 'not-allowed',
    },
  }),
);

const PodLogsDownloadLink: FC<{
  pods: V1Pod[];
  fileName: string;
  downloadTitle: string;
}> = ({ pods, fileName, downloadTitle, ...props }): ReactElement => {
  const classes = useStyles();
  const [downloading, setDownloading] = useState<boolean>(false);
  const kubernetesProxyApi = useApi(kubernetesProxyApiRef);
  const { t } = useTranslationRef(tektonTranslationRef);

  const { clusters, selectedCluster = 0 } =
    useContext<TektonResourcesContextData>(TektonResourcesContext);
  const currCluster = clusters.length > 0 ? clusters[selectedCluster] : '';

  const getLogs = (podScope: ContainerScope): Promise<{ text: string }> => {
    const { podName, podNamespace, containerName, clusterName } = podScope;
    return kubernetesProxyApi.getPodLogs({
      podName: podName,
      namespace: podNamespace,
      containerName: containerName,
      clusterName: clusterName,
    });
  };

  return (
    <Link
      component="button"
      variant="body2"
      underline="none"
      disabled={downloading}
      title={
        downloading
          ? t('pipelineRunLogs.podLogsDownloadLink.downloading')
          : downloadTitle
      }
      onClick={() => {
        setDownloading(true);
        getPodLogs(pods, getLogs, currCluster)
          .then((logs: string) => {
            setDownloading(false);
            downloadLogFile(logs || '', fileName);
          })
          .catch(err => {
            // eslint-disable-next-line no-console
            console.warn('Download failed', err);
            setDownloading(false);
          });
      }}
      className={classNames(classes.downloadAction, {
        [classes.buttonDisabled]: downloading,
      })}
      {...props}
    >
      <DownloadIcon style={{ verticalAlign: '-0.180em' }} />
      {downloadTitle || t('pipelineRunLogs.podLogsDownloadLink.title')}
    </Link>
  );
};
export default PodLogsDownloadLink;
