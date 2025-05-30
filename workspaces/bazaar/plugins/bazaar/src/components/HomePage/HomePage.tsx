/*
 * Copyright 2021 The Backstage Authors
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

import { Header, RoutedTabs } from '@backstage/core-components';
import { SortView } from '../SortView';
import { About } from '../About';
import { Entity } from '@backstage/catalog-model';
import { EntityFilterQuery } from '@backstage/catalog-client';

/** @public */
export type HomePageProps = {
  title?: string;
  subtitle?: string;
  fullWidth?: boolean;
  fullHeight?: boolean;
  /**
   * A list of catalog entities to display as entity page link options. If provided, this will take priority over the `filter` prop.
   */
  catalogEntities?: Entity[] | null;
  /**
   * An EntityFilterQuery used to filter catalog entities. Ignored if `catalogEntities` is provided.
   * Example:
   * {
      kind: ['Component'],
    }
   */
  filter?: EntityFilterQuery | undefined;
};

export const HomePage = (props: HomePageProps) => {
  const {
    title,
    subtitle,
    fullWidth,
    fullHeight,
    catalogEntities = null,
    filter = undefined,
  } = props;

  const tabContent = [
    {
      path: '/',
      title: 'Home',
      children: (
        <SortView
          fullWidth={fullWidth}
          fullHeight={fullHeight}
          allCatalogEntities={catalogEntities}
          filter={filter}
        />
      ),
    },
    {
      path: '/about',
      title: 'About',
      children: <About />,
    },
  ];

  return (
    <div>
      <Header
        title={title || 'Bazaar'}
        subtitle={subtitle || 'Marketplace for inner source projects'}
      />
      <RoutedTabs routes={tabContent} />
    </div>
  );
};
