/*
 * Copyright 2025 The Backstage Authors
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

import { useNavigate } from 'react-router-dom';

import { MarkdownContent } from '@backstage/core-components';
import type { Permission } from '@backstage/plugin-permission-common';
import { Button, Flex, Text } from '@backstage/ui';

import MissingPermissionImg from '../../../imgs/MissingPermission.svg';
import { useTranslation } from '../../../hooks/useTranslation';
import styles from './MissingPermissionPage.module.css';

type MissingPermissionPageProps = { permissions: Permission[] };

export const MissingPermissionPage = ({
  permissions,
}: MissingPermissionPageProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const permissionNames = `**${permissions
    .map(perm => perm.name)
    .join('**, **')}**`;

  const permissionText =
    permissions.length === 1
      ? t('permissions.permission')
      : t('permissions.permissions');

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Flex direction="column" className={styles.textColumn}>
          <Text variant="title-large">
            {t('permissions.missingPermission')}
          </Text>
          <Text variant="body-medium">
            <MarkdownContent
              content={t('permissions.missingPermissionDescription', {
                permissions: permissionNames,
                permissionText,
              })}
            />
          </Text>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {t('permissions.goBack')}
          </Button>
        </Flex>
        <img src={MissingPermissionImg} alt="" />
      </div>
    </div>
  );
};
