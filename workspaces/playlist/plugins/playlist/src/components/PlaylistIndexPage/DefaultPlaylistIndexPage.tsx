/*
 * Copyright 2023 The Backstage Authors
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
  PageWithHeader,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { Header } from '@backstage/ui';
import { CatalogFilterLayout } from '@backstage/plugin-catalog-react';

import { CreatePlaylistButton } from '../CreatePlaylistButton';
import { PersonalListPicker } from '../PersonalListPicker';
import { PlaylistList } from '../PlaylistList';
import { PlaylistOwnerPicker } from '../PlaylistOwnerPicker';
import { PlaylistSearchBar } from '../PlaylistSearchBar';
import { PlaylistSortPicker } from '../PlaylistSortPicker';
import { PlaylistListProvider } from '../../hooks/PlaylistListProvider';
import { useTitle } from '../../hooks/useTitle';

const DefaultPlaylistIndexPageContent = () => (
  <CatalogFilterLayout>
    <CatalogFilterLayout.Filters>
      <PlaylistSearchBar />
      <PersonalListPicker />
      <PlaylistOwnerPicker />
    </CatalogFilterLayout.Filters>
    <CatalogFilterLayout.Content>
      <PlaylistList />
    </CatalogFilterLayout.Content>
  </CatalogFilterLayout>
);

const DefaultPlaylistIndexPageActions = () => (
  <>
    <PlaylistSortPicker />
    <CreatePlaylistButton />
    <SupportButton />
  </>
);

/**
 * @public
 */
export const DefaultPlaylistIndexPage = () => {
  const pluralTitle = useTitle({
    pluralize: true,
    lowerCase: false,
  });

  return (
    <PageWithHeader themeId="home" title={pluralTitle}>
      <PlaylistListProvider>
        <Content>
          <ContentHeader title="">
            <DefaultPlaylistIndexPageActions />
          </ContentHeader>
          <DefaultPlaylistIndexPageContent />
        </Content>
      </PlaylistListProvider>
    </PageWithHeader>
  );
};

export const NfsDefaultPlaylistIndexPage = () => (
  <PlaylistListProvider>
    <Header title="" customActions={<DefaultPlaylistIndexPageActions />} />
    <Content>
      <DefaultPlaylistIndexPageContent />
    </Content>
  </PlaylistListProvider>
);
