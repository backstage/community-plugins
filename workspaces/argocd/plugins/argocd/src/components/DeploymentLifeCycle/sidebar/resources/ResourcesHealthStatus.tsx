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

import { HealthStatus } from '@backstage-community/plugin-argocd-common';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';

import { AppHealthIcon } from '../../../AppStatus/StatusIcons';
import { argocdTranslationRef } from '../../../../translations/ref';
import { useTranslation } from '../../../../hooks/useTranslation';

interface ResourceHealthStatusProps {
  healthStatus: string;
}

const getHealthStatusTranslation = (
  status: HealthStatus,
  t: TranslationFunction<typeof argocdTranslationRef.T>,
) => {
  return t(`appStatus.appHealthStatus.${status}`);
};

export const ResourceHealthStatus: FC<ResourceHealthStatusProps> = ({
  healthStatus,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <AppHealthIcon status={healthStatus as HealthStatus} />{' '}
      {getHealthStatusTranslation(healthStatus as HealthStatus, t)}
    </>
  );
};
