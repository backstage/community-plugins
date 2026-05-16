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

import { ComponentType, ReactNode, PropsWithChildren } from 'react';

import { Content } from '@backstage/core-components';
import { KindOrderProvider } from '@backstage-community/plugin-manage-react';

import { useManagePageCombined } from '../ManagePageFilters';

export interface ManagePageInnerProps {
  combined: boolean | undefined;
  headerComponent: ReactNode;
  providers: (
    | ComponentType<{ children?: ReactNode | undefined }>
    | {
        provider: ComponentType<{ children?: ReactNode | undefined }>;
        props: Record<string, unknown>;
      }
  )[];
}

export function ManagePageInner(
  props: PropsWithChildren<ManagePageInnerProps>,
) {
  const { combined, headerComponent, providers, children } = props;

  // Initialize the state, set default value
  useManagePageCombined(combined);

  return (
    <KindOrderProvider>
      {providers.reduce(
        (prev, Provider) =>
          'provider' in Provider ? (
            <Provider.provider {...Provider.props} children={prev} />
          ) : (
            <Provider children={prev} />
          ),
        <>
          {headerComponent}
          <Content noPadding>{children}</Content>
        </>,
      )}
    </KindOrderProvider>
  );
}
