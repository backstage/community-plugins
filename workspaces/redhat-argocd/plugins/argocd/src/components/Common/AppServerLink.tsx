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
import { Application } from '@backstage-community/plugin-redhat-argocd-common';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { useTranslation } from '../../hooks/useTranslation';

interface AppServerLinkProps {
  application: Application;
}

const AppServerLink: FC<AppServerLinkProps> = ({ application }) => {
  const { t } = useTranslation();
  if (!application) {
    return null;
  }
  return (
    <Typography style={{ wordBreak: 'break-word' }}>
      {application?.spec?.destination?.server}{' '}
      {application?.spec?.destination?.server ===
      'https://kubernetes.default.svc' ? (
        <Tooltip
          title={t('common.appServer.title')}
          data-testid="local-cluster-tooltip"
        >
          <Typography>(in-cluster) </Typography>
        </Tooltip>
      ) : (
        ''
      )}
    </Typography>
  );
};

export default AppServerLink;
