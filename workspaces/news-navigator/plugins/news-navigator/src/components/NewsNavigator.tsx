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

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { makeStyles, Grid } from '@material-ui/core';
import {
  Page,
  Header,
  Content,
  TabbedLayout,
  InfoCard,
  BottomLink,
  HeaderLabel,
} from '@backstage/core-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NewsNavigatorList } from './NewsNavigatorList';
import { NewsSearchBar } from './NewsSearchBar';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  content: {
    flexGrow: 1,
    paddingLeft: theme.spacing(12),
    paddingRight: theme.spacing(12),
  },
  toolbar: theme.mixins.toolbar,
  searchBarOutline: {
    marginBottom: theme.spacing(2),
  },
}));

const queryClient = new QueryClient();

export const NewsNavigator = () => {
  const classes = useStyles();
  const [searchText, setSearchText] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const location = useLocation();
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['category-news'] });
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <Page themeId="home">
        <Header
          title="News Navigator"
          subtitle="Explore, Search, and Stay Informed with the Latest Global Headlines"
        >
          <HeaderLabel
            label="Powered by"
            value={
              <a
                href="https://newsapi.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                NewsAPI
              </a>
            }
          />
        </Header>
        <Content>
          <Grid container justifyContent="center" className={classes.content}>
            <div className={classes.root}>
              <main className={classes.content}>
                <div className={classes.toolbar} />
                <InfoCard className={classes.searchBarOutline}>
                  <NewsSearchBar
                    searchText={searchText}
                    setSearchText={setSearchText}
                    setSearchSubmitted={setSearchSubmitted}
                    queryClient={queryClient}
                  />
                </InfoCard>
                {searchSubmitted ? (
                  <InfoCard>
                    <NewsNavigatorList keyword={searchText} />
                  </InfoCard>
                ) : (
                  <InfoCard>
                    <TabbedLayout>
                      {[
                        { path: '/', title: 'General' },
                        { path: '/science', title: 'Science' },
                        { path: '/technology', title: 'Technology' },
                        { path: '/health', title: 'Health' },
                        { path: '/sports', title: 'Sports' },
                        { path: '/business', title: 'Business' },
                        { path: '/entertainment', title: 'Entertainment' },
                      ].map(route => (
                        <TabbedLayout.Route
                          key={route.path}
                          path={route.path}
                          title={route.title}
                        >
                          <NewsNavigatorList
                            category={route.title.toLocaleLowerCase('en-US')}
                          />
                        </TabbedLayout.Route>
                      ))}
                    </TabbedLayout>
                  </InfoCard>
                )}
                <BottomLink
                  title="Powered by NewsAPI"
                  link="https://newsapi.org"
                />
              </main>
            </div>
          </Grid>
        </Content>
      </Page>
    </QueryClientProvider>
  );
};
