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
import { makeStyles, Theme, Grid, Paper } from '@material-ui/core';

import { CatalogSearchResultListItem } from '@backstage/plugin-catalog';

import { SearchType } from '@backstage/plugin-search';
import {
  SearchBar,
  SearchFilter,
  SearchResult,
  SearchPagination,
} from '@backstage/plugin-search-react';
import { CatalogIcon, Content, Header, Page } from '@backstage/core-components';
import {
  ConfluenceSearchResultListItem,
  ConfluenceSearchIcon,
} from '@backstage-community/plugin-confluence';

const useStyles = makeStyles((theme: Theme) => ({
  bar: {
    padding: theme.spacing(1, 0),
  },
  filters: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  filter: {
    '& + &': {
      marginTop: theme.spacing(2.5),
    },
  },
}));

const SearchPage = () => {
  const classes = useStyles();

  return (
    <Page themeId="home">
      <Header title="Search" />
      <Content>
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.bar}>
              <SearchBar />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <SearchType.Accordion
              name="Result Type"
              defaultValue="software-catalog"
              types={[
                {
                  value: 'software-catalog',
                  name: 'Software Catalog',
                  icon: <CatalogIcon />,
                },
                {
                  value: 'confluence',
                  name: 'Confluence',
                  icon: <ConfluenceSearchIcon />,
                },
              ]}
            />
            <Paper className={classes.filters}>
              <SearchFilter.Select
                className={classes.filter}
                label="Kind"
                name="kind"
                values={['Component', 'Template']}
              />
              <SearchFilter.Checkbox
                className={classes.filter}
                label="Lifecycle"
                name="lifecycle"
                values={['experimental', 'production']}
              />
            </Paper>
          </Grid>
          <Grid item xs={9}>
            <SearchPagination />
            <SearchResult>
              <CatalogSearchResultListItem icon={<CatalogIcon />} />
              <ConfluenceSearchResultListItem icon={<ConfluenceSearchIcon />} />
            </SearchResult>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export const searchPage = <SearchPage />;
