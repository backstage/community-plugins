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
import {
  ComponentType,
  ReactNode,
  ComponentProps,
  PropsWithChildren,
} from 'react';

import { Content, Header, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  KindOrderProvider,
  manageApiRef,
  OwnedProvider,
} from '@backstage-community/plugin-manage-react';

import { ManagePageFilters } from '../ManagePageFilters/ManagePageFilters';
import { useManagePageCombined } from '../ManagePageFilters';

/**
 * Props for the {@link ManagePage} component.
 *
 * @public
 */
export interface ManagePageProps<SupportedKinds extends string> {
  /**
   * Any set of `<Header>` components for the page header. Defaults to a switch
   * of combined / not combined view unless
   * {@link ManagePageProps.combined | combined} is specified.
   */
  labels?: JSX.Element;

  /**
   * Custom page header. Can be set to `<></>` to remove the header completely.
   */
  header?: JSX.Element;

  /**
   * Set combined view on or off. Leave empty for a toggle in the header labels
   * section.
   */
  combined?: boolean;

  /**
   * Theme for the `<Page>` component.
   */
  themeId?: string;

  /**
   * Owner entity kinds to fetch
   */
  kinds?: SupportedKinds[];

  /**
   * Providers for custom manage page features
   */
  providers?: ComponentType<{ children?: ReactNode | undefined }>[];
}

/** @public */
export type HeaderProps = Partial<ComponentProps<typeof Header>>;

/**
 * The main page for for Manage plugin.
 *
 * @public
 */
export function ManagePageImpl<SupportedKinds extends string>(
  props: PropsWithChildren<ManagePageProps<SupportedKinds> & HeaderProps>,
) {
  const {
    combined,
    labels = typeof combined === 'undefined' ? <ManagePageFilters /> : <></>,
    header,
    themeId,
    children,
    kinds,
    providers: propProviders = [],
    ...headerProps
  } = props;

  // Initialize the state, set default value
  useManagePageCombined(combined);

  const manageApi = useApi(manageApiRef);
  const providers = [...propProviders, ...manageApi.getProviders()];

  const headerComponent = header ?? (
    <Header
      {...headerProps}
      title={headerProps.title ?? 'Manage'}
      subtitle={headerProps.subtitle ?? 'Things you own and work with'}
      children={labels}
    />
  );

  return (
    <Page themeId={themeId ?? 'home'}>
      {headerComponent}
      <Content noPadding>
        <KindOrderProvider>
          <OwnedProvider kinds={kinds}>
            {providers.reduce(
              (prev, Provider) => (
                <Provider children={prev} />
              ),
              children,
            )}
          </OwnedProvider>
        </KindOrderProvider>
      </Content>
    </Page>
  );
}
