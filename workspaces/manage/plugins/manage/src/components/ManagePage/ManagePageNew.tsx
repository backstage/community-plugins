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

import { ComponentType, PropsWithChildren, ReactNode } from 'react';

import { useApi } from '@backstage/frontend-plugin-api';
import { Header, Page } from '@backstage/core-components';
import {
  manageApiRef,
  ManageDynamicConfig,
  ManageStaticConfig,
  OwnedProvider,
} from '@backstage-community/plugin-manage-react';

import { ManagePageFilters } from '../ManagePageFilters';
import { ManagePageInner } from './ManagePage';
import { usePrimeUserSettings } from './usePrimeUserSettings';

/**
 * Props for the {@link ManagePageNew} component.
 *
 * @internal
 */
export interface ManagePagePropsNew<SupportedKinds extends string> {
  /**
   * Any set of `<Header>` components for the page header.
   */
  labels?: JSX.Element[];

  /**
   * Set combined view on or off. Leave empty for a toggle in the header labels
   * section.
   */
  combined?: boolean;

  /**
   * Show the Combined toggle. Defaults to true unless combined is specified.
   */
  showCombined?: boolean;

  /**
   * Owner entity kinds to fetch
   */
  kinds?: SupportedKinds[];

  /**
   * Providers for custom manage page features
   */
  providers?: (
    | ComponentType<{ children?: ReactNode | undefined }>
    | {
        provider: ComponentType<{ children?: ReactNode | undefined }>;
        props: Record<string, unknown>;
      }
  )[];

  /** @internal */
  staticConfig: ManageStaticConfig;

  /** @internal */
  dynamicConfig: ManageDynamicConfig;
}

/**
 * The main page for for Manage plugin.
 *
 * @internal
 */
export function ManagePageNew<SupportedKinds extends string>(
  props: PropsWithChildren<ManagePagePropsNew<SupportedKinds>>,
) {
  const {
    combined,
    showCombined = typeof props.combined === 'undefined',
    labels,
    children,
    kinds,
    providers: propProviders = [],
    dynamicConfig,
    staticConfig,
  } = props;

  usePrimeUserSettings(dynamicConfig.primeUserSettings ?? []);

  const manageApi = useApi(manageApiRef);
  const providers = [...propProviders, ...manageApi.getProviders()];

  const labelsElements = [
    ...(labels ?? []),
    ...(showCombined ? [<ManagePageFilters key="combine-filter" />] : []),
  ];

  const headerComponent = (
    <Header
      title={staticConfig.title ?? 'Manage'}
      subtitle={staticConfig.subtitle ?? 'Things you own and work with'}
      children={labelsElements}
    />
  );

  return (
    <Page themeId={staticConfig.themeId ?? 'home'}>
      <OwnedProvider kinds={kinds}>
        <ManagePageInner
          combined={combined}
          headerComponent={headerComponent}
          providers={providers}
        >
          {children}
        </ManagePageInner>
      </OwnedProvider>
    </Page>
  );
}
