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
import { Grid } from '@material-ui/core';
import { SearchType } from '@backstage/plugin-search';
import { SearchResult, SearchPagination } from '@backstage/plugin-search-react';
import { Content, Header, Page } from '@backstage/core-components';
import { AnnouncementSearchResultListItem } from '@backstage-community/plugin-announcements';
import RecordVoiceOverOutlined from '@material-ui/icons/RecordVoiceOverOutlined';

const SearchPage = () => {
  return (
    <Page themeId="home">
      <Header title="Search" />
      <Content>
        <Grid container direction="row">
          <Grid item xs={3}>
            <SearchType.Accordion
              name="Result Type"
              defaultValue="announcements"
              types={[
                {
                  value: 'announcements',
                  name: 'Announcements',
                  icon: <RecordVoiceOverOutlined />,
                },
              ]}
            />
          </Grid>
          <Grid item xs={9}>
            <SearchPagination />
            <SearchResult>
              <AnnouncementSearchResultListItem />
            </SearchResult>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export const searchPage = <SearchPage />;
