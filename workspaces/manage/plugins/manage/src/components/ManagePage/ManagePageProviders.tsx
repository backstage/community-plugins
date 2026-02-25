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

import { useApi } from '@backstage/frontend-plugin-api';

import {
  OwnedProvider,
  KindOrderProvider,
  manageApiRef,
  ManageDynamicConfig,
} from '@backstage-community/plugin-manage-react';

import { useManagePageCombined } from '../ManagePageHeaderActions';
import { usePrimeUserSettings } from './usePrimeUserSettings';
import { TabsOrderProvider } from '../TabsOrder';

export interface ManagePageProvidersProps {
  kinds: string[];
  combined: boolean | undefined;
  providers: (
    | ComponentType<{ children?: ReactNode | undefined }>
    | {
        provider: ComponentType<{ children?: ReactNode | undefined }>;
        props: Record<string, unknown>;
      }
  )[];
  dynamicConfig: ManageDynamicConfig;
}

export function ManagePageProviders(
  props: PropsWithChildren<ManagePageProvidersProps>,
) {
  const {
    kinds,
    combined,
    providers: propProviders,
    dynamicConfig,
    children,
  } = props;

  // Initialize the user settings
  usePrimeUserSettings(dynamicConfig.primeUserSettings ?? []);

  // Initialize the state, set default value
  useManagePageCombined(combined);

  const manageApi = useApi(manageApiRef);
  const providers = [...propProviders, ...manageApi.getProviders()];

  return (
    <OwnedProvider kinds={kinds}>
      <KindOrderProvider>
        <TabsOrderProvider>
          {providers.reduce(
            (prev, Provider) =>
              'provider' in Provider ? (
                <Provider.provider {...Provider.props} children={prev} />
              ) : (
                <Provider children={prev} />
              ),
            <>{children}</>,
          )}
        </TabsOrderProvider>
      </KindOrderProvider>
    </OwnedProvider>
  );
}
