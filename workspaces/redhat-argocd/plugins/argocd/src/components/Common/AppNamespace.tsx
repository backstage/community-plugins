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

import { Chip, Typography } from '@material-ui/core';
import { Flex, FlexItem } from '@patternfly/react-core';

import { Application } from '@backstage-community/plugin-redhat-argocd-common';

const AppNamespace: React.FC<{ app: Application }> = ({ app }) => {
  if (!app) {
    return null;
  }
  return (
    <Flex
      gap={{ default: 'gapNone' }}
      alignItems={{ default: 'alignItemsFlexStart' }}
    >
      <FlexItem>
        <Chip
          size="small"
          variant="default"
          color="primary"
          label="NS"
          style={{ background: 'green' }}
        />
      </FlexItem>
      <FlexItem>
        <Typography variant="body2" color="textSecondary">
          {app.spec.destination.namespace}{' '}
        </Typography>
      </FlexItem>
    </Flex>
  );
};

export default AppNamespace;
